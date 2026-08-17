import { defineConfig } from "orval";
import "dotenv/config";

export default defineConfig({
  api: {
    input: process.env.BACKEND_OPENAPI_URL,
    output: {
      mode: "tags",
      target: "./src/lib/api/generated.ts",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "customFetch",
        },
      },
    },
  },
});

