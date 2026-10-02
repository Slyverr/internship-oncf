"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useUpdateDetailCache } from "@/hooks/use-update-detail-cache";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import {
	getProgramsControllerFindOneQueryKey,
	useProgramsControllerUpdate,
} from "@/lib/api/programs";
import { toDateInputValue } from "@/lib/date-utils";

const QUANTITY_PATTERN = /^\d+(\.\d{1,3})?$/;

export function ProgramEditForm({ program }: { program: ProgramDetailDto }) {
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const router = useRouter();
	const queryClient = useQueryClient();
	const updateDetailCache = useUpdateDetailCache<ProgramDetailDto, string>(
		getProgramsControllerFindOneQueryKey,
		(updatedProgram) => updatedProgram.programNumber,
	);
	const mutation = useProgramsControllerUpdate();
	const initialPlannedDate = toDateInputValue(program.plannedDate);
	const [plannedDate, setPlannedDate] = useState(initialPlannedDate);
	const [quantityPlanned, setQuantityPlanned] = useState(
		program.quantityPlanned,
	);
	const hasChanges =
		plannedDate !== initialPlannedDate ||
		quantityPlanned.trim() !== program.quantityPlanned;

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending || !hasChanges) return;

		const quantity = quantityPlanned.trim();
		if (
			!plannedDate ||
			!QUANTITY_PATTERN.test(quantity) ||
			Number(quantity) <= 0
		) {
			toast.add({
				type: "error",
				title: t(Messages.programs.editForm.checkDetails),
				description: t(Messages.programs.editForm.validation),
			});
			return;
		}

		try {
			const updated = await mutation.mutateAsync({
				id: program.programNumber,
				data: { plannedDate, quantityPlanned: quantity },
			});
			updateDetailCache(updated);
			void queryClient.invalidateQueries({ queryKey: ["/programs"] });
			toast.add({
				type: "success",
				title: t(Messages.programs.editForm.saved),
				description: t(Messages.programs.editForm.savedDescription),
			});
			router.push(`/dashboard/programs/${program.programNumber}`);
			router.refresh();
		} catch (error) {
			toast.add({
				type: "error",
				title: t(Messages.programs.editForm.saveFailed),
				description: getErrorMessage(error),
			});
		}
	}

	return (
		<form onSubmit={submit} className="workspace-form">
			<PageHeader
				title={t(Messages.programs.editTitle, {
					programCode: program.programNumber,
				})}
				description={t(Messages.programs.editDescription)}
			/>
			<Card>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<div className="oncf-field">
						<Label htmlFor="plannedDate">
							{t(Messages.programs.editForm.plannedDate)}
						</Label>
						<Input
							id="plannedDate"
							type="date"
							value={plannedDate}
							onChange={(event) => setPlannedDate(event.target.value)}
							required
						/>
					</div>
					<div className="oncf-field">
						<Label htmlFor="quantityPlanned">
							{t(Messages.programs.editForm.quantityPlanned)}
						</Label>
						<Input
							id="quantityPlanned"
							inputMode="decimal"
							placeholder={t(Messages.programs.editForm.quantityPlaceholder)}
							value={quantityPlanned}
							onChange={(event) => setQuantityPlanned(event.target.value)}
							required
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					type="button"
					disabled={mutation.isPending}
					onClick={() =>
						router.push(`/dashboard/programs/${program.programNumber}`)
					}
				>
					{t(Messages.programs.editForm.cancel)}
				</Button>
				<Button type="submit" disabled={mutation.isPending || !hasChanges}>
					{t(
						mutation.isPending
							? Messages.programs.editForm.saving
							: Messages.programs.editForm.save,
					)}
				</Button>
			</div>
		</form>
	);
}
