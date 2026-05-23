import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@app': resolve(__dirname, 'src/app'),
      '@components': resolve(__dirname, 'src/components'),
      '@features': resolve(__dirname, 'src/features'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[proxy error]', err.message);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log('[proxy →]', req.method, req.url);
          });
        },
      },
    },
  },

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux':    ['@reduxjs/toolkit', 'react-redux'],
          'vendor-monaco':   ['monaco-editor', '@monaco-editor/react'],
          'vendor-framer':   ['framer-motion'],
          'vendor-firebase': ['firebase'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    target: 'esnext',
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      '@reduxjs/toolkit', 'react-redux',
      'axios', 'framer-motion', 'react-hot-toast',
    ],
    exclude: ['monaco-editor'],
  },

  envPrefix: 'VITE_',
});