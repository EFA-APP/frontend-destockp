/* eslint-disable no-undef */
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5177,
    allowedHosts: ["localhost", "ventryx.fun"],
    hmr: {
      protocol: "wss",
      host: "ventryx.fun",
      port: 443,
    },
  },
});
