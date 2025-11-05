import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          ethers: ['ethers']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});

