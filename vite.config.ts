import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path"; // This helps find your components
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // FIX: This ensures the app looks inside itself rather than your computer's root
  base: "./", 
  plugins: [
    react(), 
    viteSingleFile()
  ],
  resolve: {
    alias: {
      // FIX: This tells Vite that "@" means your "src" folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
