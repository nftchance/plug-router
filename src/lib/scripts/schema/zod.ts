import { ensureDir, writeFile } from "fs-extra"
import { dirname, resolve } from "pathe"

import { configs, generateZodSchema } from "@/src/lib"

type Props = Parameters<typeof configs>[number]

export const zod = async (props: Props = {}) => {
	const cwd = process.cwd()
	const configurations = await configs(props)

	for await (const config of configurations) {
		if (!config.out.zod) continue

		const { schemas } = await generateZodSchema(config)

		const zodPath = resolve(cwd, config.out.zod, "types.ts")

		await ensureDir(dirname(zodPath))
		await writeFile(zodPath, schemas)
	}

	process.exit()
}
