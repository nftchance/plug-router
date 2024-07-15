import { exec } from "child_process"

import { version } from "@/package.json"
import { env } from "@/src/lib/utils/bundle/env"

const startDatabase = (
	containerName: string,
	databaseName: string,
	databasePassword: string,
	port: string
) => {
	exec(
		`docker start ${containerName} || docker run --name ${containerName} -e POSTGRES_PASSWORD=${databasePassword} -p ${port}:${
			parseInt(port) - 2
		} -d ${databaseName}`,
		err => {
			if (err) {
				console.error(
					"Error starting the PostgreSQL container in Docker:",
					err
				)

				return
			}

			console.log(`   ◍ Plug PostgreSQL Database ${version}
   - Local: postgres://postgres:${databasePassword}@localhost:${port}/${databaseName}
   - Container Name: ${containerName}
   - Database Name: ${databaseName}
   - Database Port: ${port}
   - Environments: .env
`)
		}
	)
}

startDatabase(
	env.CONTAINER_NAME,
	env.DATABASE_NAME,
	env.DATABASE_PASSWORD,
	env.DATABASE_PORT
)
