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

	return {
		apiKey,
		db,
		emitter
	}
}

const t = initTRPC.context<typeof createContext>().create({
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
	if (!ctx.apiKey || Array.isArray(ctx.apiKey)) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "INVALID_API_KEY_CONFIGURATION"
		})
	}

	const client = await ctx.db.client.findUnique({
		where: { apiKey: ctx.apiKey }
	})

	if (client === null) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "INVALID_API_KEY"
		})
	}

	return next({
		ctx: {
			client
		}
	})
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

export const mergeRouters = t.mergeRouters
