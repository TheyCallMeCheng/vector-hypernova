import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: '0.0.0.0', // Listen on all network addresses
    port: 5173,      // Explicitly set port
    allowedHosts: ['.trycloudflare.com'], // Allow the tunnel URL
    proxy: {
      // 1. Forward HTTP requests (like /api/token)
      '/api': {
        target: 'http://localhost:2567',
        changeOrigin: true,
        secure: false,
      },
      // 2. Forward WebSocket requests (Colyseus)
      // This catches any request starting with /colyseus (or whatever path you use)
      '/colyseus': {
        target: 'http://localhost:2567',
        ws: true, // IMPORTANT: Enable WebSocket proxying
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/colyseus/, '')
      }
    }
  }
})
