import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@typesafe-form/svelte': path.resolve('../src'),
      'typesafe-form': path.resolve('../../typesafe-form/src')
    }
  },
  plugins: [svelte()]
})
