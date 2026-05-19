import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],

			manifest: {
				name: "ThreadX",
				short_name: "ThreadX",
				description:
					"A real-time messaging workspace for structured conversations and collaboration.",
				start_url: "/",
				display: "standalone",
				background_color: "#100D22",
				theme_color: "#100D22",
				orientation: "portrait",
				icons: [
					{
						src: "/icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/maskable_icon_x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/maskable_icon_x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},

			injectManifest: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
			},

			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: true,
				type: "module",
			},
		}),
	],
	// === Server tunneling ===
	// server: {
	// 	host: "0.0.0.0",
	// 	port: 5173,
	// 	hmr: {
	// 		clientPort: 443,
	// 	},
	// 	allowedHosts: [".trycloudflare.com"],
	// },
	// === End ===
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
