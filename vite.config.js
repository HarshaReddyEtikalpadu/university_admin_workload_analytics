import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs
    // Use PORT env var if provided; fallback to 5173
    port: Number(process.env.PORT) || 5173,
    // Allow Vite to choose the next free port automatically
    strictPort: false,
    open: true // Open browser on start
  }
})
