import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'http';

function localVercelApiPlugin(): Plugin {
  return {
    name: 'local-vercel-api-middleware',
    configureServer(server) {
      const mountEndpoint = (route: string, modulePath: string) => {
        server.middlewares.use(route, (req: IncomingMessage, res: ServerResponse) => {
          let rawBody = '';
          req.on('data', (chunk: Buffer) => {
            rawBody += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const parsedBody = rawBody ? JSON.parse(rawBody) : {};
              const vercelReq = Object.assign(req, { body: parsedBody });

              const vercelRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code;
                  return vercelRes;
                },
                json(data: unknown) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return vercelRes;
                },
              });

              const apiModule = await server.ssrLoadModule(modulePath);
              await apiModule.default(vercelReq, vercelRes);
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : 'Local API middleware error',
                })
              );
            }
          });
        });
      };

      mountEndpoint('/api/audit', '/api/audit.ts');
      mountEndpoint('/api/fetch-url', '/api/fetch-url.ts');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    plugins: [react(), tailwindcss(), localVercelApiPlugin()],
  };
});