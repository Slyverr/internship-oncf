try {
	const root = document.documentElement;
	const hasServerAppearance = root.dataset.serverAppearance === "true";
	const stored = hasServerAppearance
		? {
				theme: root.dataset.theme,
				fontFamily: root.dataset.fontFamily,
				textSize: root.dataset.textSize,
				motion: root.dataset.motion,
				workspaceLayout: root.dataset.workspaceLayout,
			}
		: JSON.parse(localStorage.getItem("ecommand-appearance") || "null");
	const legacyTheme = localStorage.getItem("ecommand-theme");
	const themes = ["light", "dark", "mono-light", "mono-dark", "system"];
	const fonts = ["inter", "geist", "system", "arial", "serif", "monospace"];
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

	root.classList.toggle("dark", dark);
	root.dataset.theme = theme;
	root.dataset.fontFamily = fontFamily;
	root.dataset.textSize = textSize;
	root.dataset.motion = motion;
	root.dataset.workspaceLayout = workspaceLayout;
} catch {}
