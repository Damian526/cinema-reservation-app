import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174, // ← change this to whatever you like
    strictPort: true, // ← optional: fail if 3000 is already in use
  },
});
