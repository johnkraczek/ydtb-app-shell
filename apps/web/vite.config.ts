import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    conditions: ["dev-src", "import", "module", "browser", "default"],
  },
  server: {
    port: 4173,
    host: "0.0.0.0",
  },
})
