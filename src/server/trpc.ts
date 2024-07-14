import superjson from "superjson"
import { ZodError } from "zod"

import { TRPCError, initTRPC } from "@trpc/server"
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone"

import { db } from "@/src/server/db"
import { emitter } from "@/src/server/emitter"

export const createContext = async (
	options: CreateExpressContextOptions | CreateHTTPContextOptions
) => {
	let apiKey: string | string[] | undefined = undefined

	// If the request is made via the subscription link, the api key is
	// passed in the connectionParams rather than the headers.
	if ("headers" in options.req) {
		apiKey = options.req.headers["x-api-key"]
	} else if ("info" in options) {
		apiKey = options.info.connectionParams?.["x-api-key"]
	}

	if (Array.isArray(apiKey)) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "INVALID_API_KEY_CONFIGURATION"
		})
	}

	const client = apiKey
		? await db.client.findUnique({
				where: { apiKey }
			})
		: null

	return {
		apiKey,
		client,
		db,
		emitter
	}
}

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError
						? error.cause.flatten()
						: null
			}
		}
	}
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
	if (ctx.client === null) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "INVALID_API_KEY"
		})
	}

	return next({ ctx: { ...ctx, apiKey: ctx.apiKey!, client: ctx.client! } })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

export const mergeRouters = t.mergeRouters

export type Context = Awaited<ReturnType<typeof createContext>>
export type AuthenticatedContext = Context & {
	apiKey: NonNullable<Context["apiKey"]>
	client: NonNullable<Context["client"]>
}
