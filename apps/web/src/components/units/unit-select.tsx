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
import { useCatalogControllerFindUnits } from "@/lib/api/catalog";
import { UnitDto } from "@/lib/api/generated.schemas";

export type Unit = Pick<UnitDto, "id" | "name">;

interface UnitSelectProps {
	units?: Unit[];
	disabled?: boolean;
	placeholder?: string;

	value?: Unit["id"];
	onChange: (value: Unit["id"]) => void;
}

export function UnitSelect({
	units: providedUnits,
	disabled,
	value,
	onChange,
	placeholder = "Select unit",
}: UnitSelectProps) {
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
		<div className="space-y-2">
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
					placeholder={
						isLoading && !providedUnits
							? "Loading units…"
							: isError && !providedUnits
								? "Units unavailable"
								: placeholder
					}
					aria-label="Select unit"
				/>

				<ComboboxContent>
					<ComboboxEmpty>No units found.</ComboboxEmpty>

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
					message="Could not load units. Check your connection."
					retryLabel="Retry units"
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && units.length === 0 && !providedUnits && (
				<p role="status" className="text-sm text-muted-foreground">
					No units are available.
				</p>
			)}
		</div>
	);
}
