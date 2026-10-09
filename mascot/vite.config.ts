import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The demo app: npm run dev, then open http://localhost:5174
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
