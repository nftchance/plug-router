import dotenv from "dotenv"
import { z } from "zod"

import { version } from "@/package.json"

dotenv.config()

const DEFAULT_PORT = "4000"
const DEFAULT_RATE_LIMIT_ALLOW_LIST = ["127.0.0.1", "localhost"].join(",")
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_RATE_LIMIT = 100

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
	// Rate limit definitions
	RATE_LIMIT_ALLOW_LIST: z
		.string()
		.optional()
		.default(DEFAULT_RATE_LIMIT_ALLOW_LIST)
		.transform(val => val.split(",")),
	RATE_LIMIT_WINDOW_MS: z
		.string()
		.optional()
		.default(`${DEFAULT_RATE_LIMIT_WINDOW_MS}`)
		.transform(val => parseInt(val)),
	RATE_LIMIT: z
		.string()
		.optional()
		.default(`${DEFAULT_RATE_LIMIT}`)
		.transform(val => parseInt(val)),
	RATE_LIMIT_MESSAGE: z
		.string()
		.optional()
		.default("Too many requests, please try again later."),
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
