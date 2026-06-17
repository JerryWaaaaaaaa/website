import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { plugin as markdown, Mode } from 'vite-plugin-markdown';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SLIDER_TUNER_PATH = fileURLToPath(
  new URL('./src/components/SliderTuner.tsx', import.meta.url)
);

// Expected shape/order of the persisted config. Anything else is rejected so a
// malformed request can never corrupt the source file.
const FIELDS = [
  'intervalMs',
  'slideMs',
  'easing',
  'pauseOnHover',
  'inactiveOpacity',
  'inactiveBlur',
] as const;

function renderDefaults(config: Record<string, unknown>): string {
  const lines = FIELDS.map((key) => {
    const value = config[key];
    const literal = typeof value === 'string' ? `'${value}'` : String(value);
    return `  ${key}: ${literal},`;
  });
  return `export const SLIDER_DEFAULTS: SliderConfig = {\n${lines.join('\n')}\n};`;
}

// Dev-only endpoint that lets the in-browser Slider Tuner write its current
// values back into SLIDER_DEFAULTS on disk. Vite's HMR then reloads with the
// new baseline. No-op in production builds (`apply: 'serve'`).
function sliderDefaultsWriter(): Plugin {
  return {
    name: 'slider-defaults-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-slider-defaults', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const config = JSON.parse(body) as Record<string, unknown>;
            for (const key of FIELDS) {
              if (!(key in config)) throw new Error(`Missing field: ${key}`);
            }
            const source = await readFile(SLIDER_TUNER_PATH, 'utf8');
            const next = source.replace(
              /export const SLIDER_DEFAULTS: SliderConfig = \{[\s\S]*?\};/,
              renderDefaults(config)
            );
            if (next === source && !next.includes(renderDefaults(config))) {
              throw new Error('SLIDER_DEFAULTS block not found');
            }
            await writeFile(SLIDER_TUNER_PATH, next, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 400;
            res.end(String(err instanceof Error ? err.message : err));
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
    markdown({ mode: [Mode.HTML, Mode.MARKDOWN] }),
    sliderDefaultsWriter(),
  ],
});
