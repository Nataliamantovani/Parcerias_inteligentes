import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Configuração própria dos testes, separada do vite.config.ts da aplicação.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "supabase/tests/**/*.test.ts"],
    environment: "node",
  },
});
