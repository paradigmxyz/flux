import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ["stream"],
    }),
  ],
});
