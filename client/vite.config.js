import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "os";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    cacheDir: path.resolve(os.tmpdir(), 'vite-cache'),
});