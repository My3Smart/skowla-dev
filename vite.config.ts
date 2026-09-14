import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const laravel =
    env.VITE_LARAVEL_URL || "http://127.0.0.1:8000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: laravel,
          changeOrigin: true,
          secure: false,
        },
        "/sanctum": {
          target: laravel,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});