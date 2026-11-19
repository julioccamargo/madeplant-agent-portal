import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_BASE || "http://172.250.40.238:5080";
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        "/admin": { target, changeOrigin: true },
      },
    },
  };
});