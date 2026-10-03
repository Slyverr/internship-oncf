import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = readFileSync(
	resolve(
		dirname(fileURLToPath(import.meta.url)),
		"../src/components/claims/claim-conversation.tsx",
	),
	"utf8",
);

assert.match(
	source,
	/const composerRef = useRef<HTMLTextAreaElement>\(null\)/,
	"The conversation composer must have a stable focus target.",
);
assert.match(
	source,
	/restoreComposerFocus\.current = true/,
	"A valid message submission must request focus restoration.",
);
assert.match(
	source,
	/useEffect\(\(\) => \{[\s\S]*?if \(addComment\.isPending \|\| !restoreComposerFocus\.current\) return;[\s\S]*?restoreComposerFocus\.current = false;[\s\S]*?if \(open\) composerRef\.current\?\.focus\(\)/,
	"Submitting a message must restore focus to the composer when the request settles.",
);
assert.match(
	source,
	/<Textarea[\s\S]*?ref=\{composerRef\}[\s\S]*?readOnly=\{addComment\.isPending\}/,
	"A pending send must not disable the focused composer and force it to blur.",
);
assert.match(
	source,
	/if \(!open \|\| !canComment\) return;[\s\S]*?composerRef\.current\?\.focus\(\{ preventScroll: true \}\)/,
	"Opening a conversation must focus the composer without shifting the dialog scroll position.",
);
assert.match(
	source,
	/refetchInterval: open \? 5000 : false/,
	"An open conversation must refresh often enough to show new messages without polling while closed.",
);
assert.match(
	source,
	/Messages\.claims\.conversation\.messagesCount[\s\S]*?Messages\.claims\.conversation\.participantsCount/,
	"The conversation header must summarize the message and participant counts.",
);
assert.match(
	source,
	/Messages\.claims\.conversation\.showNewMessages/,
	"New incoming messages must be discoverable while the reader is away from the latest message.",
);

console.log("Claim conversation composer focus checks passed.");
