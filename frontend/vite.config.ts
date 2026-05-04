import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['tictac', 'localhost'],
    hmr: {
      clientPort: 8443,
    },
  },
  envDir: '..',
  plugins: [react(), tailwindcss()],
})