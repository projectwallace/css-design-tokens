import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import pkg from "./package.json"

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			formats: ["es"],
		},
		rollupOptions: {
			external: Object.keys(pkg.dependencies).concat('colorjs.io/fn'),
		},
	},
	plugins: [
		dts(),
	],
})