try {
	const stored = JSON.parse(
		localStorage.getItem("ecommand-appearance") || "null",
	);
	const legacyTheme = localStorage.getItem("ecommand-theme");
	const themes = ["light", "dark", "mono-light", "mono-dark", "system"];
	const fonts = ["inter", "geist", "system"];
	const sizes = ["small", "default", "large"];
	const motions = ["system", "reduced"];
	const workspaceLayouts = ["sidebar", "centered-header"];
	const theme = themes.includes(stored?.theme)
		? stored.theme
		: themes.includes(legacyTheme)
			? legacyTheme
			: "system";
	const fontFamily = fonts.includes(stored?.fontFamily)
		? stored.fontFamily
		: "inter";
	const textSize = sizes.includes(stored?.textSize)
		? stored.textSize
		: "default";
	const motion = motions.includes(stored?.motion) ? stored.motion : "system";
	const workspaceLayout = workspaceLayouts.includes(stored?.workspaceLayout)
		? stored.workspaceLayout
		: "sidebar";
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const dark =
		theme === "dark" ||
		theme === "mono-dark" ||
		(theme === "system" && prefersDark);

	document.documentElement.classList.toggle("dark", dark);
	document.documentElement.dataset.theme = theme;
	document.documentElement.dataset.fontFamily = fontFamily;
	document.documentElement.dataset.textSize = textSize;
	document.documentElement.dataset.motion = motion;
	document.documentElement.dataset.workspaceLayout = workspaceLayout;
} catch {}
