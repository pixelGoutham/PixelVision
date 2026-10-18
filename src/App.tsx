// ShipWright AI Audit Verification Ready
import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Database,
  Wand2,
  Trash2,
  Terminal,
  Globe,
  Download,
  Layers,
  ShieldCheck,
  RotateCcw,
  Bug,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { SandboxRenderer } from './components/SandboxRenderer';
import {
  analyzeWebpage,
  clearAuditCache,
  getDeterministicDemoAudit,
  type DomTelemetryItem,
  type AuditResult,
} from './lib/gemmaClient';

interface DemoPreset {
  id: string;
  label: string;
  sublabel: string;
  pillText: string;
  pillColor: string;
  url: string;
  html: string;
  css: string;
  buggyCss: string;
  liveBugInjectionCss: string;
  spec: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'apple-hero',
    label: 'Apple.com — Hero',
    sublabel: 'iPhone Duo Landing Section',
    pillText: 'Production',
    pillColor: 'bg-blue-500 text-white',
    url: 'https://www.apple.com/',
    html: `<!-- Fallback snapshot if completely offline -->
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
  <p>Hello, hello. Designed for fluid intelligence.</p>
  <p class="date-sub">Available starting 10.23</p>
  <div class="cta-row">
    <a href="/iphone-duo/">Learn more</a>
    <a href="/us/shop/goto/buy_iphone/iphone_duo">Pre-order</a>
  </div>
</section>`,
    css: `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: #fff; color: #1d1d1f; }
header { padding: 0.9rem 2.5rem; background: rgba(245, 245, 247, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; }
header > a { font-weight: 700; color: #1d1d1f; text-decoration: none; font-size: 1.05rem; letter-spacing: -0.02em; }
nav ul { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
nav a { text-decoration: none; color: #424245; font-weight: 500; font-size: 0.85rem; padding: 0.5rem 0; display: inline-block; }
.hero { text-align: center; padding: 5rem 2rem; background: #fbfbfd; }
.hero h1 { font-size: 3.5rem; margin: 0 0 0.75rem 0; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; }
.hero p { font-size: 1.25rem; margin: 0 auto 0.75rem auto; color: #1d1d1f; max-width: 540px; }
.hero .date-sub { font-size: 0.95rem; color: #86868b; margin-bottom: 1.5rem; }
.hero a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 1.5rem; margin: 0 0.45rem; border-radius: 9999px; font-weight: 500; font-size: 0.95rem; text-decoration: none; }
.hero a:nth-of-type(1) { background: #0071e3; color: white; }
.hero a:nth-of-type(2) { border: 1.5px solid #0071e3; color: #0071e3; }`,
    buggyCss: `/* --- INJECTED LAYOUT BUG --- */
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: #fff; color: #1d1d1f; }
header { padding: 0.6rem 2rem; background: #f5f5f7; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; }
nav ul { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
nav a { text-decoration: none; color: #424245; font-weight: 500; }
.hero { text-align: center; padding: 4rem 2rem; }
.hero h1 { font-size: 3.5rem; margin: 0; font-weight: 700; line-height: 1.05; }
.hero p { font-size: 1.25rem; margin: -18px auto 0.5rem auto; color: #515154; }
.hero a { display: inline-block; height: 26px; padding: 0.15rem 0.75rem; margin: 0 -8px; border-radius: 9999px; font-weight: 500; text-decoration: none; }
.hero a:nth-of-type(1) { background: #0071e3; color: white; }
.hero a:nth-of-type(2) { border: 1.5px solid #0071e3; color: #0071e3; }`,
    liveBugInjectionCss: `/* --- INJECTED LAYOUT BUG --- */
/* Injected onto live Apple.com DOM to demonstrate Set-of-Mark overlap & touch-target detection */
.unit-copy-wrapper h2.headline,
.unit-copy-wrapper h1,
.hero h1,
main h2 {
  margin-bottom: -18px !important;
}
.unit-copy-wrapper h3.subhead,
.unit-copy-wrapper p.subhead,
.hero p {
  margin: -18px auto 4px auto !important;
  position: relative !important;
  z-index: 20 !important;
}
.cta-links a,
.unit-copy-wrapper a.button,
.hero a {
  height: 26px !important;
  min-height: 26px !important;
  padding: 2px 10px !important;
  margin: 0 -8px !important;
  display: inline-flex !important;
  align-items: center !important;
}`,
    spec: `1. Zero visual overlapping between headings, subheadings, and action links.
2. Interactive CTA buttons ('Learn more', 'Pre-order') must meet the 44px minimum touch-target height.
3. Minimum 12px horizontal separation between adjacent CTA buttons.`,
  },
  {
    id: 'pixelblast-demo',
    label: 'Pixel Blast — Course',
    sublabel: 'Python Bootcamp Landing Page',
    pillText: 'Audit Ready',
    pillColor: 'bg-amber-400 text-zinc-950',
    url: 'https://pixelblast.vercel.app/',
    html: `<div id="mainSection" class="bg-zinc-950 text-white">
  <header id="header" class="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
    <a class="navbar-brand font-black text-amber-400 text-base tracking-tight" href="https://pixelblast.vercel.app/">
      Pixel Blast
    </a>
    <nav class="flex items-center gap-5 text-xs text-zinc-300">
      <a href="#course">Curriculum</a>
      <a href="#projects">Projects</a>
      <a href="#mentor">Instructor</a>
      <a href="#faq">FAQ</a>
    </nav>
    <a href="#join" class="btn-join bg-amber-400 text-zinc-950 font-bold text-xs px-3 py-1 rounded">
      Join Us
    </a>
  </header>

  <section class="hero-banner text-center px-6 py-10 bg-black">
    <p class="author-credit text-xs text-zinc-400">
      Pixel Blast by <span class="text-amber-400 underline font-semibold">Goutham Kumar A</span>
    </p>
    <h1 class="course-title text-3xl font-extrabold text-amber-300">
      The Ultimate Python Course!
    </h1>
    <div class="mt-4">
      <button class="cta-enroll bg-amber-300 text-zinc-950 font-bold text-xs px-5 rounded shadow">
        join now
      </button>
    </div>
  </section>

  <section class="experience-strip text-center py-8 px-6 bg-lime-300 text-zinc-950">
    <p class="text-xs font-medium uppercase tracking-wider">Teaching my</p>
    <h2 class="text-2xl font-extrabold mt-1">3 years of experience in 7 months</h2>
  </section>
</div>`,
    css: `body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #09090b; }
.btn-join, .cta-enroll {
  height: 30px;
  display: inline-block;
}
.author-credit {
  margin-bottom: -2px;
}
.course-title {
  margin-top: 0px;
}`,
    buggyCss: `/* --- INJECTED LAYOUT BUG --- */
body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #09090b; }
.btn-join, .cta-enroll {
  height: 26px;
  display: inline-block;
}
.author-credit {
  margin-bottom: -10px;
}
.course-title {
  margin-top: 0px;
}`,
    liveBugInjectionCss: `/* --- INJECTED LAYOUT BUG --- */
#mainSection h1, .course-title, h1 {
  margin: -18px auto 0 auto !important;
}
button, .btn, a.btn, .btn-join, .cta-enroll {
  height: 26px !important;
  min-height: 26px !important;
  padding: 2px 8px !important;
}`,
    spec: `1. Zero visual overlapping between author attribution and primary course display heading.
2. Interactive CTA buttons ('Join Us' and 'join now') must meet the 44px minimum touch-target height.
3. Clear visual hierarchy across hero and lime experience banner.`,
  },
];

interface FetchUrlResponse {
  url: string;
  title: string;
  html: string;
  css: string;
  error?: string;
}

type CenterTab = 'stage' | 'code' | 'telemetry';

export function App() {
  const [activePresetId, setActivePresetId] = useState<string>(DEMO_PRESETS[0].id);
  const [centerTab, setCenterTab] = useState<CenterTab>('stage');
  const [codeSubTab, setCodeSubTab] = useState<'css' | 'html'>('css');

  const [htmlCode, setHtmlCode] = useState<string>(DEMO_PRESETS[0].html);
  const [cssCode, setCssCode] = useState<string>(DEMO_PRESETS[0].css);
  // Stores the clean live-fetched HTML & CSS so Simulate Overlap and Reset work on the REAL live website!
  const [cleanFetchedHtml, setCleanFetchedHtml] = useState<string>(DEMO_PRESETS[0].html);
  const [cleanFetchedCss, setCleanFetchedCss] = useState<string>(DEMO_PRESETS[0].css);
  const [specText, setSpecText] = useState<string>(DEMO_PRESETS[0].spec);

  const [activeRules, setActiveRules] = useState({
    overlap: true,
    touchTarget: true,
    hierarchy: true,
  });

  const [urlInput, setUrlInput] = useState<string>(DEMO_PRESETS[0].url);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string | undefined>(DEMO_PRESETS[0].url);
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [importedTitle, setImportedTitle] = useState<string>(DEMO_PRESETS[0].label);

  const [imageBase64, setImageBase64] = useState<string>('');
  const [domTelemetry, setDomTelemetry] = useState<DomTelemetryItem[]>([]);

  const [instantDemoMode, setInstantDemoMode] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleTelemetryReady = useCallback(
    (capturedBase64: string, telemetry: DomTelemetryItem[]) => {
      setImageBase64(capturedBase64);
      setDomTelemetry(telemetry);
    },
    []
  );

const handleFetchLiveUrl = useCallback(
    async (targetUrl?: string, presetContext?: DemoPreset, injectBug: boolean = false) => {
      const urlToFetch = (targetUrl ?? urlInput).trim();
      if (!urlToFetch) return;

      setImageBase64('');
      setDomTelemetry([]);
      setIsFetchingUrl(true);
      setAuditResult(null);

      try {
        const response = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToFetch }),
        });

        const data = (await response.json()) as FetchUrlResponse;
        if (!response.ok || data.error) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        setHtmlCode(data.html);
        setCleanFetchedHtml(data.html);
        setCleanFetchedCss(data.css);
        setCssCode(injectBug && presetContext ? `${data.css}\n\n${presetContext.liveBugInjectionCss}` : data.css);
        setActiveSourceUrl(data.url);
        setImportedTitle(data.title || presetContext?.label || data.url);
        if (presetContext) {
          setSpecText(presetContext.spec);
        }
      } catch {
        // Emergency offline fallback only if internet/API is unreachable
        const fallbackPreset =
          presetContext ??
          DEMO_PRESETS.find((p) => urlToFetch.includes('pixelblast') && p.id === 'pixelblast-demo') ??
          DEMO_PRESETS[0];
        setHtmlCode(fallbackPreset.html);
        setCleanFetchedHtml(fallbackPreset.html);
        setCleanFetchedCss(fallbackPreset.css);
        setCssCode(injectBug ? `${fallbackPreset.css}\n\n${fallbackPreset.liveBugInjectionCss}` : fallbackPreset.css);
        setActiveSourceUrl(fallbackPreset.url);
        setImportedTitle(fallbackPreset.label);
        setSpecText(fallbackPreset.spec);
      } finally {
        setIsFetchingUrl(false);
      }
    },
    [urlInput]
  );

  // Automatically pull the real live Apple.com website as soon as the app loads
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void handleFetchLiveUrl(DEMO_PRESETS[0].url, DEMO_PRESETS[0], true);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clicking any preset on the left now pulls the ACTUAL full live website!
  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setUrlInput(preset.url);
    setSpecText(preset.spec);
    void handleFetchLiveUrl(preset.url, preset, true);
  };
  // Injects overlap/touch-target bugs directly onto the REAL fetched live website without stripping its DOM
  const handleSimulateBug = () => {
    const preset = DEMO_PRESETS.find((p) => p.id === activePresetId) ?? DEMO_PRESETS[0];
    setHtmlCode(cleanFetchedHtml);
    setCssCode(`${cleanFetchedCss}\n\n${preset.liveBugInjectionCss}`);
    setAuditResult(null);
    setCenterTab('stage');
  };

  // Restores the clean, un-sabotaged live website DOM & CSS
  const handleResetClean = () => {
    setHtmlCode(cleanFetchedHtml);
    setCssCode(cleanFetchedCss);
    setAuditResult(null);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await analyzeWebpage(
        imageBase64,
        domTelemetry,
        specText,
        htmlCode,
        cssCode,
        {
          instantDemoMode,
          activeSourceUrl,
        }
      );
      setAuditResult(result);
    } catch {
      const fallback = getDeterministicDemoAudit(
        domTelemetry,
        htmlCode,
        cssCode,
        activeSourceUrl
      );
      setAuditResult(fallback);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyPatch = () => {
    if (!auditResult?.suggestedPatch) return;
    const patch = auditResult.suggestedPatch;

    // Strip any injected bug rules so the real live website heals cleanly
    const baseCleanCss = cssCode.split('/* --- INJECTED LAYOUT BUG --- */')[0].trim();

    const nextCss =
      patch.css && patch.css.trim().length > 0
        ? `${baseCleanCss}\n\n/* --- Gemma 4 Remediation Patch --- */\n${patch.css}`
        : `${baseCleanCss}\n\n/* --- Gemma 4 Remediation Patch --- */`;

    setCssCode(nextCss);

    if (patch.html && patch.html.trim().length > 0 && !activeSourceUrl) {
      setHtmlCode(patch.html);
    }

    const postAudit = getDeterministicDemoAudit(
      domTelemetry,
      htmlCode,
      nextCss,
      activeSourceUrl
    );
    setAuditResult(postAudit);
  };

  const handleClearCache = async () => {
    await clearAuditCache();
    setAuditResult(null);
  };

  const violationCount = auditResult ? auditResult.violations.length : 0;

  return (
    <div className="h-screen w-screen flex bg-[#09090b] text-zinc-100 overflow-hidden select-none">
      {/* Left Sidebar — PixelFocus Signature Layout */}
      <aside className="w-60 shrink-0 bg-[#09090b] border-r border-white/6 flex flex-col justify-between p-3.5">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo_dark.png"
                  alt="Pixel"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML =
                        '<span class="text-[11px] font-bold text-white">PV</span>';
                    }
                  }}
                />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Pixel Vision</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">v2.4</span>
          </div>

          {/* Workspace Views */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Workbench
            </div>
            {(
              [
                { id: 'stage', label: 'Visual SoM Stage', icon: Eye },
                { id: 'code', label: 'Source & CSS Patch', icon: Code2 },
                { id: 'telemetry', label: `DOM Telemetry (${domTelemetry.length})`, icon: Terminal },
              ] as const
            ).map(({ id, label, icon: Icon }) => {
              const active = centerTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCenterTab(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer apple-press ${
                    active
                      ? 'bg-[#1f1f23] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/3'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Curated Demo Targets (Pulls Live Websites on Click!) */}
          <div className="space-y-1.5">
            <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Verified Targets
            </div>
            {DEMO_PRESETS.map((preset) => {
              const selected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isFetchingUrl}
                  className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer apple-press ${
                    selected
                      ? 'bg-[#16161a] border-white/15 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-white/3'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">{preset.label}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${preset.pillColor}`}
                    >
                      {preset.pillText}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{preset.sublabel}</p>
                </button>
              );
            })}
          </div>

          {/* Active Spec Guardrails */}
          <div className="space-y-1.5">
            <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3" />
              Active Spec Rules
            </div>
            <div className="space-y-1 px-1">
              {(
                [
                  { key: 'overlap', label: 'Zero Bounding Overlap', tag: 'Critical' },
                  { key: 'touchTarget', label: '44px Min Touch Target', tag: 'iOS HIG' },
                  { key: 'hierarchy', label: 'Typography Rhythm', tag: 'Optical' },
                ] as const
              ).map((rule) => {
                const enabled = activeRules[rule.key];
                return (
                  <button
                    key={rule.key}
                    type="button"
                    onClick={() =>
                      setActiveRules((prev) => ({ ...prev, [rule.key]: !prev[rule.key] }))
                    }
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] bg-[#121214] border border-white/5 text-zinc-300 cursor-pointer apple-press"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          enabled ? 'bg-emerald-400' : 'bg-zinc-600'
                        }`}
                      />
                      {rule.label}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">{rule.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Controls: 503 Shield & Cache */}
        <div className="space-y-1.5 pt-3 border-t border-white/6">
          <button
            type="button"
            onClick={() => setInstantDemoMode((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#121214] border border-white/[0.07] text-zinc-300 cursor-pointer apple-press"
            title="Protects live demo from 503 High Demand errors with deterministic pre/post snapshots"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  instantDemoMode ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              />
              503 Demo Shield
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                instantDemoMode
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {instantDemoMode ? 'ON' : 'LIVE'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer apple-press"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge IndexedDB Cache
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar — Protected from Long URL Title Overflow */}
        <header className="h-14 shrink-0 px-6 border-b border-white/6 flex items-center justify-between gap-4 bg-[#09090b]">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              className="text-sm font-semibold text-white tracking-tight truncate max-w-60 xl:max-w-90"
              title={importedTitle}
            >
              {isFetchingUrl ? 'Harvesting Live DOM & CSS...' : importedTitle}
            </span>
            <span className="text-xs text-zinc-700 shrink-0">•</span>
            <span className="text-xs font-mono text-zinc-500 truncate hidden xl:inline">
              Gemma 4 Set-of-Mark Engine
            </span>
          </div>

          {/* URL Importer & Stage Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#121214] border border-white/8 rounded-lg px-2.5 py-1 focus-within:border-white/25 transition">
              <Globe className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleFetchLiveUrl();
                }}
                placeholder="https://apple.com or any URL..."
                className="w-48 xl:w-60 bg-transparent text-xs text-zinc-200 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleFetchLiveUrl()}
                disabled={isFetchingUrl}
                className="ml-2 px-2 py-0.5 rounded bg-white/[0.07] hover:bg-white/[0.14] text-[11px] font-medium text-zinc-200 cursor-pointer apple-press flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <Download className="w-3 h-3 shrink-0" />
                {isFetchingUrl ? '...' : 'Fetch'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSimulateBug}
              disabled={isFetchingUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#121214] hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-white/8 cursor-pointer apple-press shrink-0 whitespace-nowrap"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Simulate Overlap
            </button>

            <button
              type="button"
              onClick={handleResetClean}
              disabled={isFetchingUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#121214] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/8 cursor-pointer apple-press shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              Reset
            </button>

            {/* PixelFocus Signature Stark White Action Pill */}
            <button
              type="button"
              onClick={() => void handleRunAudit()}
              disabled={isAuditing || isFetchingUrl}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm cursor-pointer apple-press shrink-0 whitespace-nowrap"
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isAuditing ? 'animate-spin' : ''}`} />
              {isAuditing ? 'Auditing...' : 'Run Multimodal Audit'}
            </button>
          </div>
        </header>

        {/* PixelFocus 4-Card KPI Strip */}
        <div className="grid grid-cols-4 gap-3.5 px-6 pt-4 shrink-0">
          <div className="pf-card px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                BADGED DOM NODES
              </div>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5 font-mono">
                {domTelemetry.length}
              </div>
            </div>
            <Layers className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="pf-card px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                SPEC VIOLATIONS
              </div>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5 font-mono">
                {auditResult ? `${violationCount} Found` : '—'}
              </div>
            </div>
            <AlertTriangle
              className={`w-4 h-4 ${
                auditResult
                  ? violationCount === 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : 'text-zinc-600'
              }`}
            />
          </div>

          <div className="pf-card px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                SPEC STATUS
              </div>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {auditResult ? (auditResult.passed ? 'Passed' : 'Failed') : 'Standby'}
              </div>
            </div>
            <CheckCircle2
              className={`w-4 h-4 ${
                auditResult?.passed ? 'text-emerald-400' : 'text-zinc-600'
              }`}
            />
          </div>

          <div className="pf-card px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                TELEMETRY CACHE
              </div>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5 font-mono">
                {instantDemoMode ? '0ms' : 'SHA-256'}
              </div>
            </div>
            <Database className="w-4 h-4 text-zinc-600" />
          </div>
        </div>

        {/* Main 2-Pane Studio Grid */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-hidden">
          {/* Left 7 Columns: Clean Segmented Stage / Code / Telemetry */}
          <div className="col-span-7 pf-card flex flex-col overflow-hidden">
            {centerTab === 'stage' && (
              <SandboxRenderer
                htmlCode={htmlCode}
                cssCode={cssCode}
                sourceUrl={activeSourceUrl}
                onTelemetryReady={handleTelemetryReady}
              />
            )}

            {centerTab === 'code' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
                  <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-lg border border-white/[0.07]">
                    <button
                      type="button"
                      onClick={() => setCodeSubTab('css')}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer apple-press ${
                        codeSubTab === 'css'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Stylesheet (CSS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeSubTab('html')}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer apple-press ${
                        codeSubTab === 'html'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      DOM Markup (HTML)
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Live Hot-Reload Enabled
                  </span>
                </div>

                {codeSubTab === 'css' ? (
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 p-4 bg-[#09090b] text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none resize-none select-text"
                  />
                ) : (
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 p-4 bg-[#09090b] text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none resize-none select-text"
                  />
                )}
              </div>
            )}

            {centerTab === 'telemetry' && (
              <div className="flex flex-col h-full">
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Deterministic Bounding-Box Telemetry
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {domTelemetry.length} Elements Indexed
                  </span>
                </div>
                <pre className="flex-1 p-4 bg-[#09090b] text-zinc-300 font-mono text-[11px] overflow-auto select-text">
                  {JSON.stringify(domTelemetry, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right 5 Columns: Verification Report & Self-Healing Patch */}
          <div className="col-span-5 pf-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-white/6 flex items-center justify-between">
              <span className="text-xs font-semibold text-white tracking-tight">
                Verification Report
              </span>
              {auditResult && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/8">
                  {auditResult._sourceLabel || 'Verified SoM'}
                </span>
              )}
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {isAuditing && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <div className="text-xs font-semibold text-white">
                    Cross-referencing Set-of-Mark Coordinates...
                  </div>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Evaluating bounding-box collisions and touch-target heights.
                  </p>
                </div>
              )}

              {!isAuditing && !auditResult && (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#09090b] border border-white/[0.07] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <div className="text-sm font-semibold text-white tracking-tight">
                      Ready to Verify UI
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Click <strong className="text-zinc-300">Run Multimodal Audit</strong> to verify the current stage, or click{' '}
                      <strong className="text-rose-400">Simulate Overlap</strong> to test self-healing remediation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRunAudit()}
                    disabled={isFetchingUrl}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs cursor-pointer apple-press"
                  >
                    Start Verification Session
                  </button>
                </div>
              )}

              {!isAuditing && auditResult && (
                <>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      auditResult.passed
                        ? 'bg-emerald-500/[0.07] border-emerald-500/25'
                        : 'bg-rose-500/[0.07] border-rose-500/25'
                    }`}
                  >
                    {auditResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-white tracking-tight">
                        {auditResult.passed
                          ? 'PASSED — UI Conforms to Spec'
                          : `FAILED — ${auditResult.violations.length} Violations Detected`}
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{auditResult.summary}</p>
                    </div>
                  </div>

                  {/* Violation Cards with PixelFocus Semantic Pills */}
                  {auditResult.violations.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        Detected Violations
                      </div>
                      {auditResult.violations.map((v, i) => (
                        <div key={i} className="pf-card-subtle p-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {v.badgeIds.map((id) => (
                                <span
                                  key={id}
                                  className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] font-bold"
                                >
                                  Mark #{id}
                                </span>
                              ))}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                                {v.type}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                v.severity === 'CRITICAL'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-400 text-zinc-950'
                              }`}
                            >
                              {v.severity}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{v.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Self-Healing Remediation Patch */}
                  {auditResult.suggestedPatch && auditResult.suggestedPatch.css && (
                    <div className="space-y-3 pt-3 border-t border-white/6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Remediation Patch
                        </span>
                        <button
                          type="button"
                          onClick={handleApplyPatch}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs cursor-pointer apple-press"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Apply Fix to Stage
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {auditResult.suggestedPatch.explanation}
                      </p>

                      <pre className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.07] text-[11px] font-mono text-zinc-300 overflow-x-auto select-text">
                        {auditResult.suggestedPatch.css}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;