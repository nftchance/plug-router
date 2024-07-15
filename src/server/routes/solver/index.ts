import { createTRPCRouter } from "@/src/server"
import intent from "@/src/server/routes/solver/intent"
import simulate from "@/src/server/routes/solver/simulate"

export const solverRouter = createTRPCRouter({
	intent,
	simulate
})
