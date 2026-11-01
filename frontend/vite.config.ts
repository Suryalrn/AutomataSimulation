import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three') ||
            id.includes('node_modules/postprocessing')
          ) {
            return 'three-vendor'
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) {
            return 'motion-vendor'
          }
          if (id.includes('node_modules/@xyflow') || id.includes('node_modules/@dagrejs')) {
            return 'flow-vendor'
          }
        },
      },
    },
  },
})
