# 🔌 Plug Router

> [!NOTE]
> This repository is a submodule of the [Plug monorepo](https://github.com/nftchance/plug) that contains all the pieces of the Plug toolkit.

## Dependencies

To run `@nftchance/plug-router` it is necessary to install the following dependencies first:

```ml
├─ docker — "Pipeline to run containerized code processes."
└─ pnpm — "Efficient package manager for Node modules."
```

## Developer Configuration

`nftchance/plug-router` uses a [default-loaded configuration file](/src/lib/utils/env.ts) that is validated with the use of `zod`. All values can be overriden by setting values for each of the environment variables in your `.env` file.

> [!TIP]
> It is recommended that you use Docker. If you have a Docker process running, you do not even need to manually create a new container or deal with the complexities. There is [a built-in script that will create a new database and start the container for you](/src/lib/scripts/db.ts).

You can override the default configuration of any value by setting it in your `.env` file. Due to the validate nature of the configuration, if you ever have an issue with your configuration, you will automatically receive a runtime error that is bubbled up when you try to start the application.

The full list of configuration options is as follows:

```ml
├─ VERSION — "The version of the router."
├─ DATABASE_URL — "The URL the database is running on."
├─ PORT — "The port of the router API."
├─ API_URL — "The URL of the router API."
├─ RATE_LIMIT_ALLOW_LIST — "The list of IP addresses that bypass rate limiting."
├─ RATE_LIMIT_WINDOW_MS — "The window in milliseconds that rate limiting is applied to."
├─ RATE_LIMIT — "The number of requests allowed in the rate limiting window."
├─ RATE_LIMIT_MESSAGE — "The message that is returned when rate limiting is exceeded."
├─ SIMULATOR_URL — "The URL of the simulator API that is used to simulate transactions."
├─ SIMULATOR_API_KEY — "The API key of the simulation API."
├─ CONTAINER_NAME — "The Docker container name hosting the PostgreSQL database."
├─ DATABASE_NAME — "The name of the PostgreSQL database."
├─ DATABASE_PORT — "The port of the PostgreSQL database."
└─ DATABASE_PASSWORD — "The password of the PostgreSQL database."
```
