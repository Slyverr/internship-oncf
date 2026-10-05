"use client";

import {
	type AppearancePreferences,
	DEFAULT_APPEARANCE_PREFERENCES,
} from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type {
	AppearancePreferencesDto,
	UpdateAppearancePreferencesDto,
} from "@/lib/api/generated.schemas";
import {
	getProfileControllerGetPreferencesQueryKey,
	useProfileControllerGetPreferences,
	useProfileControllerUpdatePreferences,
} from "@/lib/api/profile";
import { parseAppearancePreferenceSnapshot } from "@/lib/appearance-preference-cookie";
import {
	useAppearance,
	writeAppearancePreferenceCookie,
} from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";

export type AppearanceSyncStatus = "loading" | "saving" | "saved" | "local";

const useClientLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;

const AppearanceSyncContext = createContext<AppearanceSyncStatus>("loading");

function toPreferences(value: AppearancePreferencesDto): AppearancePreferences {
	// The checked-in Orval types predate this field; keep the read adapter tolerant until the API schemas can be regenerated without dropping unrelated DTO fields.
	const withWorkspaceLayout = value as AppearancePreferencesDto & {
		workspaceLayout?: AppearancePreferences["workspaceLayout"];
	};

	return {
		theme: value.theme,
		fontFamily: value.fontFamily,
		textSize: value.textSize,
		motion: value.motion,
		workspaceLayout:
			withWorkspaceLayout.workspaceLayout ??
			DEFAULT_APPEARANCE_PREFERENCES.workspaceLayout,
	};
}

export function AppearancePreferencesSync({
	children,
}: {
	children: ReactNode;
}) {
	const { profile } = useAuth();
	const {
		initialized,
		preferences,
		serverPreferencesAvailable,
		setPreferences,
	} = useAppearance();
	const queryClient = useQueryClient();
	const preferencesQuery = useProfileControllerGetPreferences({
		query: {
			retry: false,
			refetchOnWindowFocus: false,
			...(serverPreferencesAvailable && {
				initialData: {
					...preferences,
					updatedAt: "",
				} as AppearancePreferencesDto,
			}),
		},
	});
	const savePreferences = useProfileControllerUpdatePreferences();
	const [status, setStatus] = useState<AppearanceSyncStatus>("loading");
	const hydrated = useRef(false);
	const initializedCookieSnapshot = useRef(false);
	const lastCookiePreferences = useRef(JSON.stringify(preferences));
	const lastSent = useRef<string | null>(null);
	const saveQueue = useRef<Promise<void>>(Promise.resolve());
	const currentPreferences = useRef(preferences);
	currentPreferences.current = preferences;
	useClientLayoutEffect(() => {
		if (!initialized) return;
		const serialized = JSON.stringify(preferences);
		if (!initializedCookieSnapshot.current) {
			initializedCookieSnapshot.current = true;
			lastCookiePreferences.current = serialized;
			if (!serverPreferencesAvailable) {
				// When SSR could not reach the preference API, cache the local choice
				// for the next request without claiming it is newer than the database.
				writeAppearancePreferenceCookie(preferences, profile.id, null);
			}
			return;
		}
		if (serialized === lastCookiePreferences.current) return;

		lastCookiePreferences.current = serialized;
		writeAppearancePreferenceCookie(preferences, profile.id);
	}, [initialized, preferences, profile.id]);

	const enqueueLatestSave = useCallback(() => {
		saveQueue.current = saveQueue.current.then(async () => {
			const latestPreferences = currentPreferences.current;
			const serialized = JSON.stringify(latestPreferences);
			if (serialized === lastSent.current) {
				// The queued snapshot is already persisted (or matches the canonical
				// server snapshot). Resolve the indicator instead of leaving it in
				// "saving" after a no-op enqueue.
				setStatus("saved");
				return;
			}

			lastSent.current = serialized;
			try {
				const saved = await savePreferences.mutateAsync({
					// The API validates these values from the shared appearance contract;
					// the checked-in generated write DTO still has the older font enum.
					data: latestPreferences as unknown as UpdateAppearancePreferencesDto,
				});
				writeAppearancePreferenceCookie(
					latestPreferences,
					profile.id,
					saved.updatedAt,
				);
				queryClient.setQueryData(
					getProfileControllerGetPreferencesQueryKey(),
					saved,
				);
				if (JSON.stringify(currentPreferences.current) === serialized) {
					setStatus("saved");
				}
			} catch {
				if (JSON.stringify(currentPreferences.current) === serialized) {
					setStatus("local");
				}
			}
		});
	}, [profile.id, queryClient, savePreferences.mutateAsync]);

	useEffect(() => {
		if (!initialized || hydrated.current) return;
		// initialData paints the server snapshot immediately; wait for its first
		// network read before treating that snapshot as canonical. Another device
		// may have changed the account preference since this browser cached it.
		if (!preferencesQuery.isFetched) return;
		if (preferencesQuery.isError) {
			hydrated.current = true;
			lastSent.current = JSON.stringify(preferences);
			setStatus("local");
			return;
		}
		if (!preferencesQuery.isSuccess) return;

		hydrated.current = true;
		if (preferencesQuery.data) {
			const serverPreferences = toPreferences(preferencesQuery.data);
			const appearanceCookie = document.cookie
				.split(";")
				.map((cookie) => cookie.trim())
				.find((cookie) => cookie.startsWith("ecommand-appearance="))
				?.slice("ecommand-appearance=".length);
			const cachedSnapshot = parseAppearancePreferenceSnapshot(
				appearanceCookie,
				profile.id,
			);
			const cachedUpdatedAt = cachedSnapshot?.updatedAt
				? Date.parse(cachedSnapshot.updatedAt)
				: Number.NaN;
			const serverUpdatedAt = Date.parse(preferencesQuery.data.updatedAt);
			if (
				cachedSnapshot &&
				Number.isFinite(cachedUpdatedAt) &&
				Number.isFinite(serverUpdatedAt) &&
				cachedUpdatedAt > serverUpdatedAt
			) {
				lastSent.current = JSON.stringify(serverPreferences);
				setStatus("saving");
				enqueueLatestSave();
				return;
			}

			lastSent.current = JSON.stringify(serverPreferences);
			lastCookiePreferences.current = JSON.stringify(serverPreferences);
			writeAppearancePreferenceCookie(
				serverPreferences,
				profile.id,
				preferencesQuery.data.updatedAt,
			);
			setPreferences(serverPreferences);
			setStatus("saved");
			return;
		}

		setStatus("saving");
		enqueueLatestSave();
	}, [
		initialized,
		preferences,
		preferencesQuery.data,
		preferencesQuery.isError,
		preferencesQuery.isFetched,
		preferencesQuery.isSuccess,
		enqueueLatestSave,
		profile.id,
		setPreferences,
	]);

	useEffect(() => {
		if (!hydrated.current) return;
		const serialized = JSON.stringify(preferences);
		if (serialized === lastSent.current) return;

		setStatus("saving");
		const timeout = window.setTimeout(() => {
			enqueueLatestSave();
		}, 350);

		return () => window.clearTimeout(timeout);
	}, [preferences, enqueueLatestSave]);

	return (
		<AppearanceSyncContext.Provider value={status}>
			{children}
		</AppearanceSyncContext.Provider>
	);
}

export function useAppearanceSyncStatus() {
	return useContext(AppearanceSyncContext);
}
