import { bundleRequire } from "bundle-require"
import { findUp } from "find-up"
import { default as fse } from "fs-extra"
import { basename, resolve } from "pathe"

import { defineConfig } from "@/src/core"

export type MaybeArray<T> = T | T[]

export const name = "plug" as const

export const configFiles = [
	`${name}.config.ts`,
	`${name}.config.js`,
	`${name}.config.mjs`,
	`${name}.config.mts`
] as const

export async function find({
	config,
	root
}: Partial<{ config: string; root: string }> | undefined = {}) {
	const rootDir = resolve(root || process.cwd())

	// ! We already know where the config is.
	if (config) {
		const path = resolve(rootDir, config)

		if (fse.pathExistsSync(path)) return path

		return
	}

	// * We don't know where the config is, so we need to find it.
	return await findUp(configFiles, { cwd: rootDir })
}

export async function load({
	configPath
}: {
	configPath: string
}): Promise<MaybeArray<ReturnType<typeof defineConfig>>> {
	const res = await bundleRequire({
		filepath: configPath
	})

	let config = res.mod.default

	if (config.default) config = config.default

	if (typeof config !== "function") return config

	return await config()
}

export async function usingTypescript() {
	try {
		const cwd = process.cwd()
		const tsconfig = await findUp("tsconfig.json", { cwd })

		return !!tsconfig
	} catch {
		return false
	}
}

export async function configs(
	options: Partial<{
		config: string
		root: string
	}> = {}
) {
	const configPath = await find({
		config: options.config,
		root: options.root
	})

	if (configPath) {
		const resolvedConfigs = await load({ configPath })

		const isArrayConfig = Array.isArray(resolvedConfigs)

		console.info(`Using config at index:\n\t${basename(configPath)}`)

		return isArrayConfig ? resolvedConfigs : [resolvedConfigs]
	}

	console.warn(`Could not find configuration file. Using default.`)

	return [defineConfig({ networks: {} })]
}
