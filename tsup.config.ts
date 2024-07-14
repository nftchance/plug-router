import { defineConfig } from "tsup"

import { dependencies } from "./package.json"
import { getConfig } from "./src/lib/utils/tsup"

export default defineConfig(
	getConfig({
		entry: ["src/index.ts"],
		external: [...Object.keys(dependencies)],
		sourcemap: true,
		platform: "node"
	})
)
