import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are PixelVision, an elite Multimodal UI Verification Engine powered by Gemma 4.

Your task is to cross-reference a Set-of-Mark UI screenshot against the DOM telemetry and Product Spec to detect visual bugs (overlaps, layout breaks, clipping, touch-target failures).

Respond ONLY with a valid raw JSON object matching this schema:
{
  "passed": boolean,
  "summary": "Executive summary.",
  "violations": [
    {
      "badgeIds": [number],
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "type": "OVERLAP" | "SPEC_VIOLATION" | "LAYOUT_BREAK",
      "description": "Explanation of what is visually wrong."
    }
  ],
  "suggestedPatch": {
    "explanation": "How the patch fixes the issues.",
    "html": "",
    "css": "The exact CSS rules to append to fix the issue globally."
  }
}`;

interface AuditRequestBody {
  imageBase64?: string;
  domTelemetry?: unknown;
  specText?: string;
}

const GEMMA_ATTEMPTS = [
  { model: 'gemma-4-31b-it', useThinking: false },
  { model: 'gemma-4-26b-a4b-it', useThinking: false },
  { model: 'gemma-4-26b-a4b-it', useThinking: true },
] as const;

function compactTelemetry(rawTelemetry: unknown): unknown {
  if (!Array.isArray(rawTelemetry)) return rawTelemetry;
  return rawTelemetry.slice(0, 40).map((item: Record<string, unknown>) => {
    const compacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(item)) {
      if (typeof val === 'string') {
        compacted[key] = val.length > 100 ? `${val.slice(0, 100)}…` : val;
      } else if (typeof val === 'number') {
        compacted[key] = Math.round(val);
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        const roundedObj: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
          roundedObj[k] = typeof v === 'number' ? Math.round(v) : v;
        }
        compacted[key] = roundedObj;
      } else {
        compacted[key] = val;
      }
    }
    return compacted;
  });
}

function parseAuditJson(rawText: string) {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  const jsonSlice =
    startIdx !== -1 && endIdx !== -1 && endIdx > startIdx
      ? cleaned.slice(startIdx, endIdx + 1)
      : cleaned;

  const repaired = jsonSlice.replace(/,\s*([}\]])/g, '$1');
  const parsed = JSON.parse(repaired);

  return {
    passed: Boolean(parsed.passed),
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'Audit completed.',
    violations: Array.isArray(parsed.violations) ? parsed.violations : [],
    suggestedPatch: parsed.suggestedPatch || {
      explanation: 'No automated patch required.',
      html: '',
      css: '',
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY missing.');

    const body = (req.body || {}) as AuditRequestBody;
    if (!body.imageBase64 || !body.domTelemetry) throw new Error('Missing payload.');

    const mimeMatch = body.imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const cleanBase64 = body.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

    const slimTelemetry = compactTelemetry(body.domTelemetry);
    const genAI = new GoogleGenAI({ apiKey });

    const fullPrompt = `${SYSTEM_INSTRUCTION}

### PRODUCT SPECIFICATION
${body.specText || 'Audit for visual overlaps, clipping, and layout defects.'}

### DETERMINISTIC DOM TELEMETRY (SET-OF-MARK MAPPING)
${JSON.stringify(slimTelemetry)}

Return ONLY the valid JSON object.`;

    let rawText = '';
    let lastError: unknown = null;

    for (const attempt of GEMMA_ATTEMPTS) {
      try {
        console.info(
          `[PixelVision] Auditing with ${attempt.model} (thinking=${attempt.useThinking})...`
        );
        const response = await genAI.models.generateContent({
          model: attempt.model,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: cleanBase64 } },
                { text: fullPrompt },
              ],
            },
          ],
          config: {
            temperature: 0.1,
            thinkingConfig: attempt.useThinking
              ? { thinkingLevel: ThinkingLevel.LOW }
              : undefined,
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        rawText =
          parts
            .filter((p) => !('thought' in p && p.thought === true))
            .map((p) => p.text || '')
            .join('\n')
            .trim() ||
          response.text ||
          '';

        if (rawText) break;
      } catch (err) {
        console.warn(`[PixelVision] Attempt failed for ${attempt.model}:`, err);
        lastError = err;
      }
    }

    if (!rawText) throw lastError || new Error('Gemma 4 failed to respond.');

    const normalizedResult = parseAuditJson(rawText);
    return res.status(200).json(normalizedResult);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Audit failed.';
    return res.status(500).json({ error: msg });
  }
}