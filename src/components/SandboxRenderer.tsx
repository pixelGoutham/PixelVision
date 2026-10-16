import { useEffect, useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { RefreshCw, Camera, Eye, Layers, Smartphone, Tablet, Monitor } from 'lucide-react';
import type { DomTelemetryItem } from '../lib/gemmaClient';

interface SandboxRendererProps {
  htmlCode: string;
  cssCode: string;
  sourceUrl?: string;
  onTelemetryReady: (base64Image: string, telemetry: DomTelemetryItem[]) => void;
}

interface SandboxMessagePayload {
  type?: string;
  telemetry?: DomTelemetryItem[];
}

type ViewportMode = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_CONFIG: Record<ViewportMode, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 640, label: '375px Mobile' },
  tablet: { width: 768, height: 900, label: '768px Tablet' },
  desktop: { width: 1280, height: 960, label: '1280px Desktop' },
};

// 1x1 transparent PNG prevents html-to-image from throwing Event { type: "error", target: img } on CORS images
const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Tier 3 Fallback: Synthesizes a high-contrast Set-of-Mark visual frame using native HTML5 Canvas
 * if a strict enterprise site (like apple.com) blocks SVG foreignObject serialization.
 */
function renderSyntheticSomCanvas(
  telemetry: DomTelemetryItem[],
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return TRANSPARENT_PIXEL;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  telemetry.forEach((item) => {
    const { x, y, width: w, height: h } = item.rect;
    if (y > height || x > width) return;

    // Element surface fill & dashed red bounding box
    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.fillRect(x, y, w, h);

    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();

    // Element text snippet
    if (item.textSnippet) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(item.textSnippet.slice(0, 38), x + 6, Math.min(y + 18, y + h - 4), Math.max(20, w - 12));
    }

    // Red Set-of-Mark badge
    const badgeX = Math.max(0, x - 8);
    const badgeY = Math.max(0, y - 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(badgeX, badgeY, 22, 18);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(badgeX, badgeY, 22, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(String(item.badgeId), badgeX + 4, badgeY + 13);
  });

  return canvas.toDataURL('image/png');
}

export function SandboxRenderer({
  htmlCode,
  cssCode,
  sourceUrl,
  onTelemetryReady,
}: SandboxRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const [renderKey, setRenderKey] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [lastSnapshot, setLastSnapshot] = useState<string>('');
  const [showSnapshotPreview, setShowSnapshotPreview] = useState<boolean>(false);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      if (!stageContainerRef.current) return;
      const availableWidth = stageContainerRef.current.clientWidth - 24;
      const targetWidth = VIEWPORT_CONFIG[viewport].width;
      const nextScale = Math.min(1, availableWidth / targetWidth);
      setScaleFactor(Number(nextScale.toFixed(3)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [viewport]);

  const buildSrcDoc = useCallback(() => {
    const baseTag = sourceUrl ? `<base href="${sourceUrl}" />` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${baseTag}
  <script>
    // Silence Tailwind Play CDN dev warning in console
    const origWarn = console.warn;
    console.warn = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com')) return;
      origWarn.apply(console, args);
    };
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #0f172a;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: relative;
      min-height: 100vh;
      overflow-x: hidden;
    }

    ${cssCode}

    /* Ensure scroll-triggered animation elements (AOS, GSAP) are visible without JS */
    [data-aos],
    [data-aos^="fade"],
    [data-aos^="zoom"],
    [data-aos^="flip"],
    [data-aos^="slide"] {
      opacity: 1 !important;
      transform: none !important;
      visibility: visible !important;
      transition: none !important;
    }
  </style>
</head>
<body>
  <div id="pixelvision-root">
    ${htmlCode}
  </div>

  <script>
    (function() {
      function generateSetOfMarks() {
        const existingOverlay = document.getElementById('pv-som-overlay');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pv-som-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;';
        document.body.appendChild(overlay);

        const root = document.getElementById('pixelvision-root') || document.body;
        const candidates = root.querySelectorAll('button, a, input, select, textarea, img, h1, h2, h3, h4, p, span');
        
        const seenElements = new Set();
        const telemetry = [];
        let badgeCounter = 1;

        candidates.forEach((el) => {
          if (badgeCounter > 40) return;
          if (seenElements.has(el)) return;
          if (el.id === 'pv-som-overlay' || el.closest('#pv-som-overlay')) return;

          const rect = el.getBoundingClientRect();
          if (rect.width < 10 || rect.height < 10) return;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
            return;
          }

          seenElements.add(el);
          const badgeId = badgeCounter++;

          const top = Math.round(rect.top + window.scrollY);
          const left = Math.round(rect.left + window.scrollX);
          const width = Math.round(rect.width);
          const height = Math.round(rect.height);

          const box = document.createElement('div');
          box.style.cssText = [
            'position:absolute',
            'top:' + top + 'px',
            'left:' + left + 'px',
            'width:' + width + 'px',
            'height:' + height + 'px',
            'border:1.5px dashed rgba(239, 68, 68, 0.8)',
            'background:rgba(239, 68, 68, 0.04)',
            'border-radius:3px',
            'pointer-events:none'
          ].join(';');
          overlay.appendChild(box);

          const badge = document.createElement('div');
          badge.textContent = String(badgeId);
          badge.style.cssText = [
            'position:absolute',
            'top:' + Math.max(0, top - 10) + 'px',
            'left:' + Math.max(0, left - 10) + 'px',
            'min-width:20px',
            'height:20px',
            'padding:0 5px',
            'background-color:#ef4444',
            'color:#ffffff',
            'font-size:11px',
            'font-weight:800',
            'font-family:monospace',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'border-radius:4px',
            'border:1.5px solid #ffffff',
            'box-shadow:0 2px 4px rgba(0,0,0,0.4)',
            'z-index:2147483647'
          ].join(';');
          overlay.appendChild(badge);

          const rawText = (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ');

          telemetry.push({
            badgeId: badgeId,
            tagName: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
            id: el.id || '',
            textSnippet: rawText.slice(0, 80),
            rect: {
              x: left,
              y: top,
              width: width,
              height: height,
              top: top,
              right: left + width,
              bottom: top + height,
              left: left
            }
          });
        });

        window.parent.postMessage({
          type: 'PIXELVISION_TELEMETRY_READY',
          telemetry: telemetry
        }, '*');
      }

      window.addEventListener('load', () => {
        setTimeout(() => {
          requestAnimationFrame(generateSetOfMarks);
        }, 350);
      });
    })();
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, sourceUrl]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<SandboxMessagePayload>) => {
      if (!event.data || event.data.type !== 'PIXELVISION_TELEMETRY_READY') {
        return;
      }

      const telemetry: DomTelemetryItem[] = event.data.telemetry || [];
      setBadgeCount(telemetry.length);

      const iframeEl = iframeRef.current;
      const iframeDoc = iframeEl?.contentDocument || iframeEl?.contentWindow?.document;
      const targetViewport = VIEWPORT_CONFIG[viewport];
      const captureWidth = targetViewport.width;
      const captureHeight = targetViewport.height;

      if (!iframeDoc || !iframeDoc.body) {
        const fallbackPng = renderSyntheticSomCanvas(telemetry, captureWidth, captureHeight);
        setLastSnapshot(fallbackPng);
        onTelemetryReady(fallbackPng, telemetry);
        return;
      }

      setIsCapturing(true);
      const bodyEl = iframeDoc.body;
      let base64Png = '';

      try {
        // Tier 1: Capture with skipFonts + imagePlaceholder to bypass font/img CORS errors
        base64Png = await toPng(bodyEl, {
          width: captureWidth,
          height: captureHeight,
          pixelRatio: 1,
          backgroundColor: '#ffffff',
          skipFonts: true,
          imagePlaceholder: TRANSPARENT_PIXEL,
        });
      } catch {
        try {
          // Tier 2: Strip cross-origin <picture>, <source>, <img>, <video>, and <svg> tags
          base64Png = await toPng(bodyEl, {
            width: captureWidth,
            height: captureHeight,
            pixelRatio: 1,
            backgroundColor: '#ffffff',
            skipFonts: true,
            imagePlaceholder: TRANSPARENT_PIXEL,
            filter: (node: HTMLElement) => {
              const tag = node.tagName?.toUpperCase();
              if (
                tag === 'IMG' ||
                tag === 'PICTURE' ||
                tag === 'SOURCE' ||
                tag === 'VIDEO' ||
                tag === 'IFRAME'
              ) {
                return false;
              }
              return true;
            },
          });
        } catch {
          // Tier 3: Guaranteed Native Canvas Set-of-Mark Wireframe
          console.info('PixelVision: Using native Canvas Set-of-Mark renderer for strict CORS page.');
          base64Png = renderSyntheticSomCanvas(telemetry, captureWidth, captureHeight);
        }
      } finally {
        setIsCapturing(false);
      }

      setLastSnapshot(base64Png);
      onTelemetryReady(base64Png, telemetry);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onTelemetryReady, viewport]);

  const currentDim = VIEWPORT_CONFIG[viewport];
  const scaledWrapperHeight = Math.round(currentDim.height * scaleFactor);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            SoM Sandbox
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-mono text-[11px]">
            {badgeCount} Badges
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            ({currentDim.label})
          </span>
          {isCapturing && (
            <span className="flex items-center gap-1 text-amber-400 animate-pulse text-[11px]">
              <Camera className="w-3 h-3" />
              Capturing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setViewport('mobile');
              setRenderKey((k) => k + 1);
            }}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Viewport (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setViewport('tablet');
              setRenderKey((k) => k + 1);
            }}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setViewport('desktop');
              setRenderKey((k) => k + 1);
            }}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Viewport (1280px scaled)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {lastSnapshot && (
            <button
              type="button"
              onClick={() => setShowSnapshotPreview((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border transition text-[11px] cursor-pointer ${
                showSnapshotPreview
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              {showSnapshotPreview ? 'Live DOM' : 'AI PNG'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setRenderKey((prev) => prev + 1)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition text-[11px] cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Re-Badge
          </button>
        </div>
      </div>

      <div
        ref={stageContainerRef}
        className="relative flex-1 bg-slate-950 p-3 flex items-start justify-center overflow-auto"
      >
        {showSnapshotPreview && lastSnapshot ? (
          <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-slate-700">
            <div className="bg-indigo-950 text-indigo-200 text-[11px] px-3 py-1 font-mono border-b border-indigo-800">
              Exact Base64 Set-of-Mark PNG Sent to Gemma 4 ({currentDim.label})
            </div>
            <img
              src={lastSnapshot}
              alt="Set-of-Mark Captured Frame"
              className="w-full h-auto block"
            />
          </div>
        ) : (
          <div
            style={{
              width: `${Math.round(currentDim.width * scaleFactor)}px`,
              height: `${scaledWrapperHeight}px`,
            }}
            className="relative overflow-hidden rounded-lg shadow-2xl border-2 border-slate-700 bg-white shrink-0"
          >
            <iframe
              key={`${renderKey}-${viewport}-${htmlCode.length}-${cssCode.length}`}
              ref={iframeRef}
              title="PixelVision Set-of-Mark Sandbox"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={buildSrcDoc()}
              style={{
                width: `${currentDim.width}px`,
                height: `${currentDim.height}px`,
                transform: `scale(${scaleFactor})`,
                transformOrigin: 'top left',
              }}
              className="border-0 block bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}