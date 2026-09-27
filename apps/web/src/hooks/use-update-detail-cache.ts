import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

type IdentifiedRecord = { id: number };

export function useUpdateDetailCache<TRecord extends IdentifiedRecord>(
	queryKeyForId: (id: number) => QueryKey,
) {
	const queryClient = useQueryClient();
	return useCallback(
		(record: TRecord) => {
			queryClient.setQueryData<TRecord>(queryKeyForId(record.id), record);
		},
		[queryClient, queryKeyForId],
	);
}
