import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // So `npm run dev` works standalone too, without going through Caddy.
      "/api": "http://localhost:8000",
    },
  },
});
