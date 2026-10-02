import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@ecommand/shared";
import { en } from "../src/i18n/messages/en";

type MessageShape = {
	kind: "text" | "plural";
	placeholders: string[];
};

function placeholders(text: string): string[] {
	return [...text.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();
}

function collectMessages(
	value: unknown,
	prefix: string[] = [],
	result = new Map<string, MessageShape>(),
) {
	if (typeof value === "string") {
		result.set(prefix.join("."), {
			kind: "text",
			placeholders: placeholders(value),
		});
		return result;
	}
	assert.ok(
		value && typeof value === "object",
		`Invalid catalog at ${prefix.join(".")}`,
	);
	const entries = Object.entries(value);
	if (entries.length === 1 && entries[0][0] === "plural") {
		const forms = entries[0][1];
		assert.ok(
			forms && typeof forms === "object",
			`Invalid plural at ${prefix.join(".")}`,
		);
		const pluralForms = Object.values(forms);
		assert.ok(
			pluralForms.every((form) => typeof form === "string"),
			`Plural forms must be strings at ${prefix.join(".")}`,
		);
		assert.ok(
			Object.hasOwn(forms, "other"),
			`Plural messages require an other form at ${prefix.join(".")}`,
		);
		result.set(prefix.join("."), {
			kind: "plural",
			placeholders: [...new Set(pluralForms.flatMap(placeholders))].sort(),
		});
		return result;
	}
	for (const [key, child] of entries) {
		collectMessages(child, [...prefix, key], result);
	}
	return result;
}

const messageDirectory = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../src/i18n/messages",
);
const localeFiles = readdirSync(messageDirectory)
	.filter((file) => /^[a-z]{2}(?:-[A-Z]{2})?\.ts$/.test(file))
	.map((file) => file.slice(0, -3))
	.sort();

assert.equal(DEFAULT_LOCALE, "en", "English remains the default locale");
assert.deepEqual(
	[...SUPPORTED_LOCALES].sort(),
	localeFiles,
	"Every locale catalog file must be registered, and every registered locale needs a catalog file",
);

const englishMessages = collectMessages(en);

for (const locale of SUPPORTED_LOCALES) {
	const catalogModule = (await import(
		pathToFileURL(join(messageDirectory, `${locale}.ts`)).href
	)) as Record<string, unknown>;
	const catalog = catalogModule[locale];
	assert.ok(catalog, `Catalog module must export ${locale}`);
	const localizedMessages = collectMessages(catalog);
	const englishKeys = [...englishMessages.keys()].sort();
	const localizedKeys = [...localizedMessages.keys()].sort();
	assert.deepEqual(
		localizedKeys,
		englishKeys,
		`${locale} must have exactly the English message keys`,
	);

	for (const key of englishKeys) {
		const englishMessage = englishMessages.get(key);
		const localizedMessage = localizedMessages.get(key);
		assert.ok(englishMessage && localizedMessage);
		assert.equal(
			localizedMessage.kind,
			englishMessage.kind,
			`${locale}.${key} must preserve the message or plural shape`,
		);
		assert.deepEqual(
			localizedMessage.placeholders,
			englishMessage.placeholders,
			`${locale}.${key} must preserve interpolation variables`,
		);
	}
}

console.log(
	"Enabled locale catalogs match English keys and interpolation contracts.",
);
