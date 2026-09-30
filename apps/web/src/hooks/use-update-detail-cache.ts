import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

type IdentifiedRecord = { id: number };

export function useUpdateDetailCache<
	TRecord extends IdentifiedRecord,
	TIdentifier extends number | string = number,
>(
	queryKeyForId: (id: TIdentifier) => QueryKey,
	getIdentifier: (record: TRecord) => TIdentifier = ((record) =>
		record.id as TIdentifier) as (record: TRecord) => TIdentifier,
) {
	const queryClient = useQueryClient();
	return useCallback(
		(record: TRecord) => {
			queryClient.setQueryData<TRecord>(
				queryKeyForId(getIdentifier(record)),
				record,
			);
		},
		[queryClient, queryKeyForId, getIdentifier],
	);
}
