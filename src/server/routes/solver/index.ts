import { createTRPCRouter } from "@/src/server/router"
import intent from "@/src/server/routes/solver/intent"
import simulate from "@/src/server/routes/solver/simulate"

export const solverRouter = createTRPCRouter({
	intent,
	simulate
})
