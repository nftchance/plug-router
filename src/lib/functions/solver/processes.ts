import { Process } from "@/src/core/solver/processes"
import { Processes } from "@/src/lib/types"

export function getProcessNames<TProcesses extends Record<string, unknown>>(
	processes: TProcesses,
	names: Array<string> = [],
	nameTree: string = ""
): Array<string> {
	if (!processes) return []

	for (const [key, value] of Object.entries(processes)) {
		// ! If the accessed object is a Process.
		if (value instanceof Process) {
			names.push(`${nameTree}${key}`)
		}

		// ! If the accessed object is still an object with values (Record).
		else if (value && typeof value === "object") {
			getProcessNames(value as TProcesses, names, `${nameTree}${key}.`)
		}

		// ! If the accessed object is a primitive.
		// * While this is not expected, it is possible.
		else if (value && typeof value !== "object") {
			names.push(`${nameTree}${key}`)
		}
	}

	return names
}

export function getProcess(processes: Processes | undefined, name: string) {
	if (processes === undefined) return

	const pieces = name.split(".")

	let process = processes
	for (const piece of pieces) {
		if (!process[piece]) return

		process = process[piece]
	}

	if (process instanceof Process) return process

	return
}
