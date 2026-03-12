import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path"; // 1. Add this import
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./", 
  plugins: [
    react(), 
    viteSingleFile()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Add this alias for Shadcn
    },
  },
});
