import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Builds js/sankofa-mascot.js for the chamber's static site: one self-contained file (React, Motion and the CSS
// included) that defines window.SankofaMascot. The site itself keeps needing no build step.
export default defineConfig({
  plugins: [react()],
  // React picks its production build from this; library mode doesn't set it
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "../js",
    emptyOutDir: false, // ../js holds the rest of the site's scripts
    copyPublicDir: false,
    minify: true,
    lib: {
      entry: "src/embed.tsx",
      name: "SankofaMascot",
      formats: ["iife"],
      fileName: () => "sankofa-mascot.js",
    },
  },
});
