import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/socket.io': {
        target: 'https://barge.igds1.com',
        ws: true
      }
    }
  }
})
