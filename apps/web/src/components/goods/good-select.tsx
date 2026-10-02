"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCatalogControllerFindGoods } from "@/lib/api/catalog";

interface GoodSelectProps {
	id: string;
	value?: number;
	onChange: (value: number) => void;
}

export function GoodSelect({ id, value, onChange }: GoodSelectProps) {
	const t = useTranslate();
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
							(isLoading
								? t(Messages.goods.select.loading)
								: t(Messages.goods.select.placeholder))}
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
					message={t(Messages.goods.select.loadFailed)}
					retryLabel={t(Messages.goods.select.retry)}
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && goods.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.goods.select.noneAvailable)}
				</p>
			)}
		</div>
	);
}
