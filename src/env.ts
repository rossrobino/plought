import { defineEnvVars } from "@sveltejs/kit/env";

/** Private environment variables resolved when the application is built. */
export const variables = defineEnvVars({ OPENAI_API_KEY: { static: true } });
