import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoBase = "/app-tour/";

// https://vite.dev/config/
export default defineConfig({
	base: process.env.GITHUB_PAGES === "true" ? repoBase : "/",
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
});
