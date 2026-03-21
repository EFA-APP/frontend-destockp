import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    manifest: {
      name: "Sistema de Gestión",
      short_name: "SG",
      description: "Sistema de Gestión",
      theme_color: "#000000",
      background_color: "#ffffff", // 🔥 importante para iOS
      display: "standalone", // 🔥 clave
      start_url: "/", // 🔥 importante
      icons: [
        {
          src: "/efa-logo.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/efa-logo.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    }
  })],
  base: '/',
  server: {
    port: 5177,
    host: true,
    allowedHosts: ["ventryx.fun"],
    hmr: {
      host: 'ventryx.fun'
    }
  }
});
