"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface AppearanceContextValue {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = "ecommand-theme";
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	document.documentElement.classList.toggle(
		"dark",
		theme === "dark" || (theme === "system" && prefersDark),
	);
	document.documentElement.dataset.theme = theme;
}

function isThemeMode(value: string | null): value is ThemeMode {
	return value === "light" || value === "dark" || value === "system";
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeMode>("system");
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const storedTheme = window.localStorage.getItem(STORAGE_KEY);
		setThemeState(isThemeMode(storedTheme) ? storedTheme : "system");
		setInitialized(true);
	}, []);

	useEffect(() => {
		if (!initialized) return;

		applyTheme(theme);
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemThemeChange = () => {
			if (theme === "system") applyTheme(theme);
		};

		media.addEventListener("change", handleSystemThemeChange);
		return () => media.removeEventListener("change", handleSystemThemeChange);
	}, [initialized, theme]);

	const setTheme = useCallback((nextTheme: ThemeMode) => {
		window.localStorage.setItem(STORAGE_KEY, nextTheme);
		applyTheme(nextTheme);
		setThemeState(nextTheme);
	}, []);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return (
		<AppearanceContext.Provider value={value}>
			{children}
		</AppearanceContext.Provider>
	);
}

export function useAppearance() {
	const context = useContext(AppearanceContext);
	if (!context) {
		throw new Error("useAppearance must be used within AppearanceProvider");
	}
	return context;
}
