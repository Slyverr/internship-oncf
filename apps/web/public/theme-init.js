try {
	const theme = localStorage.getItem("ecommand-theme") || "system";
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const dark = theme === "dark" || (theme === "system" && prefersDark);

	document.documentElement.classList.toggle("dark", dark);
	document.documentElement.dataset.theme = theme;
} catch {}
