import dedent from "dedent"
import { default as fs } from "fs-extra"
import path from "path"
import type { Options } from "tsup"

type GetConfig = Omit<
	Options,
	"bundle" | "clean" | "dts" | "entry" | "format"
> & {
	entry?: string[]
	dev?: boolean
	noExport?: string[]
}

export function getConfig({ dev, noExport, ...options }: GetConfig): Options {
	if (!options.entry?.length) throw new Error("entry is required")
	const entry: string[] = options.entry ?? []

	// Hacks tsup to create Preconstruct-like linked packages for development
	// https://github.com/preconstruct/preconstruct
	if (dev) {
		const entry: string[] = options.entry ?? []
		return {
			clean: true,
			// Only need to generate one file with tsup for development since we will create links in `onSuccess`
			entry: [entry[0] as string],
			format: ["cjs", "esm"],
			silent: true,
			async onSuccess() {
				// remove all files in dist
				await fs.emptyDir("dist")
				// symlink files and type definitions
				for (const file of entry) {
					const filePath = path.resolve(file)
					const distSourceFile = filePath
						.replace(file, file.replace("src/", "dist/"))
						.replace(/\.ts$/, ".js")
					// Make sure directory exists
					await fs.ensureDir(path.dirname(distSourceFile))
					// Create symlink between source and dist file
					await fs.symlink(filePath, distSourceFile, "file")
					// Create file linking up type definitions
					const srcTypesFile = path
						.relative(path.dirname(distSourceFile), filePath)
						.replace(/\.ts$/, "")
					await fs.outputFile(
						distSourceFile.replace(/\.js$/, ".d.ts"),
						`export * from '${srcTypesFile}'`
					)
				}
				const exports = await generateExports(entry, noExport)
				await generateProxyPackages(exports)
			}
		}
	}

	return {
		bundle: true,
		clean: true,
		dts: true,
		minify: true,
		minifyWhitespace: true,
		treeshake: true,
		format: ["cjs", "esm"],
		splitting: true,
		target: "es2021",
		async onSuccess() {
			if (typeof options.onSuccess === "function")
				await options.onSuccess()

			const exports = await generateExports(entry, noExport)
			await generateProxyPackages(exports)
		},
		...options
	}
}

type Exports = {
	[key: string]: string | { types?: string; default: string }
}

/**
 * Generate exports from entry files
 */
async function generateExports(entry: string[], noExport?: string[]) {
	const exports: Exports = {}
	for (const file of entry) {
		if (noExport?.includes(file)) continue
		const extension = path.extname(file)
		const fileWithoutExtension = file.replace(extension, "")
		const name = fileWithoutExtension
			.replace(/^src\//g, "./")
			.replace(/\/index$/, "")
		const distSourceFile = `${fileWithoutExtension.replace(
			/^src\//g,
			"./dist/"
		)}.js`
		const distTypesFile = `${fileWithoutExtension.replace(
			/^src\//g,
			"./dist/"
		)}.d.ts`
		exports[name] = {
			types: distTypesFile,
			default: distSourceFile
		}
	}

	exports["./package.json"] = "./package.json"

	const packageJson = await fs.readJSON("package.json")
	packageJson.exports = exports
	await fs.writeFile(
		"package.json",
		JSON.stringify(packageJson, null, 2) + "\n"
	)

	return exports
}

/**
 * Generate proxy packages files for each export
 */
async function generateProxyPackages(exports: Exports) {
	const ignorePaths = ["/dist"]
	const files = new Set<string>(["/dist", "LICENSE", "README.md"])

	for (const [key, value] of Object.entries(exports)) {
		if (typeof value === "string") continue
		if (key === ".") continue
		if (!value.default) continue
		await fs.ensureDir(key)
		const entrypoint = path.relative(key, value.default)
		const fileExists = await fs.pathExists(value.default)
		if (!fileExists)
			throw new Error(
				`Proxy package "${key}" entrypoint "${entrypoint}" does not exist.`
			)

		await fs.outputFile(
			`${key}/package.json`,
			dedent`{
                "main": "${entrypoint}"
            }`
		)
		ignorePaths.push("/" + key.replace(/^\.\//g, ""))

		const file = key.replace(/^\.\//g, "").split("/")[0]
		if (!file || files.has(file)) continue
		files.add(`/${file}`)
	}

	const packageJson = await fs.readJSON("package.json")
	packageJson.files = [...files.values()]
	await fs.writeFile(
		"package.json",
		JSON.stringify(packageJson, null, 2) + "\n"
	)

	if (ignorePaths.length === 0) return
	await fs.outputFile(
		".gitignore",
		dedent`
			# Generated file. Do not edit directly.
			# Based on https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore

			# Logs

			logs
			_.log
			npm-debug.log_
			yarn-debug.log*
			yarn-error.log*
			lerna-debug.log*
			.pnpm-debug.log*

			# Runtime data

			pids
			_.pid
			_.seed
			\*.pid.lock

			# DS Store files
			._\*
			.DS_Store

			# Dependency directories

			node_modules/

			# TypeScript cache

			\*.tsbuildinfo

			# dotenv environment variable files

			.env
			.env.development.local
			.env.test.local
			.env.production.local
			.env.local

			# Miscellaneous files
			scratch.ts

			${ignorePaths.join("\n")}
  		`
	)
}
