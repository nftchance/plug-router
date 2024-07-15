# 🔌 Plug Router

> [!NOTE]
> This repository is a submodule of the [Plug monorepo](https://github.com/nftchance/plug) that contains all the pieces of the Plug toolkit.

With the Plug Router, you can easily integrate your application with the Plug network. In a few lines of code, you can start receiving intent declarations permissioned to your solver, submit intents on the behalf of users (signers), simulate transaction routes, and more.

All of this has been made available through a simple SDK that is easy to use and consume so that you do not need to run any of the underlying infrastructure.

## Getting an API Key

> [!WARNING]
> This functionality is not publicly available yet. Please contact the team if you are interested in using the Plug Router or running a Solver.

## Usage

Getting started with router consumption is as simple as installing the package and instantiating the SDK with your API key.

```typescript
// Import the SDK from the built package.
import { createPlugSDK } from "@nftchance/plug-router"

// Create a validated instance of the SDK with your API key.
const plugSDK = createPlugSDK("YOUR_API_KEY")
```

Once you have the SDK, you can start using it to interact with the Plug network. There is intellisense support for all of the SDK methods and properties, so you can easily find what you are looking for.

> [!NOTE]
> There is not currently an OpenAPI specification for the Plug Router. If you would like to submit a PR that adds one, please do so!

## Development

For most, you should not need to install any system dependencies to run the application or utilize the SDK that is provided. However, if you are developing the application or server, you can find all the needed information to get started below.

### Dependencies

To run `@nftchance/plug-router` it is necessary to install the following dependencies first:

```ml
├─ docker — "Pipeline to run containerized code processes."
└─ pnpm — "Efficient package manager for Node modules."
```

### Configuration

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
