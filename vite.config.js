import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

function markitdownApiPlugin() {
  return {
    name: 'markitdown-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/markitdown', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 455;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetPath = data.filePath;

            if (!targetPath || !fs.existsSync(targetPath)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid or missing file path.' }));
              return;
            }

            const scriptPath = path.resolve('src/backend/markitdown_service.py');
            execFile('python', [scriptPath, targetPath], (error, stdout, stderr) => {
              if (error) {
                console.warn('MarkItDown python execution stderr:', stderr);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(stdout || JSON.stringify({ error: stderr || 'Execution failed' }));
            });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    markitdownApiPlugin(),
  ],
});
