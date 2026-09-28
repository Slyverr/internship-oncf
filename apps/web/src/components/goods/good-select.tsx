"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCatalogControllerFindGoods } from "@/lib/api/catalog";

interface GoodSelectProps {
	id: string;
	value?: number;
	onChange: (value: number) => void;
}

export function GoodSelect({ id, value, onChange }: GoodSelectProps) {
	const {
		data: catalogGoods,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCatalogControllerFindGoods();

	const goods = (catalogGoods ?? []).filter(
		(good) => good.isActive || good.id === value,
	);
	const selectedGood = goods.find((good) => good.id === value);

	return (
		<div className="oncf-field">
			<Select
				value={selectedGood?.id.toString() ?? null}
				onValueChange={(selectedId) => onChange(Number(selectedId))}
				disabled={isLoading || goods.length === 0}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue>
						{selectedGood?.name ??
							(isLoading ? "Loading goods..." : "Select good")}
					</SelectValue>
				</SelectTrigger>

				<SelectContent>
					{goods.map((good) => (
						<SelectItem key={good.id} value={good.id.toString()}>
							{good.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{isError && (
				<InlineQueryRetry
					message="Could not load goods. Check your connection."
					retryLabel="Retry goods"
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && goods.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					No active goods are available.
				</p>
			)}
		</div>
	);
}
