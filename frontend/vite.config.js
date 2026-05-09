import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/_/backend': {
<<<<<<< HEAD
        target: 'http://127.0.0.1:5000',
=======
        target: 'http://172.16.148.245:5000',
>>>>>>> 261fcc916b26cfcef58a99baba75f44abb416af8
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      }
    }
  }
})
