import assert from "node:assert/strict";
import { frDraft } from "../src/i18n/drafts/fr";
import { en } from "../src/i18n/messages/en";

type MessageShape = {
	kind: "text" | "plural";
	placeholders: string[];
};

function collectMessages(
	value: unknown,
	prefix: string[] = [],
	result = new Map<string, MessageShape>(),
) {
	if (typeof value === "string") {
		result.set(prefix.join("."), {
			kind: "text",
			placeholders: [...value.matchAll(/\{(\w+)\}/g)]
				.map(([, name]) => name)
				.sort(),
		});
		return result;
	}

	assert.ok(value && typeof value === "object");
	const entries = Object.entries(value);
	if (entries.length === 1 && entries[0][0] === "plural") {
		const forms = entries[0][1];
		assert.ok(forms && typeof forms === "object");
		const values = Object.values(forms);
		assert.ok(values.every((form) => typeof form === "string"));
		assert.ok(Object.hasOwn(forms, "other"));
		result.set(prefix.join("."), {
			kind: "plural",
			placeholders: [
				...new Set(
					values.flatMap((form) =>
						[...String(form).matchAll(/\{(\w+)\}/g)].map(([, name]) => name),
					),
				),
			].sort(),
		});
		return result;
	}

	for (const [key, child] of entries) {
		collectMessages(child, [...prefix, key], result);
	}
	return result;
}

const sections = ["common", "navigation", "roleProfiles"] as const;

for (const section of sections) {
	const englishMessages = collectMessages(en[section]);
	const frenchMessages = collectMessages(frDraft[section]);
	assert.deepEqual(
		[...frenchMessages.keys()].sort(),
		[...englishMessages.keys()].sort(),
		`French draft section ${section} must contain every English key`,
	);

	for (const [key, englishMessage] of englishMessages) {
		assert.deepEqual(
			frenchMessages.get(key),
			englishMessage,
			`French draft ${section}.${key} must preserve message shape and placeholders`,
		);
	}
}

console.log("French draft sections preserve English keys and placeholders.");
