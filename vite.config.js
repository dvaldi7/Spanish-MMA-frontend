import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    // Preview (TASK-0036/0037): API e imágenes legacy same-origin cuando preview.sh
    // exporta VITE_API_PROXY. /backend-images se reescribe al /images del backend para
    // no chocar con los assets estáticos del frontend que viven bajo /images.
    ...(process.env.VITE_API_PROXY
      ? {
          proxy: {
            '/api': process.env.VITE_API_PROXY,
            '/backend-images': {
              target: process.env.VITE_API_PROXY,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/backend-images/, ''),
            },
          },
        }
      : {}),
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/',
  preview: {
    port: 4173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  }
})
