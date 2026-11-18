import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_BASE || "http://172.250.40.238:5080";
  return {
    server: {
      port: 5173,
      proxy: {
        "/admin": { target, changeOrigin: true },
      },
    },
  };
});