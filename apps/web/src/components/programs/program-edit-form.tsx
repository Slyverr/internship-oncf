"use client";

import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import {
	getProgramsControllerFindOneQueryKey,
	useProgramsControllerUpdate,
} from "@/lib/api/programs";

const QUANTITY_PATTERN = /^\d+(\.\d{1,3})?$/;

function getErrorMessage(error: unknown) {
	if (isAxiosError(error)) {
		const message: unknown = error.response?.data?.message;
		if (typeof message === "string") return message;
		if (Array.isArray(message)) return message.join(". ");
	}
	return "Please check the values and try again.";
}

export function ProgramEditForm({ program }: { program: ProgramDetailDto }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const mutation = useProgramsControllerUpdate();
	const initialPlannedDate = program.plannedDate.slice(0, 10);
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
				title: "Check the program details",
				description:
					"Choose a planned date and enter a positive quantity with at most three decimal places.",
			});
			return;
		}

		try {
			const updated = await mutation.mutateAsync({
				id: program.id,
				data: { plannedDate, quantityPlanned: quantity },
			});
			queryClient.setQueryData(
				getProgramsControllerFindOneQueryKey(program.id),
				updated,
			);
			void queryClient.invalidateQueries({ queryKey: ["/programs"] });
			toast.add({
				type: "success",
				title: "Program saved",
				description: "The planned date and quantity have been updated.",
			});
			router.push(`/dashboard/programs/${program.id}`);
			router.refresh();
		} catch (error) {
			toast.add({
				type: "error",
				title: "Could not save program",
				description: getErrorMessage(error),
			});
		}
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit {program.programNumber}</CardTitle>
					<CardDescription>
						Update the planned date and quantity. Workflow status is managed
						with the program actions.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="plannedDate">Planned date</Label>
						<Input
							id="plannedDate"
							type="date"
							value={plannedDate}
							onChange={(event) => setPlannedDate(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="quantityPlanned">Planned quantity</Label>
						<Input
							id="quantityPlanned"
							inputMode="decimal"
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
					onClick={() => router.push(`/dashboard/programs/${program.id}`)}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={mutation.isPending || !hasChanges}>
					{mutation.isPending ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
