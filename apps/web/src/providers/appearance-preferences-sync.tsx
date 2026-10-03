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
import {
	useAppearance,
	writeAppearancePreferenceCookie,
} from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";

export type AppearanceSyncStatus = "loading" | "saving" | "saved" | "local";

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
	const lastSent = useRef<string | null>(null);
	const saveQueue = useRef<Promise<void>>(Promise.resolve());
	const currentPreferences = useRef(preferences);
	currentPreferences.current = preferences;
	useEffect(() => {
		if (!initialized) return;
		writeAppearancePreferenceCookie(preferences, profile.id);
	}, [initialized, preferences, profile.id]);

	const enqueueLatestSave = useCallback(() => {
		saveQueue.current = saveQueue.current.then(async () => {
			const latestPreferences = currentPreferences.current;
			const serialized = JSON.stringify(latestPreferences);
			if (serialized === lastSent.current) return;

			lastSent.current = serialized;
			try {
				const saved = await savePreferences.mutateAsync({
					// The API validates these values from the shared appearance contract;
					// the checked-in generated write DTO still has the older font enum.
					data: latestPreferences as unknown as UpdateAppearancePreferencesDto,
				});
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
	}, [queryClient, savePreferences.mutateAsync]);

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
			lastSent.current = JSON.stringify(serverPreferences);
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
