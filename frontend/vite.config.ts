import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: {
      clientPort: 8443,
      protocol: 'wss'
    },
  },
  envDir: '..',
  plugins: [react(), tailwindcss()],
  build: {
  sourcemap: false,
  },
  css: {
    devSourcemap: false,
  }
})