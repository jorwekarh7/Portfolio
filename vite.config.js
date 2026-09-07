import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep npm run dev on the same local endpoint as Start-Preview.cmd.
  // Fail instead of starting another server on an unexpected fallback port.
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
})
