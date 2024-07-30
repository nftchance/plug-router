#!/usr/bin/env node
import { Command } from "commander"

import { init, processes, references, schema, start, zod } from "@/src/lib"

const command = new Command()

command
	.name("plug")
	.description("The Plug toolkit powering full-suite intent management.")

command
	.command("init")
	.description("Initialize the Plug toolkit.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.action(init)

command
	.command("schema")
	.description("Generate the full-suite schema.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.action(schema)

command
	.command("zod")
	.description("Generate the accompanying Zod schema.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.action(zod)

command
	.command("processes")
	.description("List all the processes in the configuration.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.action(processes)

command
	.command("references")
	.description("Generate references for onchain data.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.action(references)

command
	.command("start")
	.description("Run the solver.")
	.option("-c --config <config>", "Path to config file.")
	.option("-r --root <root>", "Path to root directory.")
	.option("-p --process <process>", "Process to run.")
	.action(start)

// Run commander with async/await.
;(async function () {
	await command.parseAsync(process.argv)
})()
