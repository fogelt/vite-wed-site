// vite.config.ts
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { build as esbuild } from "esbuild";
import path from 'path';

/**
 * Bundles `src/prefetch/home-prefetch.ts` into a small classic script and
 * inlines it at the end of <head>. A `<script type="module" src>` would be
 * merged into the main bundle and only run once all of it had downloaded,
 * which is exactly the wait this script exists to avoid.
 */
function inlineHomePrefetch(): Plugin {
  let define: Record<string, string> = {};

  return {
    name: 'inline-home-prefetch',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir || process.cwd(), 'VITE_');
      define = Object.fromEntries(
        ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].map((key) => [
          `import.meta.env.${key}`,
          JSON.stringify(env[key] ?? ''),
        ]),
      );
    },
    async transformIndexHtml() {
      const result = await esbuild({
        entryPoints: [path.resolve(__dirname, 'src/prefetch/home-prefetch.ts')],
        bundle: true,
        write: false,
        format: 'iife',
        minify: true,
        target: 'es2019',
        define,
      });

      return [
        { tag: 'script', children: result.outputFiles[0].text, injectTo: 'head' },
      ];
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    inlineHomePrefetch(),
  ],

  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
  },
});
