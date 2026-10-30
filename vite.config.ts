import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@game': path.resolve(__dirname, 'src/game'),
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          bootstrap: ['bootstrap'],
          supabase: ['@supabase/supabase-js'],
          game: ['src/game/index.ts'],
        }
      }
    }
  },
  base: '/',
  publicDir: 'public',
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  optimizeDeps: {
    include: ['bootstrap', 'bootstrap-icons']
  },
  esbuild: {
    target: 'es2020'
  }
})
