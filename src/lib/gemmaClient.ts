import localforage from 'localforage';

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DomTelemetryItem {
  badgeId: number;
  tagName: string;
  className: string;
  id: string;
  textSnippet: string;
  rect: BoundingRect;
}

export interface AuditViolation {
  badgeIds: number[];
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: 'OVERLAP' | 'SPEC_VIOLATION' | 'LAYOUT_BREAK' | 'ACCESSIBILITY';
  description: string;
}

export interface AuditResult {
  passed: boolean;
  summary: string;
  violations: AuditViolation[];
  suggestedPatch: {
    explanation: string;
    html: string;
    css: string;
  };
  _fromCache?: boolean;
  _cacheKey?: string;
}

const auditCache = localforage.createInstance({
  name: 'PixelVisionWorkbench',
  storeName: 'multimodal_audits',
  description: 'IndexedDB cache for Set-of-Mark UI audits',
});

async function computeSha256Hash(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function analyzeWebpage(
  imageBase64: string,
  domTelemetry: DomTelemetryItem[],
  specText: string,
  htmlCode: string,
  cssCode: string
): Promise<AuditResult> {
  const rawCompositePayload = `${imageBase64}|${JSON.stringify(domTelemetry)}|${specText}|${htmlCode.length}|${cssCode.length}`;
  const hashKey = await computeSha256Hash(rawCompositePayload);

  try {
    const cachedResult = await auditCache.getItem<AuditResult>(hashKey);
    if (cachedResult !== null) {
      return { ...cachedResult, _fromCache: true, _cacheKey: hashKey };
    }
  } catch (err) {
    console.warn('Cache read failed:', err);
  }

  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, domTelemetry, specText, htmlCode, cssCode }),
  });

  if (!response.ok) {
    let errorDetails = `HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorDetails = errorJson.error;
    } catch {}
    throw new Error(`Audit API failed: ${errorDetails}`);
  }

  const result: AuditResult = await response.json();

  try {
    await auditCache.setItem(hashKey, result);
  } catch (err) {
    console.warn('Cache write failed:', err);
  }

  return { ...result, _fromCache: false, _cacheKey: hashKey };
}

export async function clearAuditCache(): Promise<void> {
  await auditCache.clear();
}