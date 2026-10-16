import { useState, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  FileText,
  Database,
  Wand2,
  Trash2,
  Terminal,
  Globe,
  Download,
  Layers,
} from 'lucide-react';
import { SandboxRenderer } from './components/SandboxRenderer';
import {
  analyzeWebpage,
  clearAuditCache,
  type DomTelemetryItem,
  type AuditResult,
} from './lib/gemmaClient';

interface DemoPreset {
  id: string;
  label: string;
  html: string;
  css: string;
  spec: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'pricing-overlap',
    label: 'Preset 1: Pricing Card Overlap',
    html: `<div class="card-container p-5 bg-slate-50 rounded-2xl border border-slate-200 relative max-w-sm mx-auto mt-4">
  <span class="promo-pill bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
    LIMITED FLASH DEAL
  </span>

  <h2 class="price-heading text-3xl font-extrabold text-slate-900 mt-1">
    $49.99 / mo
  </h2>

  <p class="text-sm text-slate-600 mt-2 leading-relaxed">
    Unlock full multimodal DOM telemetry, automated visual regression checks, and instant code patches.
  </p>

  <div class="mt-4 flex items-center justify-between">
    <button class="cta-btn bg-indigo-600 text-white text-xs px-3 py-1 rounded">
      Claim Offer Now
    </button>
    <a href="#terms" class="terms-link text-xs text-slate-400 underline">
      Cancel anytime
    </a>
  </div>
</div>`,
    css: `.promo-pill {
  position: absolute;
  top: 22px;
  left: 24px;
  z-index: 10;
}

.price-heading {
  position: relative;
  margin-top: 2px;
}

.cta-btn {
  height: 26px;
}

.terms-link {
  margin-left: -28px;
}`,
    spec: `1. No text or badge elements may visually overlap. The "LIMITED FLASH DEAL" promo pill must sit cleanly above the "$49.99 / mo" price heading with at least 8px vertical separation.
2. The primary "Claim Offer Now" button (.cta-btn) must be full-width (100% width) and have a minimum touch-target height of 44px.
3. The "Cancel anytime" link must be centered below the primary CTA button, not overlapping or beside it.`,
  },
  {
    id: 'navbar-collision',
    label: 'Preset 2: Mobile Navbar Collision',
    html: `<header class="nav-bar bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between relative">
  <div class="logo font-black text-lg tracking-tight">HackDayBLR</div>
  <nav class="nav-links flex gap-4 text-xs text-slate-300">
    <a href="#tracks">Tracks</a>
    <a href="#prizes">Prizes</a>
    <a href="#schedule">Schedule</a>
    <a href="#sponsors">Sponsors</a>
  </nav>
  <button class="rsvp-btn bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded">
    RSVP Now
  </button>
</header>
<section class="hero mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
  <h1 class="text-xl font-bold text-slate-900">Hacktoberfest Bengaluru 2026</h1>
  <p class="text-xs text-slate-600 mt-1">Build with Gemma 4 multimodal intelligence at Startup Park.</p>
</section>`,
    css: `.nav-links {
  position: absolute;
  left: 95px;
  white-space: nowrap;
}
.rsvp-btn {
  z-index: 20;
  height: 24px;
}`,
    spec: `1. Navigation links must never collide with or overlap the "RSVP Now" button on mobile viewports.
2. The "RSVP Now" button must have a minimum touch target height of 40px.
3. On narrow viewports, the header should stack or wrap cleanly so all links and buttons remain completely legible.`,
  },
];

interface FetchUrlResponse {
  url: string;
  title: string;
  html: string;
  css: string;
  error?: string;
}

export function App() {
  const [htmlCode, setHtmlCode] = useState<string>(DEMO_PRESETS[0].html);
  const [cssCode, setCssCode] = useState<string>(DEMO_PRESETS[0].css);
  const [specText, setSpecText] = useState<string>(DEMO_PRESETS[0].spec);

  const [urlInput, setUrlInput] = useState<string>('https://pixelblast.vercel.app');
  const [activeSourceUrl, setActiveSourceUrl] = useState<string | undefined>(undefined);
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [importedTitle, setImportedTitle] = useState<string | null>(null);

  const [imageBase64, setImageBase64] = useState<string>('');
  const [domTelemetry, setDomTelemetry] = useState<DomTelemetryItem[]>([]);
  const [showRawTelemetry, setShowRawTelemetry] = useState<boolean>(false);

  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTelemetryReady = useCallback(
    (capturedBase64: string, telemetry: DomTelemetryItem[]) => {
      setImageBase64(capturedBase64);
      setDomTelemetry(telemetry);
    },
    []
  );

  const handleFetchLiveUrl = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl ?? urlInput).trim();
    if (!urlToFetch) return;

    setImageBase64('');
    setDomTelemetry([]);
    setIsFetchingUrl(true);
    setErrorMessage(null);
    setAuditResult(null);

    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = (await response.json()) as FetchUrlResponse;
      if (!response.ok || data.error) {
        throw new Error(data.error || `Failed to import URL (HTTP ${response.status})`);
      }

      setHtmlCode(data.html);
      setCssCode(data.css);
      setActiveSourceUrl(data.url);
      setImportedTitle(data.title);
      setSpecText(
        `Audit the live imported webpage (${data.title} - ${data.url}) for:\n1. Zero visual overlapping between text, badges, navigation links, or buttons.\n2. Interactive buttons and links must have adequate spacing and touch-target sizing (minimum 36px-44px height) without clipping or horizontal overflow.\n3. Clear visual hierarchy and readable contrast across all badged sections.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to import live URL.';
      setErrorMessage(`Live URL Import Error: ${msg}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setActiveSourceUrl(undefined);
    setImportedTitle(null);
    setHtmlCode(preset.html);
    setCssCode(preset.css);
    setSpecText(preset.spec);
    setAuditResult(null);
    setErrorMessage(null);
  };

  const handleRunAudit = async () => {
    if (!imageBase64 || domTelemetry.length === 0) {
      setErrorMessage('Sandbox telemetry is still initializing. Wait a moment or click Re-Badge.');
      return;
    }

    setIsAuditing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeWebpage(imageBase64, domTelemetry, specText, htmlCode, cssCode);
      setAuditResult(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to complete multimodal audit.';
      setErrorMessage(message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyPatch = () => {
    if (!auditResult?.suggestedPatch) return;
    const patch = auditResult.suggestedPatch;

    if (patch.css && patch.css.trim().length > 0) {
      setCssCode((prev) => `${prev}\n\n/* --- Gemma 4 Remediation Patch --- */\n${patch.css}`);
    }

    if (patch.html && patch.html.trim().length > 0) {
      if (activeSourceUrl && patch.html.length < htmlCode.length * 0.5) {
        console.warn('PixelVision: Ignored partial HTML patch for live URL to prevent document destruction. Relying on CSS append.');
      } else {
        setHtmlCode(patch.html);
      }
    }
  };

  const handleClearCache = async () => {
    await clearAuditCache();
    setAuditResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-50">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-950/90 backdrop-blur flex-wrap gap-3 elevation-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/30 flex-highlight">
            PV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="typography-h1 text-white">PixelVision</h1>
              <span className="typography-label text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                Gemma 4 Set-of-Mark Workbench
              </span>
            </div>
            <p className="typography-body text-xs text-gray-400">
              Deterministic DOM Telemetry + Gemma 4 (31B / 26B) Multimodal Spec Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 transition cursor-pointer interactive-element"
            >
              <Layers className="w-3.5 h-3.5 text-red-400" />
              {preset.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowRawTelemetry((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 transition cursor-pointer interactive-element"
          >
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            {showRawTelemetry ? 'Hide Telemetry' : `Telemetry (${domTelemetry.length})`}
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-red-950/50 text-gray-400 hover:text-red-300 border border-gray-700 transition cursor-pointer interactive-element"
            title="Purge IndexedDB SHA-256 Cache"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cache
          </button>
        </div>
      </header>

      <div className="px-6 py-2.5 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <Globe className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-300 shrink-0">
            Import Live Website URL:
          </span>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFetchLiveUrl();
            }}
            placeholder="https://your-deployed-app.vercel.app or any live URL..."
            className="flex-1 max-w-xl px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-600 text-xs text-gray-100 font-mono focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={() => handleFetchLiveUrl()}
            disabled={isFetchingUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow"
          >
            <Download className={`w-3.5 h-3.5 ${isFetchingUrl ? 'animate-bounce' : ''}`} />
            {isFetchingUrl ? 'Harvesting DOM & CSS...' : 'Fetch Live URL'}
          </button>
        </div>

        {importedTitle && activeSourceUrl && (
          <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/40 border border-red-800/60 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Imported: <strong className="font-semibold">{importedTitle}</strong>
          </div>
        )}
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        <section className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex flex-col flex-1 layout-card elevation-2">
            <div className="layout-card-header">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-red-400" />
                HTML / Extracted DOM Markup
              </span>
              <span className="typography-label text-[11px] font-mono text-slate-500">Editable</span>
            </div>
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              spellCheck={false}
              className="flex-1 min-h-[145px] p-3 bg-gray-900 text-gray-200 font-mono text-xs leading-relaxed focus:outline-none resize-y"
              placeholder="Paste HTML structure or fetch a live URL above..."
            />
          </div>

          <div className="flex flex-col flex-1 layout-card elevation-2">
            <div className="layout-card-header">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-red-400" />
                CSS Stylesheet (Inline + Extracted)
              </span>
              <span className="typography-label text-[11px] font-mono text-slate-500">Editable</span>
            </div>
            <textarea
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              spellCheck={false}
              className="flex-1 min-h-[135px] p-3 bg-gray-900 text-gray-200 font-mono text-xs leading-relaxed focus:outline-none resize-y"
              placeholder="Paste custom CSS rules..."
            />
          </div>

          <div className="flex flex-col flex-1 layout-card elevation-2">
            <div className="layout-card-header">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                Product Spec & Visual Verification Rules
              </span>
              <span className="typography-label text-[11px] font-mono text-slate-500">Ground Truth</span>
            </div>
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              className="flex-1 min-h-[125px] p-3 bg-gray-900 text-gray-200 text-xs leading-relaxed focus:outline-none resize-y"
              placeholder="Describe visual requirements, spacing rules, and layout hierarchy..."
            />
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-[520px] layout-card elevation-2">
            <SandboxRenderer
              htmlCode={htmlCode}
              cssCode={cssCode}
              sourceUrl={activeSourceUrl}
              onTelemetryReady={handleTelemetryReady}
            />
          </div>

          {showRawTelemetry && (
            <div className="max-h-44 layout-card elevation-1">
              <div className="text-xs font-semibold text-red-400 mb-1">
                Live Set-of-Mark DOM Telemetry:
              </div>
              <pre>{JSON.stringify(domTelemetry, null, 2)}</pre>
            </div>
          )}

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing || !imageBase64}
            className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-red-600/25 transition cursor-pointer interactive-element"
          >
            <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing
              ? 'Running Gemma 4 High-Thinking Multimodal Audit...'
              : 'Run Gemma 4 Multimodal Audit'}
          </button>
        </section>

        <section className="lg:col-span-4 flex flex-col layout-card elevation-2 overflow-hidden h-full">
          <div className="layout-card-header">
            <span>Gemma 4 Verification Report</span>
            {auditResult?._fromCache !== undefined && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  auditResult._fromCache
                    ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                    : 'bg-gray-500/15 text-gray-300 border border-gray-500/30'
                }`}
              >
                <Database className="w-3 h-3" />
                {auditResult._fromCache ? 'IndexedDB Cache HIT (0 Quota)' : 'Live Gemma 4 API'}
              </span>
            )}
          </div>

          <div className="layout-card-content p-4 overflow-y-auto space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-lg border border-red-700 bg-red-950/60 text-red-200 text-xs flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-0.5">Execution Notice</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {isAuditing && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                <div className="text-sm font-medium text-gray-200">
                  Cross-referencing Set-of-Mark Badges with DOM Bounding Boxes...
                </div>
                <p className="text-xs text-gray-400 max-w-xs">
                  Gemma 4 (ThinkingLevel.HIGH) is inspecting visual overlaps and validating your product spec.
                </p>
              </div>
            )}

            {!isAuditing && !auditResult && !errorMessage && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-2">
                <Sparkles className="w-8 h-8 text-gray-600 stroke-1" />
                <p className="text-sm font-medium text-gray-400">Ready for Verification</p>
                <p className="text-xs max-w-xs">
                  Import any live website URL above or pick a preset, then click{' '}
                  <strong className="text-gray-300">Run Gemma 4 Multimodal Audit</strong>.
                </p>
              </div>
            )}

            {!isAuditing && auditResult && (
              <>
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    auditResult.passed
                      ? 'bg-red-950/40 border-red-800/80 text-red-200'
                      : 'bg-gray-950/40 border-gray-800/80 text-gray-200'
                  }`}
                >
                  {auditResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sm">
                      {auditResult.passed
                        ? 'PASSED: UI Matches Product Spec'
                        : `FAILED: ${auditResult.violations?.length || 0} Visual-Semantic Violations`}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{auditResult.summary}</p>
                  </div>
                </div>

                {auditResult.violations && auditResult.violations.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Detected Badge Violations
                    </h3>
                    {auditResult.violations.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-gray-950/90 border border-gray-700 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {v.badgeIds?.map((id) => (
                              <span
                                key={id}
                                className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[11px] font-bold shadow"
                              >
                                Badge #{id}
                              </span>
                            ))}
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-600 text-gray-300">
                              {v.type}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              v.severity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}
                          >
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{v.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {auditResult.suggestedPatch && (
                  <div className="space-y-2.5 pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                        Suggested Remediation Patch
                      </h3>
                      <button
                        type="button"
                        onClick={handleApplyPatch}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer shadow interactive-element"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Apply Patch to Editor
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      {auditResult.suggestedPatch.explanation}
                    </p>

                    {auditResult.suggestedPatch.css && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-red-400">Patched CSS:</div>
                        <pre className="p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-[11px] font-mono text-gray-200 overflow-x-auto">
                          {auditResult.suggestedPatch.css}
                        </pre>
                      </div>
                    )}

                    {auditResult.suggestedPatch.html && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-red-400">Patched HTML:</div>
                        <pre className="p-2.5 rounded-lg bg-gray-950 border border-gray-700 text-[11px] font-mono text-gray-200 overflow-x-auto">
                          {auditResult.suggestedPatch.html}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;