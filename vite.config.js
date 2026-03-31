import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
  },
  server: {
    host: true,
  },
});
