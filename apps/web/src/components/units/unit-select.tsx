"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCatalogControllerFindUnits } from "@/lib/api/catalog";
import { UnitDto } from "@/lib/api/generated.schemas";

export type Unit = Pick<UnitDto, "id" | "name">;

interface UnitSelectProps {
	units?: Unit[];
	disabled?: boolean;
	id: string;
	placeholder?: string;

	value?: Unit["id"];
	onChange: (value: Unit["id"]) => void;
}

export function UnitSelect({
	units: providedUnits,
	disabled,
	id,
	value,
	onChange,
	placeholder,
}: UnitSelectProps) {
	const t = useTranslate();
	const resolvedPlaceholder =
		placeholder ?? t(Messages.units.select.placeholder);
	const {
		data: fetchedUnits,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCatalogControllerFindUnits({
		query: {
			enabled: !providedUnits,
		},
	});

	const units = providedUnits ?? fetchedUnits ?? [];
	const selected = units.find((unit) => unit.id === value);

	return (
		<div className="oncf-field">
			<Combobox
				items={units}
				disabled={
					disabled || (!providedUnits && (isLoading || units.length === 0))
				}
				value={selected ?? null}
				onValueChange={(unit) => unit && onChange(unit.id)}
				itemToStringLabel={(unit) => unit.name}
				itemToStringValue={(unit) => unit.id}
			>
				<ComboboxInput
					id={id}
					placeholder={
						isLoading && !providedUnits
							? t(Messages.units.select.loading)
							: isError && !providedUnits
								? t(Messages.units.select.unavailable)
								: resolvedPlaceholder
					}
				/>

				<ComboboxContent>
					<ComboboxEmpty>{t(Messages.units.select.empty)}</ComboboxEmpty>

					<ComboboxList>
						{(unit) => (
							<ComboboxItem key={unit.id} value={unit}>
								{unit.name}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{isError && !providedUnits && (
				<InlineQueryRetry
					message={t(Messages.units.select.loadFailed)}
					retryLabel={t(Messages.units.select.retry)}
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && units.length === 0 && !providedUnits && (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.units.select.noneAvailable)}
				</p>
			)}
		</div>
	);
}
