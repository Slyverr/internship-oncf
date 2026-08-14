import { defineConfig } from "orval";
import "dotenv/config";

export default defineConfig({
  api: {
    input: process.env.BACKEND_OPENAPI_URL,
    output: {
      target: "./src/lib/api/generated.ts",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "customInstance",
        },
      },
    },
  },
});
