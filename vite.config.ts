import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Where the existing Laravel app is served (php artisan serve => :8000)
  const laravel = env.VITE_LARAVEL_URL || "http://127.0.0.1:8000";
  const proxy = Object.fromEntries(
    ["/api", "/login", "/logout", "/register", "/sanctum", "/forgot-password", "/reset-password", "/auth"].map(
      (p) => [p, { target: laravel, changeOrigin: true, secure: false }]
    )
  );

  return {
    server: {
      host: "::",
      port: 8080,
      proxy,
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
