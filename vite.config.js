import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tailwindcss(),
        TanStackRouterVite({
            routesDirectory: "./src/app/routes",
            generatedRouteTree: "./src/app/router/routeTree.gen.ts",
        }),
        react(),
    svgr()
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('framer-motion'))
                            return 'framer-motion';
                        if (id.includes('@tanstack'))
                            return 'router';
                        if (id.includes('react'))
                            return 'vendor';
                        return 'vendor';
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
});
