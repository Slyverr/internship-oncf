"use client";

import type { AppearancePreferences } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { AppearancePreferencesDto } from "@/lib/api/generated.schemas";
import {
	getProfileControllerGetPreferencesQueryKey,
	useProfileControllerGetPreferences,
	useProfileControllerUpdatePreferences,
} from "@/lib/api/profile";
import { useAppearance } from "@/providers/appearance-provider";

export type AppearanceSyncStatus = "loading" | "saving" | "saved" | "local";

const AppearanceSyncContext = createContext<AppearanceSyncStatus>("loading");

function toPreferences(value: AppearancePreferencesDto): AppearancePreferences {
	return {
		theme: value.theme,
		fontFamily: value.fontFamily,
		textSize: value.textSize,
		motion: value.motion,
	};
}

export function AppearancePreferencesSync({
	children,
}: {
	children: ReactNode;
}) {
	const { initialized, preferences, setPreferences } = useAppearance();
	const queryClient = useQueryClient();
	const preferencesQuery = useProfileControllerGetPreferences({
		query: { retry: false, refetchOnWindowFocus: false },
	});
	const savePreferences = useProfileControllerUpdatePreferences();
	const [status, setStatus] = useState<AppearanceSyncStatus>("loading");
	const hydrated = useRef(false);
	const lastSent = useRef<string | null>(null);
	const currentPreferences = useRef(preferences);
	currentPreferences.current = preferences;

	useEffect(() => {
		if (!initialized || hydrated.current) return;
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
			lastSent.current = JSON.stringify(serverPreferences);
			setPreferences(serverPreferences);
			setStatus("saved");
			return;
		}

		const localPreferences = preferences;
		const serialized = JSON.stringify(localPreferences);
		lastSent.current = serialized;
		setStatus("saving");
		savePreferences.mutate(
			{ data: localPreferences },
			{
				onSuccess: (saved) => {
					queryClient.setQueryData(
						getProfileControllerGetPreferencesQueryKey(),
						saved,
					);
					if (JSON.stringify(currentPreferences.current) === serialized) {
						lastSent.current = serialized;
						setStatus("saved");
					}
				},
				onError: () => {
					if (JSON.stringify(currentPreferences.current) === serialized) {
						setStatus("local");
					}
				},
			},
		);
	}, [
		initialized,
		preferences,
		preferencesQuery.data,
		preferencesQuery.isError,
		preferencesQuery.isSuccess,
		queryClient,
		savePreferences.mutate,
		setPreferences,
	]);

	useEffect(() => {
		if (!hydrated.current) return;
		const serialized = JSON.stringify(preferences);
		if (serialized === lastSent.current) return;

		lastSent.current = serialized;
		setStatus("saving");
		const timeout = window.setTimeout(() => {
			savePreferences.mutate(
				{ data: preferences },
				{
					onSuccess: (saved) => {
						queryClient.setQueryData(
							getProfileControllerGetPreferencesQueryKey(),
							saved,
						);
						if (JSON.stringify(currentPreferences.current) === serialized) {
							setStatus("saved");
						}
					},
					onError: () => {
						if (JSON.stringify(currentPreferences.current) === serialized) {
							setStatus("local");
						}
					},
				},
			);
		}, 350);

		return () => window.clearTimeout(timeout);
	}, [preferences, queryClient, savePreferences.mutate]);

	return (
		<AppearanceSyncContext.Provider value={status}>
			{children}
		</AppearanceSyncContext.Provider>
	);
}

export function useAppearanceSyncStatus() {
	return useContext(AppearanceSyncContext);
}
