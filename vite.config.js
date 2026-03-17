import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: './',
  server: {
    port: 5177,
    host: true,
    allowedHosts: ["bosquesrl.store"],
    hmr: {
      host: 'bosquesrl.store'
    }
  }
});
