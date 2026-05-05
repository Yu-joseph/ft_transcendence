import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    hmr: {
      clientPort: 8443,
    },
  },
  // Allow running `npm run dev` from `frontend/` while keeping env in repo root.
  envDir: '..',
  plugins: [react(), tailwindcss()],
})


