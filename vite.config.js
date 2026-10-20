import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 백엔드 포트 = 프론트 포트($PORT) + 100
const API_PORT = Number(process.env.SERVER_PORT) || 3198

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
