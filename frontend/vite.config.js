import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify()
  ],
  server: {
    port: 5174,      // ← change this to whatever you like
    strictPort: true // ← optional: fail if 3000 is already in use
  }
})
