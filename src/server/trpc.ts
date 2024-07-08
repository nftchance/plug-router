import { IncomingMessage } from "http"
import superjson from "superjson"
import ws from "ws"
import { ZodError } from "zod"

import { initTRPC, TRPCError } from "@trpc/server"
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http"

import { db } from "@/src/server/db"
import { emitter } from "@/src/server/emitter"

export const createInnerTRPCContext = ({
	apiKey
}: {
	apiKey: string | string[] | undefined
}) => {
	return {
		apiKey,
		db,
		emitter
	}
}

export const createContext = async ({
	req
}:
	| CreateExpressContextOptions
	| NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
	const apiKey: string | string[] | undefined = req.headers["x-api-key"]

	return createInnerTRPCContext({ apiKey })
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
