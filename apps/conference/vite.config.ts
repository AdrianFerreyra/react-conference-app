/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
