"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCatalogControllerFindGoods } from "@/lib/api/catalog";

interface GoodSelectProps {
	value?: number;
	onChange: (value: number) => void;
}

export function GoodSelect({ value, onChange }: GoodSelectProps) {
	const {
		data: catalogGoods,
		isLoading,
		isError,
	} = useCatalogControllerFindGoods();

	const goods = (catalogGoods ?? []).filter(
		(good) => good.isActive || good.id === value,
	);
	const selectedGood = goods.find((good) => good.id === value);

	return (
		<div className="space-y-2">
			<Select
				value={selectedGood?.id.toString()}
				onValueChange={(selectedId) => onChange(Number(selectedId))}
				disabled={isLoading || isError || goods.length === 0}
			>
				<SelectTrigger className="w-full" aria-label="Goods / Commodity">
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
				<p role="alert" className="text-sm text-destructive">
					Could not load goods. Please try again.
				</p>
			)}
		</div>
	);
}
