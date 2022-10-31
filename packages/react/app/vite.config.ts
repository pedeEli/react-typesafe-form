import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@typesave-form/react': path.resolve('../src'),
      'typesave-form': path.resolve('../../typesave-form/src')
    }
  },
  plugins: [react()]
})
