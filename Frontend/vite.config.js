import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: true,
    proxy: {
      // Proxy API requests to Spring Boot backend so cookies and same-site issues are handled locally
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        // Forward cookies and allow the backend to set cookies
        configure: (proxy, options) => {
          // no-op, left for clarity; Vite's proxy will forward Set-Cookie headers by default for same-site
        }
      },
      // Serve uploads from backend as well
      '/uploads': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
