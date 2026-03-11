import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envDir: '..',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,          // allows Docker access
    allowedHosts: true   // allows nginx host (frontend)
  }
})

