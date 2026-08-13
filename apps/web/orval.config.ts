import { defineConfig } from "orval";
import "dotenv/config";

export default defineConfig({
  api: {
    input: process.env.BACKEND_OPENAPI_URL,
    output: {
      baseUrl: process.env.BACKEND_API_URL,
      target: "./src/lib/api/generated.ts",
      client: "react-query",
      httpClient: "axios",
      clean: true,
    },
  },
});
