import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5009',
        ws: true
      }
    }
  }
})
