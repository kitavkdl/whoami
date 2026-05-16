// Vercel-only Vite config.
//
// Lovable's default `vite.config.ts` uses @lovable.dev/vite-tanstack-config,
// which bundles the Cloudflare Workers plugin — incompatible with Vercel.
// Vercel's build runs this config instead (see vercel.json -> buildCommand).
//
// Plugin order matters: tanstackStart() must come before viteReact().
// nitro() turns SSR output into a Vercel Function automatically.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
