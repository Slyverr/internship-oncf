"use client";

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
	const { data: fetchedUnits, isLoading } = useCatalogControllerFindUnits({
		query: {
			enabled: !providedUnits,
		},
	});

	const units = providedUnits ?? fetchedUnits ?? [];
	const selected = units.find((unit) => unit.id === value);

	return (
		<Combobox
			items={units}
			disabled={disabled || (isLoading && !providedUnits)}
			value={selected ?? null}
			onValueChange={(unit) => unit && onChange(unit.id)}
			itemToStringLabel={(unit) => unit.name}
			itemToStringValue={(unit) => unit.id}
		>
			<ComboboxInput
				placeholder={
					isLoading && !providedUnits ? "Loading units..." : placeholder
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
	);
}
