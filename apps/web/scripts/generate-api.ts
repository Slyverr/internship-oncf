import { readFile, writeFile } from "node:fs/promises";
import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "orval";
import { validateOpenApiForGeneration } from "./openapi-validation";

const openApiUrl = process.env.BACKEND_OPENAPI_URL;
if (!openApiUrl) {
	throw new Error(
		"BACKEND_OPENAPI_URL must point to the running API OpenAPI JSON endpoint.",
	);
}

const response = await fetch(openApiUrl);
if (!response.ok) {
	throw new Error(
		`OpenAPI request failed with HTTP ${response.status} (${openApiUrl}).`,
	);
}

const document: unknown = await response.json();
const issues = validateOpenApiForGeneration(document);
if (issues.length > 0) {
	throw new Error(
		[
			"OpenAPI preflight failed; the generated client was left unchanged.",
			"Use the documented real Node.js API runtime, then retry.",
			...issues.map((issue) => `- ${issue}`),
		].join("\n"),
	);
}

console.info("OpenAPI preflight passed; generating the web API client.");
const webDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await generate(undefined, webDirectory, {
	watch: process.argv.includes("--watch"),
	throwOnError: true,
});

const schemaPath = resolve(webDirectory, "src/lib/api/generated.schemas.ts");
const generatedSchemas = await readFile(schemaPath, "utf8");
await writeFile(schemaPath, `${generatedSchemas.trimEnd()}\n`);
