import { defineConfig } from "vite";
import vercel from "vite-plugin-vercel";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [vercel(), glsl()],
});
