import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

type Viewport = { width: number; height: number };
type CdpMessage = {
	id?: number;
	method?: string;
	params?: Record<string, unknown>;
	result?: Record<string, unknown>;
	error?: { message?: string };
};

const defaultViewports: Viewport[] = [
	{ width: 320, height: 568 },
	{ width: 375, height: 812 },
	{ width: 390, height: 844 },
	{ width: 640, height: 800 },
	{ width: 768, height: 1024 },
	{ width: 1024, height: 768 },
	{ width: 1440, height: 900 },
	{ width: 1920, height: 1080 },
	{ width: 2560, height: 1440 },
	{ width: 3840, height: 2160 },
];

const args = process.argv.slice(2);
const route = readOption("--url");
const outputDirectory = resolve(
	readOption("--out") ?? "/tmp/ecommand-ui-review",
);
const label = (
	readOption("--label") ?? (route ? basename(route) || "home" : "current-page")
).replace(/[^a-zA-Z0-9_.-]/g, "-");
const cdpUrl = readOption("--cdp") ?? "http://localhost:9235";
const freshContext = args.includes("--fresh-context");
const settleMs = Number(readOption("--settle-ms") ?? "500");
const clickSelectors = readOptions("--click");
const waitSelector = readOption("--wait-for");
const requestedWidths = readOption("--widths")?.split(",").map(Number);
const viewports = requestedWidths
	? requestedWidths.map((width) => ({
			width,
			height:
				defaultViewports.find((viewport) => viewport.width === width)?.height ??
				Math.round((width * 9) / 16),
		}))
	: defaultViewports;

if (args.includes("--help")) {
	console.log(`Capture the current ECommand browser page across responsive viewports.

Usage: bun run ui:review -- [options]
  --url <path-or-url>    Route to capture; defaults to the current browser URL
  --fresh-context        Use an isolated browser profile without saved app login
  --label <name>         Screenshot filename prefix
  --click <selector>     Click a non-submitting control before capture (repeatable)
  --wait-for <selector>  Wait for a UI element after the route and clicks
  --widths <list>        Comma-separated widths; defaults to 320..3840px
  --out <directory>     Output directory (default: /tmp/ecommand-ui-review)
  --cdp <url>            Chrome DevTools endpoint (default: http://localhost:9235)
  --settle-ms <number>   Delay after route/actions (default: 500)

The local web app and a Chrome session with remote debugging enabled must be running.
The tool saves screenshots and reports page overflow; it does not submit forms or
compare pixels against a baseline.`);
	process.exit(0);
}

const targetsResponse = await fetch(new URL("/json/list", cdpUrl));
if (!targetsResponse.ok) {
	throw new Error(`Chrome DevTools is unavailable at ${cdpUrl}.`);
}
const targets = (await targetsResponse.json()) as Array<{
	type: string;
	url: string;
	webSocketDebuggerUrl: string;
}>;
const pageTargets = targets.filter((target) => target.type === "page");
const appOrigin = route?.startsWith("http")
	? new URL(route).origin
	: new URL(
			pageTargets.find((target) => target.url.startsWith("http"))?.url ??
				"http://localhost:3000",
		).origin;
const originalTarget = pageTargets.find((target) =>
	target.url.startsWith(appOrigin),
);
if (!originalTarget) {
	throw new Error("No open web page was found in the Chrome session.");
}

const initialUrl = originalTarget.url;
const baseUrl = route ? new URL(route, initialUrl).href : initialUrl;
let captureTarget = originalTarget;
let isolatedContextId: string | undefined;
let isolatedTargetId: string | undefined;
let browserSocket: WebSocket | undefined;
let browserCall:
	| ((method: string, params?: Record<string, unknown>) => Promise<CdpMessage>)
	| undefined;

if (freshContext) {
	const version = (await (
		await fetch(new URL("/json/version", cdpUrl))
	).json()) as {
		webSocketDebuggerUrl: string;
	};
	browserSocket = new WebSocket(version.webSocketDebuggerUrl);
	await new Promise<void>((resolveOpen, rejectOpen) => {
		browserSocket?.addEventListener("open", () => resolveOpen(), {
			once: true,
		});
		browserSocket?.addEventListener(
			"error",
			() => rejectOpen(new Error("Could not connect to the Chrome browser.")),
			{ once: true },
		);
	});
	let browserId = 0;
	const browserPending = new Map<number, (message: CdpMessage) => void>();
	browserSocket.addEventListener("message", (event) => {
		const message = JSON.parse(String(event.data)) as CdpMessage;
		if (message.id !== undefined) {
			browserPending.get(message.id)?.(message);
			browserPending.delete(message.id);
		}
	});
	browserCall = (method, params = {}) =>
		new Promise<CdpMessage>((resolveCall, rejectCall) => {
			const id = ++browserId;
			browserPending.set(id, (message) => {
				if (message.error)
					rejectCall(new Error(message.error.message ?? method));
				else resolveCall(message);
			});
			browserSocket?.send(JSON.stringify({ id, method, params }));
		});
	const context = await browserCall("Target.createBrowserContext", {
		disposeOnDetach: true,
	});
	isolatedContextId = context.result?.browserContextId as string | undefined;
	if (!isolatedContextId)
		throw new Error("Chrome did not create an isolated browser profile.");
	const createdTarget = await browserCall("Target.createTarget", {
		url: "about:blank",
		browserContextId: isolatedContextId,
	});
	isolatedTargetId = createdTarget.result?.targetId as string | undefined;
	if (!isolatedTargetId)
		throw new Error("Chrome did not create an isolated tab.");
	for (let attempt = 0; attempt < 20; attempt++) {
		const currentTargets = (await (
			await fetch(new URL("/json/list", cdpUrl))
		).json()) as Array<{
			id: string;
			type: string;
			url: string;
			webSocketDebuggerUrl: string;
		}>;
		const found = currentTargets.find(
			(target) => target.id === isolatedTargetId && target.type === "page",
		);
		if (found) {
			captureTarget = found;
			break;
		}
		await Bun.sleep(50);
	}
	if (captureTarget === originalTarget)
		throw new Error("The isolated browser tab did not become available.");
}

const socket = new WebSocket(captureTarget.webSocketDebuggerUrl);
await new Promise<void>((resolveOpen, rejectOpen) => {
	socket.addEventListener("open", () => resolveOpen(), { once: true });
	socket.addEventListener(
		"error",
		() => rejectOpen(new Error("Could not connect to the open Chrome page.")),
		{ once: true },
	);
});

let nextId = 0;
const pending = new Map<number, (message: CdpMessage) => void>();
const eventListeners = new Map<string, Array<(message: CdpMessage) => void>>();
socket.addEventListener("message", (event) => {
	const message = JSON.parse(String(event.data)) as CdpMessage;
	if (message.id !== undefined) {
		pending.get(message.id)?.(message);
		pending.delete(message.id);
	}
	if (message.method) {
		for (const listener of eventListeners.get(message.method) ?? [])
			listener(message);
	}
});

function call(method: string, params: Record<string, unknown> = {}) {
	return new Promise<CdpMessage>((resolveCall, rejectCall) => {
		const id = ++nextId;
		const timer = setTimeout(() => {
			pending.delete(id);
			rejectCall(new Error(`Chrome DevTools command timed out: ${method}`));
		}, 15_000);
		pending.set(id, (message) => {
			clearTimeout(timer);
			if (message.error) rejectCall(new Error(message.error.message ?? method));
			else resolveCall(message);
		});
		socket.send(JSON.stringify({ id, method, params }));
	});
}

function waitForEvent(method: string) {
	return new Promise<void>((resolveEvent) => {
		const listeners = eventListeners.get(method) ?? [];
		const listener = () => {
			eventListeners.set(
				method,
				(eventListeners.get(method) ?? []).filter(
					(candidate) => candidate !== listener,
				),
			);
			resolveEvent();
		};
		listeners.push(listener);
		eventListeners.set(method, listeners);
	});
}

async function evaluate<T>(expression: string): Promise<T> {
	const response = await call("Runtime.evaluate", {
		expression,
		returnByValue: true,
		awaitPromise: true,
	});
	const result = response.result?.result as
		| { value?: T; description?: string }
		| undefined;
	if (!result || !("value" in result))
		throw new Error(
			`Browser evaluation failed: ${result?.description ?? expression}`,
		);
	return result.value as T;
}

async function navigate(url: string) {
	const loaded = waitForEvent("Page.loadEventFired");
	await call("Page.navigate", { url });
	await loaded;
	await evaluate<boolean>("document.fonts?.ready.then(() => true) ?? true");
	if (settleMs > 0) await Bun.sleep(settleMs);
}

await Promise.all([call("Page.enable"), call("Runtime.enable")]);
await mkdir(outputDirectory, { recursive: true });

type CaptureResult = {
	width: number;
	height: number;
	file: string;
	pageWidth: number;
	pageHeight: number;
	horizontalOverflow: boolean;
	missingClickTargets: string[];
	waitSelectorFound: boolean | null;
	actualRoute: string;
	routeMatches: boolean;
};
const results: CaptureResult[] = [];

try {
	for (const viewport of viewports) {
		await navigate(baseUrl);
		await call("Emulation.setDeviceMetricsOverride", {
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: 1,
			mobile: viewport.width <= 640,
		});
		if (settleMs > 0) await Bun.sleep(Math.min(settleMs, 500));

		const missingClickTargets: string[] = [];
		for (const selector of clickSelectors) {
			const clicked = await evaluate<boolean>(`(() => {
				const target = document.querySelector(${JSON.stringify(selector)});
				if (!target) return false;
				target.click();
				return true;
			})()`);
			if (!clicked) missingClickTargets.push(selector);
			if (settleMs > 0) await Bun.sleep(Math.min(settleMs, 500));
		}

		let waitSelectorFound: boolean | null = null;
		if (waitSelector) {
			waitSelectorFound = await evaluate<boolean>(
				`Boolean(document.querySelector(${JSON.stringify(waitSelector)}))`,
			);
		}
		await evaluate<boolean>("document.fonts?.ready.then(() => true) ?? true");

		const dimensions = await evaluate<{
			pageWidth: number;
			pageHeight: number;
			actualRoute: string;
		}>(`({
			pageWidth: document.documentElement.scrollWidth,
			pageHeight: document.documentElement.scrollHeight,
			actualRoute: location.href,
		})`);
		const expectedPath = new URL(baseUrl).pathname;
		const actualPath = new URL(dimensions.actualRoute).pathname;
		const file = resolve(
			outputDirectory,
			`${label}-${viewport.width}x${viewport.height}.png`,
		);
		const screenshot = await call("Page.captureScreenshot", {
			format: "png",
			captureBeyondViewport: false,
		});
		const data = (screenshot.result?.data as string | undefined) ?? "";
		if (!data)
			throw new Error(`Chrome returned no screenshot at ${viewport.width}px.`);
		await Bun.write(file, Buffer.from(data, "base64"));
		results.push({
			...viewport,
			file,
			...dimensions,
			horizontalOverflow: dimensions.pageWidth > viewport.width,
			missingClickTargets,
			waitSelectorFound,
			actualRoute: dimensions.actualRoute,
			routeMatches: actualPath === expectedPath,
		});
	}
} finally {
	await call("Emulation.clearDeviceMetricsOverride").catch(() => undefined);
	if (!freshContext && baseUrl !== initialUrl)
		await navigate(initialUrl).catch(() => undefined);
	socket.close();
	if (browserSocket && browserCall && isolatedContextId) {
		if (isolatedTargetId)
			await browserCall("Target.closeTarget", {
				targetId: isolatedTargetId,
			}).catch(() => undefined);
		await browserCall("Target.disposeBrowserContext", {
			browserContextId: isolatedContextId,
		}).catch(() => undefined);
		browserSocket.close();
	}
}

console.log(
	JSON.stringify(
		{
			route: new URL(baseUrl).pathname,
			outputDirectory,
			freshContext,
			results,
		},
		null,
		2,
	),
);
if (results.some((result) => result.horizontalOverflow)) process.exitCode = 1;
if (results.some((result) => result.missingClickTargets.length > 0))
	process.exitCode = 1;
if (results.some((result) => result.waitSelectorFound === false))
	process.exitCode = 1;
if (results.some((result) => !result.routeMatches)) process.exitCode = 1;

function readOption(name: string): string | undefined {
	const index = args.indexOf(name);
	return index === -1 ? undefined : args[index + 1];
}

function readOptions(name: string): string[] {
	const values: string[] = [];
	for (let index = 0; index < args.length; index++) {
		if (args[index] === name && args[index + 1]) values.push(args[index + 1]);
	}
	return values;
}
