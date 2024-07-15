import dedent from "dedent"
import { default as fse } from "fs-extra"
import { resolve } from "pathe"

import { find, name } from "@/src/lib"

type Props = Partial<{
	config: string
	root: string
	content: any
}>

export const init = async (props: Props) => {
	const configPath = await find({
		config: props.config,
		root: props.root
	})

	if (configPath) {
		console.info(`Configuration file already exists at: \n\t ${configPath}`)
		return
	}

	// TODO: Reenable this once we have a better way of handling the usage of typescript
	//       since by default we are going to use Typescript. Raw javascript should be
	//       supported as well, but it is not currently supported.
	// const isUsingTypescript = await usingTypescript()
	const isUsingTypescript = true

	const rootDir = resolve(props.root || process.cwd())

	let outPath: string
	if (props.config) {
		outPath = resolve(rootDir, props.config)
	} else {
		outPath = resolve(
			rootDir,
			`${name}.config.${isUsingTypescript ? "ts" : "js"}`
		)
	}

	let content: string
	const config = props.content ?? {}

	content = dedent(`
        import { defineConfig } from "@nftchance/plug-router"

        export default defineConfig(${JSON.stringify(config)})
    `)

	await fse.writeFile(outPath, content)

	// ! Generate tsconfig.json if needed.
	if (
		!fse.existsSync(resolve(rootDir, "tsconfig.json")) &&
		isUsingTypescript
	) {
		const tsconfig = dedent(`
            {
            	"compilerOptions": {
            		"moduleResolution": "node",
            		"jsx": "preserve",
            		"allowSyntheticDefaultImports": true,
            		"allowImportingTsExtensions": true,
            		"noEmit": true,
            		"allowJs": true,
            		"rootDir": "./",
            		"outDir": "./dist",
            		"sourceMap": true,
            		"declaration": true,
            		"declarationMap": true,
            		"baseUrl": ".",
            		"paths": {
            			"@/*": ["./*"]
            		},
            		"target": "es2020",
            		"module": "commonjs",
            		"esModuleInterop": true,
            		"forceConsistentCasingInFileNames": true,
            		"strict": true,
            		"skipLibCheck": true
            	},
            	"exclude": ["src/references"]
            }
        `)

		await fse.writeFile(resolve(rootDir, "tsconfig.json"), tsconfig)
	}

	console.info(`Generated configuration file at: \n\t ${outPath}`)

	process.exit()
}
