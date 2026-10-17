import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FetchUrlRequestBody {
  url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = (req.body || {}) as FetchUrlRequestBody;
    const rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return res.status(400).json({ error: 'Please provide a valid website URL.' });
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    const pageResponse = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 PixelVisionBot/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!pageResponse.ok) {
      return res.status(502).json({
        error: `Target website returned HTTP ${pageResponse.status} ${pageResponse.statusText}`,
      });
    }

    const rawHtml = await pageResponse.text();

    // 1. Extract page title
    const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // 2. Extract inline <style> blocks
    const styleBlocks: string[] = [];
    const inlineStyleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch: RegExpExecArray | null;
    while ((styleMatch = inlineStyleRegex.exec(rawHtml)) !== null) {
      if (styleMatch[1]?.trim()) {
        styleBlocks.push(`/* Inline <style> */\n${styleMatch[1].trim()}`);
      }
    }

    // 3. Fetch external <link rel="stylesheet"> files
    const linkRegex = /<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi;
    const hrefRegex = /href=["']([^"']+)["']/i;
    const stylesheetUrls: string[] = [];
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkRegex.exec(rawHtml)) !== null) {
      const hrefMatch = hrefRegex.exec(linkMatch[0]);
      if (hrefMatch?.[1]) {
        try {
          const absoluteCssUrl = new URL(hrefMatch[1], parsedUrl.origin).toString();
          stylesheetUrls.push(absoluteCssUrl);
        } catch {
          // Ignore malformed stylesheet href
        }
      }
    }

    const fetchedCssPromises = stylesheetUrls.slice(0, 10).map(async (cssUrl) => {
      try {
        const cssRes = await fetch(cssUrl);
        if (cssRes.ok) {
          const cssText = await cssRes.text();
          // Fixed regex for absolute URL conversion inside CSS url(...)
          const resolvedCss = cssText.replace(
            /url\(['"]?(?!data:\vert{}https?:\/\/)([^'")]+)['"]?\)/gi,
            (_match, relPath: string) => {
              try {
                return `url("${new URL(relPath, cssUrl).toString()}")`;
              } catch {
                return _match;
              }
            }
          );
          return `/* External Stylesheet: ${cssUrl} */\n${resolvedCss}`;
        }
      } catch {
        // Ignore unreachable external CSS
      }
      return '';
    });

    const externalCssList = await Promise.all(fetchedCssPromises);
    const combinedCss = [...externalCssList.filter(Boolean), ...styleBlocks].join('\n\n');

    // 4. Extract <body> content and sanitize scripts/iframes
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let cleanBodyHtml = bodyMatch ? bodyMatch[1] : rawHtml;

    cleanBodyHtml = cleanBodyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Convert relative src="..." and href="..." in body HTML to absolute URLs
    cleanBodyHtml = cleanBodyHtml.replace(
      /\b(src|href)=["'](?!data:|https?:|\/\/|#|mailto:|tel:|javascript:)([^"']+)["']/gi,
      (_match, attr: string, relPath: string) => {
        try {
          const abs = new URL(relPath, parsedUrl.toString()).toString();
          return `${attr}="${abs}"`;
        } catch {
          return _match;
        }
      }
    );

    return res.status(200).json({
      url: parsedUrl.toString(),
      title: pageTitle,
      html: cleanBodyHtml.trim(),
      css: combinedCss.trim() || `/* No external CSS rules extracted from ${parsedUrl.hostname} */`,
    });
  } catch (error: unknown) {
    console.error('PixelVision Fetch URL Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch and parse the target URL.';
    return res.status(500).json({ error: message });
  }
}