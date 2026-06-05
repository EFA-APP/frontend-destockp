/* eslint-disable no-undef */
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5177,
    allowedHosts: ["localhost", "ventryx.fun"],
    // Use default HMR settings for local development (ws on localhost)
    // hmr configuration removed to avoid mismatched WebSocket connection
  },
});
