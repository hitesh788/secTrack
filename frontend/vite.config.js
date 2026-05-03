import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/_/backend': {
        target: 'http://172.16.148.245:5000',
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      }
    }
  }
})
