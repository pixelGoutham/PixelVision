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
  html?: string;
  css?: string;
  spec?: string;
  url?: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'tharunspeaks-pricing',
    label: 'Tharun Speaks - Pricing Cards',
    url: 'https://tharunspeaks.in/',
    html: `<!-- Extracted from https://tharunspeaks.in/ pricing section -->
<section class="section" id="pricing">
  <h2>The Best Prices Ever</h2>
  <p>Pick your plan and start EDITING today. One flat fee.</p>
  <div class="grid pricing-grid">
    <div class="card">
      <h3>ESSENTIAL</h3>
      <div class="price">₹4,999</div>
      <p>+GST</p>
      <p>For students passionate about video editing</p>
      <ul>
        <li>Studio Quality Lectures</li>
        <li>Weekly 2 live classes</li>
        <li>Access to the community</li>
      </ul>
      <a href="#" class="cta">Join Now</a>
    </div>
    <div class="card">
      <h3>ELITE</h3>
      <div class="price">₹6,999</div>
      <p>+GST</p>
      <p>Most popular</p>
      <p>For creative minds eager to excel in Video Editing, Design & Content Creation</p>
      <ul>
        <li>Everything In Essential</li>
        <li>Dedicated Mentors</li>
        <li>Weekly Social Media Masterclasses</li>
        <li>Edit Battles, Community Games & Challenges</li>
        <li>Video Editing Assets worth ₹5,000</li>
      </ul>
      <a href="#" class="cta">Join Now</a>
    </div>
    <div class="card">
      <h3>ULTIMATE</h3>
      <div class="price">₹14,999</div>
      <p>+GST</p>
      <p>For students serious about building a career in Creative Industry</p>
      <ul>
        <li>Everything in Elite</li>
        <li>Personal Learning Manager</li>
        <li>Access to placement worth ₹30k/Month</li>
        <li>Special Group with Tharun</li>
        <li>Video Editing Assets worth ₹10,000</li>
      </ul>
      <a href="#" class="cta">Join Now</a>
    </div>
  </div>
</section>`,
    css: `:root { --primary:#ff6b6b; --bg:#fff; --muted:#555; }
body{margin:0;font-family:Arial,sans-serif;background:#f9f9f9;color:#222}
.section{padding:2rem;max-width:1100px;margin:auto}
.grid{display:grid;gap:1.5rem}
.pricing-grid{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.1);}
.card h3{margin-top:0;color:var(--primary)}
.price{font-size:1.8rem;margin:.5rem 0;color:#222}
.cta{display:inline-block;padding:.8rem 1.5rem;background:#fff;color:var(--primary);
      border-radius:4px;text-decoration:none;font-weight:bold}
.cta:hover{opacity:0.9}`,
    spec: `1. The pricing cards should be evenly spaced with adequate gaps between them (minimum 24px).
2. Each "Join Now" button must have a minimum touch-target height of 44px and adequate contrast.
3. The price text (₹4,999, ₹6,999, ₹14,999) should be clearly readable and not overlap with other elements.
4. The "+GST" text should be positioned clearly below the price without overlapping.
5. On mobile viewports, the cards should stack vertically with proper spacing.`,
  },
  {
    id: 'apple-hero',
    label: 'Apple.com - iPhone Hero Section',
    url: 'https://www.apple.com/',
    html: `<!-- Extracted from https://www.apple.com/ hero section -->
<header>
  <a href="/" title="Apple">Apple</a>
  <nav>
    <ul>
      <li><a href="/mac/">Mac</a></li>
      <li><a href="/ipad/">iPad</a></li>
      <li><a href="/iphone/">iPhone</a></li>
    </ul>
  </nav>
</header>

<section class="hero">
  <h1>iPhone Duo</h1>
  <p>Hello, hello.Hello, Hello. hello.</p>
  <p>Available starting 10.23</p>
  <a href="/iphone-duo/">Learn more</a>
  <a href="/us/shop/goto/buy_iphone/iphone_duo">Pre‑order</a>
</section>`,
    css: `/* Apple-like styling - simplified for demo */
body { margin: 0; font-family: system-ui, sans-serif; background: #fff; color: #000; }
header { padding: 1rem 2rem; background: #f5f5f5; border-bottom: 1px solid #e5e5e5; }
nav ul { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
nav a { text-decoration: none; color: #424242; font-weight: 500; }
nav a:hover { text-decoration: underline; }
.hero { text-align: center; padding: 4rem 2rem; }
.hero h1 { font-size: 3rem; margin: 0 0 1rem 0; font-weight: 600; line-height: 1.1; }
.hero p { font-size: 1.25rem; margin: 0 0 1.5rem 0; opacity: 0.7; max-width: 600px; margin-left: auto; margin-right: auto; }
.hero a { display: inline-block; padding: 0.75rem 1.5rem; margin: 0 0.5rem; border-radius: 0.5rem;
          font-weight: 500; text-decoration: none; }
.hero a:nth-child(1) { background: #007aff; color: white; } /* Learn more - blue */
.hero a:nth-child(2) { border: 2px solid #007aff; color: #007aff; } /* Pre-order - outline */
.hero a:hover { opacity: 0.9; }`,
    spec: `1. The "Learn more" and "Pre‑order" buttons should have adequate spacing between them (minimum 12px).
2. Both buttons must have a minimum touch-target height of 44px.
3. The hero heading "iPhone Duo" should have adequate contrast against the background.
4. The body text "Hello, hello.Hello, Hello. hello." should be readable and not overlap with other elements.
5. The Apple navigation links should have adequate hit areas and not overlap with each other on mobile viewports.`,
  },
  {
    id: 'pixelblast-demo',
    label: 'Pixel Blast - Python Course',
    url: 'https://pixelblast.vercel.app/',
    // html/css/spec optional - will be fetched live
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
  const [htmlCode, setHtmlCode] = useState<string>(DEMO_PRESETS[0].html ?? '');
  const [cssCode, setCssCode] = useState<string>(DEMO_PRESETS[0].css ?? '');
  const [specText, setSpecText] = useState<string>(DEMO_PRESETS[0].spec ?? '');

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
    if (preset.url) {
      // Fetch live URL for URL-based demos
      setUrlInput(preset.url);
      handleFetchLiveUrl(preset.url);
    } else {
      // Use static HTML/CSS for backward compatibility
      setActiveSourceUrl(undefined);
      setImportedTitle(null);
      setHtmlCode(preset.html ?? '');
      setCssCode(preset.css ?? '');
      setSpecText(preset.spec ?? '');
      setAuditResult(null);
      setErrorMessage(null);
    }
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
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo_dark.png" alt="PixelVision Logo" className="w-8 h-8" />
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