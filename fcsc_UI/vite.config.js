import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/NL2SQL-Assistant/',  // Only needed if app is served from subdirectory
  server: {
    host: '0.0.0.0', // allow access from other machines (like your laptop)
    port: 3000,      // specify the port
  }
})