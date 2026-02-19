import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { shellProxy } from './e2e/vite-plugin-shell'

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env.VITE_E2E ? [shellProxy()] : [])],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/docs/**',
        '**/badge/**',
        '**/dist/**',
        '**/e2e/**',
        '**/src-tauri/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/.github/**',
        '**/.claude/**',
        '**/.sisyphus/**',
      ],
    },
    proxy: process.env.VITE_E2E
      ? {
          '/__proxy/skills-sh': {
            target: 'https://skills.sh',
            changeOrigin: true,
            rewrite: (p) => p.replace('/__proxy/skills-sh', ''),
          },
          '/__proxy/github-raw': {
            target: 'https://raw.githubusercontent.com',
            changeOrigin: true,
            rewrite: (p) => p.replace('/__proxy/github-raw', ''),
          },
          '/__proxy/add-skill': {
            target: 'https://add-skill.vercel.sh',
            changeOrigin: true,
            rewrite: (p) => p.replace('/__proxy/add-skill', ''),
          },
        }
      : undefined,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...(process.env.VITE_E2E
        ? {
            '@tauri-apps/plugin-http': path.resolve(__dirname, './e2e/shims/plugin-http.ts'),
            '@tauri-apps/plugin-shell': path.resolve(__dirname, './e2e/shims/plugin-shell.ts'),
            '@tauri-apps/plugin-store': path.resolve(__dirname, './e2e/shims/plugin-store.ts'),
            '@tauri-apps/plugin-dialog': path.resolve(__dirname, './e2e/shims/plugin-dialog.ts'),
            '@tauri-apps/api/window': path.resolve(__dirname, './e2e/shims/api-window.ts'),
            '@tauri-apps/plugin-window-state': path.resolve(__dirname, './e2e/shims/plugin-window-state.ts'),
            '@tauri-apps/api/core': path.resolve(__dirname, './e2e/shims/api-core.ts'),
            '@tauri-apps/api/path': path.resolve(__dirname, './e2e/shims/api-path.ts'),
          }
        : {}),
    },
  },
})
