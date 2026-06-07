import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { pathToFileURL } from 'node:url'

type ScholarshipApiModule = {
  default: (
    req: IncomingMessage & { query?: Record<string, string> },
    res: ServerResponse & {
      status: (code: number) => ServerResponse & { json: (payload: unknown) => void };
      json: (payload: unknown) => void;
    },
  ) => Promise<void>;
}

function scholarshipApiDevPlugin() {
  return {
    name: 'scholarship-api-dev',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) => void } }) {
      server.middlewares.use('/api/scholarships', (req, res) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost');
        const query = Object.fromEntries(requestUrl.searchParams.entries());

        const apiRes = Object.assign(res, {
          status(code: number) {
            res.statusCode = code;
            return apiRes;
          },
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
          },
        });

        const modulePath = pathToFileURL(path.resolve(__dirname, 'api/scholarships.js')).href;
        import(/* @vite-ignore */ modulePath)
          .then((mod: ScholarshipApiModule) => mod.default(Object.assign(req, { query }), apiRes))
          .catch((error: Error) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), scholarshipApiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    allowedHosts: true,
    proxy: {
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
        proxyTimeout: 120000,
        timeout: 120000,
      },
      '/api/pollination': {
        target: 'https://gen.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pollination/, ''),
      },
      '/api/yahoo-finance': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-finance/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
      '/api/twelve-data': {
        target: 'https://api.twelvedata.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twelve-data/, ''),
      },
    },
  },
})
