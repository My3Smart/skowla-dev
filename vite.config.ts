import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const laravel =
    env.VITE_LARAVEL_URL || "http://127.0.0.1:8000";

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,

      allowedHosts: [
        "skoola.my",
        "www.skoola.my",
        "skowla.com",
        "www.skowla.com",
        ".skoola.my",
        ".skowla.com",
      ],

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
