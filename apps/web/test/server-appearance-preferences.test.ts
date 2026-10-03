import assert from "node:assert/strict";
import {
	type AppearancePreferences,
	DEFAULT_APPEARANCE_PREFERENCES,
} from "@ecommand/shared";
import { serializeAppearancePreferenceCookie } from "../src/lib/appearance-preference-cookie";
import { getServerAppearancePreferences } from "../src/lib/server-appearance-preferences";

const token = `header.${Buffer.from(JSON.stringify({ sub: 42 })).toString("base64url")}.signature`;
const cookiePreferences: AppearancePreferences = {
	...DEFAULT_APPEARANCE_PREFERENCES,
	workspaceLayout: "sidebar",
};
const databasePreferences: AppearancePreferences = {
	...DEFAULT_APPEARANCE_PREFERENCES,
	workspaceLayout: "centered-header",
};

function cookieStore(appearance = cookiePreferences) {
	return {
		get(name: string) {
			if (name === "access_token") return { value: token };
			if (name === "ecommand-appearance") {
				return {
					value: serializeAppearancePreferenceCookie(appearance, 42),
				};
			}
			return undefined;
		},
	};
}

const databaseResult = await getServerAppearancePreferences({
	getCookies: async () => cookieStore() as never,
	getPreferences: async () => databasePreferences as never,
});
assert.deepEqual(
	databaseResult,
	databasePreferences,
	"the current database preference must drive the server-rendered layout over a stale browser cache",
);

const cachedResult = await getServerAppearancePreferences({
	getCookies: async () => cookieStore() as never,
	getPreferences: async () => {
		throw new Error("API unavailable");
	},
});
assert.deepEqual(
	cachedResult,
	cookiePreferences,
	"the browser preference remains a server-rendering fallback while the API is unavailable",
);

const emptyResult = await getServerAppearancePreferences({
	getCookies: async () => cookieStore() as never,
	getPreferences: async () => null as never,
});
assert.deepEqual(
	emptyResult,
	cookiePreferences,
	"a local preference is retained when no database preference has been saved yet",
);

console.log("Server-rendered appearance preference checks passed.");
