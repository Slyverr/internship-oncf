"use client";

import { ManagedReferenceResource } from "@ecommand/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { TableActionButton } from "@/components/common/table-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MessageKey } from "@/i18n";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { activeReferenceDataControllerFindAll } from "@/lib/api/active-reference-data";
import type {
	CreateManagedReferenceDataDto,
	ManagedReferenceDataDto,
	UpdateManagedReferenceDataDto,
} from "@/lib/api/generated.schemas";
import {
	managedReferenceDataControllerCreate,
	managedReferenceDataControllerFindAll,
	managedReferenceDataControllerUpdate,
} from "@/lib/api/managed-reference-data";
import { getFormErrorMessage } from "@/lib/form-utils";

type Resource = ManagedReferenceResource;
type ManagedReferenceRow = ManagedReferenceDataDto;
type Draft = Omit<ManagedReferenceRow, "id" | "stationName" | "portName">;
type FieldKey =
	| "stationCode"
	| "city"
	| "address"
	| "phone"
	| "email"
	| "type"
	| "stationId"
	| "portId";
type FieldSpec = {
	key: FieldKey;
	label: MessageKey;
	kind?: "port-type" | "stations" | "ports";
	inputType?: "text" | "email";
	required?: boolean;
};

const fieldsByResource: Partial<Record<Resource, FieldSpec[]>> = {
	stations: [
		{
			key: "stationCode",
			label: Messages.common.fields.stationCode,
			required: true,
		},
		{ key: "city", label: Messages.referenceData.city },
		{ key: "address", label: Messages.referenceData.address },
	],
	agencies: [
		{ key: "city", label: Messages.referenceData.city },
		{ key: "address", label: Messages.referenceData.address },
		{ key: "phone", label: Messages.referenceData.phone },
		{
			key: "email",
			label: Messages.referenceData.email,
			inputType: "email",
		},
	],
	ports: [
		{
			key: "type",
			label: Messages.referenceData.portType,
			kind: "port-type",
			required: true,
		},
		{ key: "city", label: Messages.referenceData.city },
		{
			key: "stationId",
			label: Messages.common.fields.stationId,
			kind: "stations",
		},
	],
	berths: [
		{
			key: "portId",
			label: Messages.common.fields.portId,
			kind: "ports",
			required: true,
		},
	],
	sidings: [{ key: "city", label: Messages.referenceData.city }],
};

const emptyDraft: Draft = { name: "", isActive: true };

function ActiveOptions({
	kind,
	value,
	onChange,
	error,
	label,
	required,
}: {
	kind: "port-type" | "stations" | "ports";
	value: string;
	onChange: (value: string) => void;
	error?: string;
	label: string;
	required: boolean;
}) {
	const t = useTranslate();
	const options = useQuery({
		queryKey: ["active-reference-data", kind],
		enabled: kind !== "port-type",
		queryFn: () => {
			if (kind === "port-type") return Promise.resolve([]);
			return activeReferenceDataControllerFindAll(kind);
		},
	});
	const values =
		kind === "port-type"
			? [
					{ value: "normal", label: t(Messages.referenceData.normalPort) },
					{ value: "dry", label: t(Messages.referenceData.dryPort) },
				]
			: (options.data ?? []).map(({ id, name }) => ({
					value: String(id),
					label: name,
				}));
	return (
		<div className="oncf-field">
			<Label>
				{label}
				{required ? " *" : ""}
			</Label>
			<Select value={value} onValueChange={(next) => next && onChange(next)}>
				<SelectTrigger className="w-full" aria-label={label}>
					<SelectValue placeholder={label} />
				</SelectTrigger>
				<SelectContent>
					{values.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{options.isError && kind !== "port-type" && (
				<Button
					type="button"
					variant="outline"
					onClick={() => void options.refetch()}
				>
					{t(Messages.common.actions.retry)}
				</Button>
			)}
		</div>
	);
}

function ManagedReferenceDialog({
	resource,
	open,
	onOpenChange,
	initialValue,
	isEditing,
	onSave,
}: {
	resource: Resource;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValue: Draft;
	isEditing: boolean;
	onSave: (draft: Draft) => Promise<void>;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const [draft, setDraft] = useState<Draft>(initialValue);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const resourceLabel = t(Messages.referenceData.sections[resource]);
	const fields = fieldsByResource[resource] ?? [];
	const hasMissingRequiredField = fields.some(
		(field) => field.required && !draft[field.key],
	);

	useEffect(() => {
		if (open) {
			setDraft({ ...initialValue });
			setError("");
		}
	}, [open, initialValue]);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (saving) return;
		setSaving(true);
		setError("");
		try {
			await onSave(draft);
			onOpenChange(false);
		} catch (cause) {
			setError(getFormErrorMessage(cause, locale) ?? "");
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="form" className="gap-0 overflow-hidden p-0">
				<DialogHeader className="mx-6 mt-6 pb-4">
					<DialogTitle className="text-base">
						{t(
							isEditing
								? Messages.referenceData.editTitle
								: Messages.referenceData.addTitle,
							{ resource: resourceLabel },
						)}
					</DialogTitle>
					<DialogDescription>
						{t(Messages.referenceData.dialogDescription, {
							resource: resourceLabel,
						})}
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="p-6">
					<form
						id="managed-reference-form"
						className="grid gap-4 sm:grid-cols-2"
						onSubmit={submit}
					>
						<div className="oncf-field sm:col-span-2">
							<Label htmlFor="managed-reference-name">
								{t(Messages.referenceData.name)} *
							</Label>
							<Input
								id="managed-reference-name"
								value={draft.name}
								placeholder={t(Messages.referenceData.namePlaceholder)}
								required
								maxLength={200}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										name: event.target.value,
									}))
								}
							/>
						</div>
						{fields.map((field) => {
							const value = draft[field.key];
							const label = t(field.label);
							if (field.kind) {
								return (
									<ActiveOptions
										key={field.key}
										kind={field.kind}
										label={label}
										required={Boolean(field.required)}
										value={value == null ? "" : String(value)}
										onChange={(next) =>
											setDraft((current) => ({
												...current,
												[field.key]:
													field.key === "stationId" || field.key === "portId"
														? Number(next)
														: next,
											}))
										}
									/>
								);
							}
							return (
								<div key={field.key} className="oncf-field">
									<Label htmlFor={`managed-reference-${field.key}`}>
										{label}
										{field.required ? " *" : ""}
									</Label>
									<Input
										id={`managed-reference-${field.key}`}
										value={value == null ? "" : String(value)}
										placeholder={label}
										type={field.inputType ?? "text"}
										maxLength={
											field.key === "address"
												? 500
												: field.key === "city"
													? 100
													: field.key === "phone"
														? 20
														: field.key === "email"
															? 100
															: 50
										}
										required={Boolean(field.required)}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												[field.key]: event.target.value,
											}))
										}
									/>
								</div>
							);
						})}
						{isEditing && (
							<div className="flex min-h-11 items-center gap-3 rounded-md border px-3 sm:col-span-2">
								<Checkbox
									id="managed-reference-active"
									checked={draft.isActive}
									onCheckedChange={(checked) =>
										setDraft((current) => ({
											...current,
											isActive: checked === true,
										}))
									}
								/>
								<Label
									htmlFor="managed-reference-active"
									className="cursor-pointer"
								>
									{t(Messages.referenceData.active)}
								</Label>
							</div>
						)}
						{error && (
							<p
								className="text-sm text-destructive sm:col-span-2"
								role="alert"
							>
								{error}
							</p>
						)}
					</form>
				</DialogBody>
				<DialogFooter className="mx-6 mb-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={saving}
					>
						{t(Messages.common.actions.cancel)}
					</Button>
					<Button
						form="managed-reference-form"
						type="submit"
						disabled={saving || !draft.name.trim() || hasMissingRequiredField}
					>
						{t(
							isEditing
								? Messages.common.actions.save
								: Messages.referenceData.add,
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ManagedReferenceDataSection({
	resource,
	title,
}: {
	resource: Resource;
	title: string;
}) {
	const t = useTranslate();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<ManagedReferenceRow | null>(null);
	const queryKey = ["managed-reference-data", resource];
	const rows = useQuery({
		queryKey,
		queryFn: () => managedReferenceDataControllerFindAll(resource),
	});

	function openCreate() {
		setEditing(null);
		setDialogOpen(true);
	}
	function openEdit(row: ManagedReferenceRow) {
		setEditing(row);
		setDialogOpen(true);
	}

	async function save(draft: Draft) {
		const createData: CreateManagedReferenceDataDto = {
			name: draft.name.trim(),
			stationCode: draft.stationCode?.trim() || null,
			address: draft.address?.trim() || null,
			city: draft.city?.trim() || null,
			phone: draft.phone?.trim() || null,
			email: draft.email?.trim() || null,
			type: draft.type,
			stationId: draft.stationId,
			portId: draft.portId,
		};
		if (editing) {
			const updateData: UpdateManagedReferenceDataDto = {
				...createData,
				isActive: draft.isActive,
			};
			await managedReferenceDataControllerUpdate(
				resource,
				editing.id,
				updateData,
			);
		} else {
			await managedReferenceDataControllerCreate(
				resource,
				createData satisfies CreateManagedReferenceDataDto,
			);
		}
		await queryClient.invalidateQueries({ queryKey });
		await queryClient.invalidateQueries({
			queryKey: ["active-reference-data"],
		});
	}

	return (
		<section className="min-w-0">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-base font-semibold">{title}</h2>
				<Button type="button" onClick={openCreate}>
					{t(Messages.referenceData.add)}
				</Button>
			</div>
			{rows.isLoading ? (
				<div className="rounded-lg border p-4 text-sm text-muted-foreground">
					{t(Messages.common.loadingResource, { resource: title })}
				</div>
			) : rows.isError ? (
				<div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
					<p className="text-sm text-destructive">
						{t(Messages.referenceData.loadFailed)}
					</p>
					<Button
						type="button"
						variant="outline"
						onClick={() => void rows.refetch()}
					>
						{t(Messages.common.actions.retry)}
					</Button>
				</div>
			) : (
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t(Messages.referenceData.name)}</TableHead>
								<TableHead>{t(Messages.common.fields.status)}</TableHead>
								<TableHead className="text-right">
									{t(Messages.referenceData.actions)}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.data?.length ? (
								rows.data.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="max-w-0">
											<button
												type="button"
												className="block min-h-11 w-full truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
												onClick={() => openEdit(row)}
											>
												{row.name}
											</button>
											<p className="truncate text-xs text-muted-foreground">
												{row.stationCode ??
													row.city ??
													row.portName ??
													row.stationName ??
													""}
											</p>
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{t(
													row.isActive
														? Messages.referenceData.active
														: Messages.referenceData.archived,
												)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<TableActionButton
												icon={PencilIcon}
												label={t(Messages.referenceData.edit)}
												onClick={() => openEdit(row)}
											/>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={3}
										className="h-24 whitespace-normal text-left text-muted-foreground md:text-center"
									>
										{t(Messages.referenceData.empty)}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}
			<ManagedReferenceDialog
				resource={resource}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				initialValue={editing ? { ...editing } : emptyDraft}
				isEditing={Boolean(editing)}
				onSave={save}
			/>
		</section>
	);
}
