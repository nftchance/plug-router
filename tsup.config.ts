import { defineConfig } from "tsup"

import { dependencies } from "./package.json"
import { getConfig } from "./src/lib/utils/bundle/tsup"

export default defineConfig(
	getConfig({
		entry: [
			"src/index.ts",
			"src/core/index.ts",
			"src/lib/index.ts",
			"src/sdk/index.ts",
			"src/server/index.ts"
		],
		external: [...Object.keys(dependencies)],
		sourcemap: true,
		platform: "node",
		treeshake: true
	})
)
