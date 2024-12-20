import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@ffmpeg/ffmpeg': path.resolve(__dirname, 'node_modules/@ffmpeg/ffmpeg/dist/esm/index.js'),
      '@ffmpeg/util': path.resolve(__dirname, 'node_modules/@ffmpeg/util/dist/esm/index.js'),
      '@ffmpeg/core': path.resolve(__dirname, 'node_modules/@ffmpeg/core')
    }
  },
  esbuild: {
    format: 'esm',
    target: 'esnext',
    treeShaking: true
  }
}); 