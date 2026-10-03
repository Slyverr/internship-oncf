"use client";

import {
	APPEARANCE_FONT_FAMILIES,
	APPEARANCE_MOTION_PREFERENCES,
	APPEARANCE_TEXT_SIZES,
	APPEARANCE_THEMES,
	APPEARANCE_WORKSPACE_LAYOUTS,
	type AppearanceFontFamily,
	type AppearanceMotionPreference,
	type AppearanceTextSize,
	type AppearanceTheme,
	type AppearanceWorkspaceLayout,
	DEFAULT_APPEARANCE_PREFERENCES,
	type AppearancePreferences as SharedAppearancePreferences,
} from "@ecommand/shared";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { serializeAppearancePreferenceCookie } from "@/lib/appearance-preference-cookie";

export type ThemeMode = AppearanceTheme;
export type FontFamily = AppearanceFontFamily;
export type TextSize = AppearanceTextSize;
export type MotionPreference = AppearanceMotionPreference;
export type WorkspaceLayout = AppearanceWorkspaceLayout;
export type AppearancePreferences = SharedAppearancePreferences;

interface AppearanceContextValue {
	preferences: AppearancePreferences;
	initialized: boolean;
	serverPreferencesAvailable: boolean;
	setPreferences: (preferences: AppearancePreferences) => void;
	setTheme: (theme: ThemeMode) => void;
	setFontFamily: (fontFamily: FontFamily) => void;
	setTextSize: (textSize: TextSize) => void;
	setMotion: (motion: MotionPreference) => void;
	setWorkspaceLayout: (layout: WorkspaceLayout) => void;
	theme: ThemeMode;
}

const STORAGE_KEY = "ecommand-appearance";
const LEGACY_STORAGE_KEY = "ecommand-theme";
const DEFAULT_PREFERENCES = DEFAULT_APPEARANCE_PREFERENCES;
const useAppearanceInitializationEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyAppearance(preferences: AppearancePreferences) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const isDark =
		preferences.theme === "dark" ||
		preferences.theme === "mono-dark" ||
		(preferences.theme === "system" && prefersDark);
	document.documentElement.classList.toggle("dark", isDark);
	document.documentElement.dataset.theme = preferences.theme;
	document.documentElement.dataset.fontFamily = preferences.fontFamily;
	document.documentElement.dataset.textSize = preferences.textSize;
	document.documentElement.dataset.motion = preferences.motion;
	document.documentElement.dataset.workspaceLayout =
		preferences.workspaceLayout;
}

function readPreferences(): AppearancePreferences {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as Partial<AppearancePreferences>;
			return {
				theme: isThemeMode(parsed.theme)
					? parsed.theme
					: DEFAULT_PREFERENCES.theme,
				fontFamily: isFontFamily(parsed.fontFamily)
					? parsed.fontFamily
					: DEFAULT_PREFERENCES.fontFamily,
				textSize: isTextSize(parsed.textSize)
					? parsed.textSize
					: DEFAULT_PREFERENCES.textSize,
				motion: isMotionPreference(parsed.motion)
					? parsed.motion
					: DEFAULT_PREFERENCES.motion,
				workspaceLayout: isWorkspaceLayout(parsed.workspaceLayout)
					? parsed.workspaceLayout
					: DEFAULT_PREFERENCES.workspaceLayout,
			};
		}
		const legacyTheme = window.localStorage.getItem(LEGACY_STORAGE_KEY);
		return isThemeMode(legacyTheme)
			? { ...DEFAULT_PREFERENCES, theme: legacyTheme }
			: DEFAULT_PREFERENCES;
	} catch {
		return DEFAULT_PREFERENCES;
	}
}

function persistPreferencesLocally(preferences: AppearancePreferences) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
	} catch {
		// Appearance remains available for the current page when storage is blocked.
	}
}

function isThemeMode(value: unknown): value is ThemeMode {
	return (
		typeof value === "string" && APPEARANCE_THEMES.includes(value as ThemeMode)
	);
}

function isFontFamily(value: unknown): value is FontFamily {
	return (
		typeof value === "string" &&
		APPEARANCE_FONT_FAMILIES.includes(value as FontFamily)
	);
}

function isTextSize(value: unknown): value is TextSize {
	return (
		typeof value === "string" &&
		APPEARANCE_TEXT_SIZES.includes(value as TextSize)
	);
}

function isMotionPreference(value: unknown): value is MotionPreference {
	return (
		typeof value === "string" &&
		APPEARANCE_MOTION_PREFERENCES.includes(value as MotionPreference)
	);
}

function isWorkspaceLayout(value: unknown): value is WorkspaceLayout {
	return (
		typeof value === "string" &&
		APPEARANCE_WORKSPACE_LAYOUTS.includes(value as WorkspaceLayout)
	);
}

export function AppearanceProvider({
	children,
	initialPreferences,
}: {
	children: ReactNode;
	initialPreferences?: AppearancePreferences | null;
}) {
	const [preferences, setPreferencesState] = useState<AppearancePreferences>(
		initialPreferences ?? DEFAULT_PREFERENCES,
	);
	const [initialized, setInitialized] = useState(Boolean(initialPreferences));

	useAppearanceInitializationEffect(() => {
		const storedPreferences = initialPreferences ?? readPreferences();
		setPreferencesState(storedPreferences);
		applyAppearance(storedPreferences);
		persistPreferencesLocally(storedPreferences);
		setInitialized(true);
	}, [initialPreferences]);

	useEffect(() => {
		if (!initialized) return;

		applyAppearance(preferences);
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemThemeChange = () => {
			if (preferences.theme === "system") applyAppearance(preferences);
		};

		media.addEventListener("change", handleSystemThemeChange);
		return () => media.removeEventListener("change", handleSystemThemeChange);
	}, [initialized, preferences]);

	const setPreferences = useCallback(
		(nextPreferences: AppearancePreferences) => {
			persistPreferencesLocally(nextPreferences);
			applyAppearance(nextPreferences);
			setPreferencesState(nextPreferences);
		},
		[],
	);

	const setTheme = useCallback(
		(theme: ThemeMode) => setPreferences({ ...preferences, theme }),
		[preferences, setPreferences],
	);
	const setFontFamily = useCallback(
		(fontFamily: FontFamily) => setPreferences({ ...preferences, fontFamily }),
		[preferences, setPreferences],
	);
	const setTextSize = useCallback(
		(textSize: TextSize) => setPreferences({ ...preferences, textSize }),
		[preferences, setPreferences],
	);
	const setMotion = useCallback(
		(motion: MotionPreference) => setPreferences({ ...preferences, motion }),
		[preferences, setPreferences],
	);
	const setWorkspaceLayout = useCallback(
		(workspaceLayout: WorkspaceLayout) =>
			setPreferences({ ...preferences, workspaceLayout }),
		[preferences, setPreferences],
	);

	const value = useMemo(
		() => ({
			preferences,
			initialized,
			serverPreferencesAvailable: Boolean(initialPreferences),
			setPreferences,
			theme: preferences.theme,
			setTheme,
			setFontFamily,
			setTextSize,
			setMotion,
			setWorkspaceLayout,
		}),
		[
			preferences,
			initialized,
			initialPreferences,
			setPreferences,
			setTheme,
			setFontFamily,
			setTextSize,
			setMotion,
			setWorkspaceLayout,
		],
	);

	return (
		<AppearanceContext.Provider value={value}>
			{children}
		</AppearanceContext.Provider>
	);
}

export function writeAppearancePreferenceCookie(
	preferences: AppearancePreferences,
	userId: number,
	updatedAt?: string,
) {
	try {
		const secure = window.location.protocol === "https:" ? "; Secure" : "";
		const value = serializeAppearancePreferenceCookie(
			preferences,
			userId,
			updatedAt,
		);
		// The cookie is a non-sensitive, user-scoped render cache read by Next.js.
		// biome-ignore lint/suspicious/noDocumentCookie: server rendering needs this preference snapshot in a request cookie.
		document.cookie = `ecommand-appearance=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
	} catch {
		// Server preferences remain available even when the cache cookie is blocked.
	}
}

export function useAppearance() {
	const context = useContext(AppearanceContext);
	if (!context) {
		throw new Error("useAppearance must be used within AppearanceProvider");
	}
	return context;
}
