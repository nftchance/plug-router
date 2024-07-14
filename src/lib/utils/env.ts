import dotenv from "dotenv"
import { z } from "zod"

import { version } from "@/package.json"

dotenv.config()

const DEFAULT_PORT = "4000"

export const envSchema = z.object({
	// Top level definitions
	VERSION: z.string().optional().default(version),
	DATABASE_URL: z.string().min(1),
	PORT: z.string().optional().default(DEFAULT_PORT),
	API_URL: z
		.string()
		.optional()
		.default(`http://localhost:${DEFAULT_PORT}`)
		.refine(url => url.startsWith("http"), "API_URL must start with http"),
	// Simulation definitions
	SIMULATOR_URL: z
		.string()
		.default("http://localhost:8080")
		.refine(
			url => url.startsWith("http"),
			"SIMULATOR_URL must start with http"
		),
	SIMULATOR_API_KEY: z.string().min(1),
	// Database definitions
	CONTAINER_NAME: z.string().optional().default("postgres-router"),
	DATABASE_NAME: z.string().optional().default("postgres"),
	DATABASE_PORT: z.string().optional().default("5434"),
	DATABASE_PASSWORD: z.string().optional().default("postgres")
})

export type Env = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

if (parsed.success === false) {
	throw new Error(`Invalid environment variables: ${parsed.error}`)
}

export const env = parsed.data

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
