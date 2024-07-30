import { ensureDir, writeFile } from "fs-extra"
import { dirname, resolve } from "pathe"

import { configs, generateTypesReference } from "@/src/lib"

type Props = Parameters<typeof configs>[number]

export const schema = async (props: Props = {}) => {
	const cwd = process.cwd()
	const configurations = await configs(props)

	for await (const config of configurations) {
		if (!config.out.schema && !config.out.documentation) continue

		const { lines, documentation } = await generateTypesReference(config)

		if (lines && config.out.schema) {
			const schemaPath = resolve(
				cwd,
				config.out.schema,
				`${config.contract.filename}.sol`
			)
			await ensureDir(dirname(schemaPath))
			await writeFile(schemaPath, lines)
		}

		if (documentation && config.out.documentation) {
			for await (const element of documentation) {
				const restOfPath = element.path.split("/")
				const fileName = restOfPath.pop()
				const folderPath = restOfPath.join("/")

				const documentationPath = resolve(
					cwd,
					`${config.out.documentation}${folderPath}`,
					`${fileName}`
				)

				await ensureDir(dirname(documentationPath))
				await writeFile(documentationPath, element.markdown)
			}
		}
	}

	process.exit()
}
