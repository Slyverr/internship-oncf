"use client";

import { Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	CircleHelpIcon,
	PackageIcon,
	PencilIcon,
	PlusIcon,
	RulerIcon,
	TagIcon,
	WrenchIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
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
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	getCatalogControllerFindAccessoryOperationsQueryKey,
	getCatalogControllerFindGoodsQueryKey,
	getCatalogControllerFindGoodsTypesQueryKey,
	getCatalogControllerFindManageAccessoryOperationsQueryKey,
	getCatalogControllerFindManageGoodsQueryKey,
	getCatalogControllerFindManageGoodsTypesQueryKey,
	getCatalogControllerFindManageRejectionReasonsQueryKey,
	getCatalogControllerFindManageUnitsQueryKey,
	getCatalogControllerFindRejectionReasonsQueryKey,
	getCatalogControllerFindUnitsQueryKey,
	useCatalogControllerCreateAccessoryOperation,
	useCatalogControllerCreateGood,
	useCatalogControllerCreateGoodsType,
	useCatalogControllerCreateRejectionReason,
	useCatalogControllerCreateUnit,
	useCatalogControllerFindManageAccessoryOperations,
	useCatalogControllerFindManageGoods,
	useCatalogControllerFindManageGoodsTypes,
	useCatalogControllerFindManageRejectionReasons,
	useCatalogControllerFindManageUnits,
	useCatalogControllerUpdateAccessoryOperation,
	useCatalogControllerUpdateGood,
	useCatalogControllerUpdateGoodsType,
	useCatalogControllerUpdateRejectionReason,
	useCatalogControllerUpdateUnit,
} from "@/lib/api/catalog";
import { getFormErrorMessage } from "@/lib/form-utils";
import { useAuth } from "@/providers/auth-provider";

type CatalogItem = { id: string; name: string; isActive: boolean };
type GoodsTypeOption = CatalogItem;
type GoodItem = {
	id: number;
	name: string;
	goodsCode: string;
	goodsTypeId: string;
	isActive: boolean;
};
type CatalogDraft = {
	name: string;
	isActive: boolean;
	goodsCode: string;
	goodsTypeId: string;
};

const emptyDraft: CatalogDraft = {
	name: "",
	isActive: true,
	goodsCode: "",
	goodsTypeId: "",
};

const categoryOptions = [
	{
		value: "units",
		message: Messages.referenceData.sections.units,
		icon: RulerIcon,
	},
	{
		value: "goodsTypes",
		message: Messages.referenceData.sections.goodsTypes,
		icon: TagIcon,
	},
	{
		value: "goods",
		message: Messages.referenceData.sections.goods,
		icon: PackageIcon,
	},
	{
		value: "accessoryOperations",
		message: Messages.referenceData.sections.accessoryOperations,
		icon: WrenchIcon,
	},
	{
		value: "rejectionReasons",
		message: Messages.referenceData.sections.rejectionReasons,
		icon: CircleHelpIcon,
	},
] as const;

function getErrorMessage(cause: unknown, locale: ReturnType<typeof useLocale>) {
	return getFormErrorMessage(cause, locale) ?? "";
}

function CatalogEntryDialog({
	open,
	onOpenChange,
	title,
	description,
	initialValue,
	goodsTypes = [],
	showGoodsFields = false,
	allowInactiveGoodsType = false,
	isEditing = false,
	error,
	saving,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	initialValue: CatalogDraft;
	goodsTypes?: GoodsTypeOption[];
	showGoodsFields?: boolean;
	allowInactiveGoodsType?: boolean;
	isEditing?: boolean;
	error: string;
	saving: boolean;
	onSubmit: (draft: CatalogDraft) => Promise<void>;
}) {
	const t = useTranslate();
	const [draft, setDraft] = useState(initialValue);
	const initialName = initialValue.name;
	const initialIsActive = initialValue.isActive;
	const initialGoodsCode = initialValue.goodsCode;
	const initialGoodsTypeId = initialValue.goodsTypeId;
	const formId = "reference-data-entry-form";

	useEffect(() => {
		if (open)
			setDraft({
				name: initialName,
				isActive: initialIsActive,
				goodsCode: initialGoodsCode,
				goodsTypeId: initialGoodsTypeId,
			});
	}, [
		open,
		initialName,
		initialIsActive,
		initialGoodsCode,
		initialGoodsTypeId,
	]);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (
			!draft.name.trim() ||
			(showGoodsFields && (!draft.goodsCode.trim() || !draft.goodsTypeId))
		)
			return;
		await onSubmit({
			...draft,
			name: draft.name.trim(),
			goodsCode: draft.goodsCode.trim(),
		});
	}

	const availableGoodsTypes = goodsTypes.filter(
		(type) =>
			type.isActive ||
			(allowInactiveGoodsType && type.id === initialValue.goodsTypeId),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="form" className="gap-0 overflow-hidden p-0">
				<DialogHeader className="mx-6 mt-6 pb-4">
					<DialogTitle className="text-base">{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogBody className="p-6">
					<form id={formId} className="grid gap-4" onSubmit={submit}>
						<div className="oncf-field">
							<Label htmlFor="reference-entry-name">
								{t(Messages.referenceData.name)}
							</Label>
							<Input
								id="reference-entry-name"
								placeholder={t(Messages.referenceData.namePlaceholder)}
								value={draft.name}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										name: event.target.value,
									}))
								}
								maxLength={100}
								autoFocus
								required
							/>
						</div>
						{showGoodsFields && (
							<>
								<div className="oncf-field">
									<Label htmlFor="reference-entry-code">
										{t(Messages.referenceData.goodsCode)}
									</Label>
									<Input
										id="reference-entry-code"
										placeholder={t(Messages.referenceData.goodsCodePlaceholder)}
										value={draft.goodsCode}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												goodsCode: event.target.value,
											}))
										}
										maxLength={50}
										required
									/>
								</div>
								<div className="oncf-field">
									<Label htmlFor="reference-entry-type">
										{t(Messages.referenceData.goodsType)}
									</Label>
									<Select
										value={draft.goodsTypeId}
										onValueChange={(value) =>
											value &&
											setDraft((current) => ({
												...current,
												goodsTypeId: value,
											}))
										}
									>
										<SelectTrigger id="reference-entry-type" className="w-full">
											<SelectValue
												placeholder={t(Messages.referenceData.goodsType)}
											/>
										</SelectTrigger>
										<SelectContent>
											{availableGoodsTypes.map((type) => (
												<SelectItem key={type.id} value={type.id}>
													{type.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</>
						)}
						<div className="flex min-h-11 items-center gap-3 rounded-md border px-3">
							<Checkbox
								id="reference-entry-active"
								checked={draft.isActive}
								onCheckedChange={(checked) =>
									setDraft((current) => ({
										...current,
										isActive: checked === true,
									}))
								}
							/>
							<Label
								htmlFor="reference-entry-active"
								className="cursor-pointer"
							>
								{t(Messages.referenceData.active)}
							</Label>
						</div>
						{error && (
							<p className="text-sm text-destructive" role="alert">
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
						form={formId}
						type="submit"
						disabled={
							saving ||
							!draft.name.trim() ||
							(showGoodsFields &&
								(!draft.goodsCode.trim() || !draft.goodsTypeId))
						}
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

function CatalogTable({
	items,
	isLoading,
	isError,
	refetch,
	onEdit,
}: {
	items: CatalogItem[];
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
	onEdit: (item: CatalogItem) => void;
}) {
	const t = useTranslate();
	if (isLoading) {
		return (
			<div className="rounded-lg border p-4 text-sm text-muted-foreground">
				{t(Messages.common.loadingResource, {
					resource: t(Messages.referenceData.pageTitle),
				})}
			</div>
		);
	}
	if (isError) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
				<p className="text-sm text-destructive">
					{t(Messages.referenceData.loadFailed)}
				</p>
				<Button type="button" variant="outline" onClick={refetch}>
					{t(Messages.common.actions.retry)}
				</Button>
			</div>
		);
	}
	return (
		<div className="overflow-hidden rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t(Messages.referenceData.name)}</TableHead>
						<TableHead className="w-36">
							{t(Messages.common.fields.status)}
						</TableHead>
						<TableHead className="w-32 text-right">
							{t(Messages.referenceData.actions)}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length ? (
						items.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="max-w-0">
									<button
										type="button"
										className="block min-h-11 w-full truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										onClick={() => onEdit(item)}
									>
										{item.name}
									</button>
								</TableCell>
								<TableCell>
									<Badge variant="outline">
										{t(
											item.isActive
												? Messages.referenceData.active
												: Messages.referenceData.archived,
										)}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<TableActionButton
										icon={PencilIcon}
										label={t(Messages.referenceData.edit)}
										onClick={() => onEdit(item)}
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
	);
}

function SimpleCatalogSection({
	title,
	items,
	isLoading,
	isError,
	refetch,
	create,
	update,
}: {
	title: string;
	items: CatalogItem[];
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
	create: (name: string) => Promise<unknown>;
	update: (
		item: CatalogItem,
		name: string,
		isActive: boolean,
	) => Promise<unknown>;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<CatalogItem | null>(null);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	function startCreate() {
		setEditing(null);
		setError("");
		setOpen(true);
	}

	function startEdit(item: CatalogItem) {
		setEditing(item);
		setError("");
		setOpen(true);
	}

	async function submit(draft: CatalogDraft) {
		if (saving) return;
		setSaving(true);
		setError("");
		try {
			if (editing) await update(editing, draft.name, draft.isActive);
			else await create(draft.name);
			setOpen(false);
		} catch (cause) {
			setError(getErrorMessage(cause, locale));
		} finally {
			setSaving(false);
		}
	}

	return (
		<section className="min-w-0">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-base font-semibold">{title}</h2>
				<Button type="button" onClick={startCreate}>
					<PlusIcon aria-hidden="true" />
					{t(Messages.referenceData.add)}
				</Button>
			</div>
			<CatalogTable
				items={items}
				isLoading={isLoading}
				isError={isError}
				refetch={refetch}
				onEdit={startEdit}
			/>
			<CatalogEntryDialog
				open={open}
				onOpenChange={setOpen}
				title={t(
					editing
						? Messages.referenceData.editTitle
						: Messages.referenceData.addTitle,
					{ resource: title },
				)}
				description={t(Messages.referenceData.dialogDescription, {
					resource: title,
				})}
				initialValue={
					editing
						? { ...emptyDraft, name: editing.name, isActive: editing.isActive }
						: emptyDraft
				}
				isEditing={Boolean(editing)}
				error={error}
				saving={saving}
				onSubmit={submit}
			/>
		</section>
	);
}

export function ReferenceDataPage() {
	const t = useTranslate();
	const locale = useLocale();
	const { hasPermission } = useAuth();
	const canManage = hasPermission(Permission.CATALOG_MANAGE);
	const queryClient = useQueryClient();
	const units = useCatalogControllerFindManageUnits({
		query: { enabled: canManage },
	});
	const goodsTypes = useCatalogControllerFindManageGoodsTypes({
		query: { enabled: canManage },
	});
	const goods = useCatalogControllerFindManageGoods({
		query: { enabled: canManage },
	});
	const accessoryOperations = useCatalogControllerFindManageAccessoryOperations(
		{ query: { enabled: canManage } },
	);
	const rejectionReasons = useCatalogControllerFindManageRejectionReasons({
		query: { enabled: canManage },
	});
	const createUnit = useCatalogControllerCreateUnit();
	const createGoodsType = useCatalogControllerCreateGoodsType();
	const createGood = useCatalogControllerCreateGood();
	const createAccessoryOperation =
		useCatalogControllerCreateAccessoryOperation();
	const createRejectionReason = useCatalogControllerCreateRejectionReason();
	const updateUnit = useCatalogControllerUpdateUnit();
	const updateGoodsType = useCatalogControllerUpdateGoodsType();
	const updateGood = useCatalogControllerUpdateGood();
	const updateAccessoryOperation =
		useCatalogControllerUpdateAccessoryOperation();
	const updateRejectionReason = useCatalogControllerUpdateRejectionReason();
	const [category, setCategory] = useState("units");
	const [goodsDialogOpen, setGoodsDialogOpen] = useState(false);
	const [editingGood, setEditingGood] = useState<GoodItem | null>(null);
	const [goodsError, setGoodsError] = useState("");
	const [goodsSaving, setGoodsSaving] = useState(false);

	if (!canManage) {
		return (
			<p className="text-sm text-muted-foreground">
				{t(Messages.referenceData.noAccess)}
			</p>
		);
	}

	function startGoodCreate() {
		setEditingGood(null);
		setGoodsError("");
		setGoodsDialogOpen(true);
	}

	function startGoodEdit(item: GoodItem) {
		setEditingGood(item);
		setGoodsError("");
		setGoodsDialogOpen(true);
	}

	async function submitGood(draft: CatalogDraft) {
		if (goodsSaving) return;
		setGoodsSaving(true);
		setGoodsError("");
		try {
			if (editingGood) {
				await updateGood.mutateAsync({
					id: editingGood.id,
					data: {
						name: draft.name,
						goodsCode: draft.goodsCode,
						goodsTypeId: draft.goodsTypeId,
						isActive: draft.isActive,
					},
				});
			} else {
				await createGood.mutateAsync({
					data: {
						name: draft.name,
						goodsCode: draft.goodsCode,
						goodsTypeId: draft.goodsTypeId,
					},
				});
			}
			setGoodsDialogOpen(false);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: getCatalogControllerFindManageGoodsQueryKey(),
				}),
				queryClient.invalidateQueries({
					queryKey: getCatalogControllerFindGoodsQueryKey(),
				}),
			]);
		} catch (cause) {
			setGoodsError(getErrorMessage(cause, locale));
		} finally {
			setGoodsSaving(false);
		}
	}

	const goodsTypeOptions = (goodsTypes.data ?? []).map(
		({ id, name, isActive }) => ({ id, name, isActive }),
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title={t(Messages.referenceData.pageTitle)}
				description={t(Messages.referenceData.description)}
			/>
			<nav
				aria-label={t(Messages.referenceData.chooseCategory)}
				className="flex min-w-0 flex-wrap gap-2 border-b pb-2"
			>
				{categoryOptions.map(({ value, message, icon: Icon }) => (
					<Button
						key={value}
						type="button"
						variant={category === value ? "secondary" : "ghost"}
						aria-label={t(message)}
						aria-pressed={category === value}
						className="h-11 justify-start gap-2 whitespace-normal px-3 sm:justify-center"
						onClick={() => setCategory(value)}
					>
						<Icon aria-hidden="true" className="size-4 shrink-0" />
						<span className="text-left">{t(message)}</span>
					</Button>
				))}
			</nav>
			<div className="min-w-0 w-full">
				{category === "units" && (
					<SimpleCatalogSection
						title={t(Messages.referenceData.sections.units)}
						items={(units.data ?? []).map(({ id, name, isActive }) => ({
							id,
							name,
							isActive,
						}))}
						isLoading={units.isLoading}
						isError={units.isError}
						refetch={() => void units.refetch()}
						create={async (name) => {
							await createUnit.mutateAsync({ data: { name } });
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindManageUnitsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindUnitsQueryKey(),
								}),
							]);
						}}
						update={async (item, name, isActive) => {
							await updateUnit.mutateAsync({
								id: item.id,
								data: { name, isActive },
							});
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindManageUnitsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindUnitsQueryKey(),
								}),
							]);
						}}
					/>
				)}
				{category === "goodsTypes" && (
					<SimpleCatalogSection
						title={t(Messages.referenceData.sections.goodsTypes)}
						items={(goodsTypes.data ?? []).map(({ id, name, isActive }) => ({
							id,
							name,
							isActive,
						}))}
						isLoading={goodsTypes.isLoading}
						isError={goodsTypes.isError}
						refetch={() => void goodsTypes.refetch()}
						create={async (name) => {
							await createGoodsType.mutateAsync({ data: { name } });
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindManageGoodsTypesQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindGoodsTypesQueryKey(),
								}),
							]);
						}}
						update={async (item, name, isActive) => {
							await updateGoodsType.mutateAsync({
								id: item.id,
								data: { name, isActive },
							});
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindManageGoodsTypesQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindGoodsTypesQueryKey(),
								}),
							]);
						}}
					/>
				)}
				{category === "goods" && (
					<section className="min-w-0">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
							<h2 className="text-base font-semibold">
								{t(Messages.referenceData.sections.goods)}
							</h2>
							<Button
								type="button"
								onClick={startGoodCreate}
								disabled={!goodsTypeOptions.some((type) => type.isActive)}
							>
								<PlusIcon aria-hidden="true" />
								{t(Messages.referenceData.add)}
							</Button>
						</div>
						{goodsTypeOptions.some((type) => type.isActive) ? null : (
							<p className="mb-4 text-sm text-muted-foreground">
								{t(Messages.referenceData.goodsTypeRequired)}
							</p>
						)}
						{goods.isLoading ? (
							<div className="rounded-lg border p-4 text-sm text-muted-foreground">
								{t(Messages.common.loadingResource, {
									resource: t(Messages.referenceData.sections.goods),
								})}
							</div>
						) : goods.isError ? (
							<div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
								<p className="text-sm text-destructive">
									{t(Messages.referenceData.loadFailed)}
								</p>
								<Button
									type="button"
									variant="outline"
									onClick={() => void goods.refetch()}
								>
									{t(Messages.common.actions.retry)}
								</Button>
							</div>
						) : (
							<div className="overflow-hidden rounded-lg border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-1/4 whitespace-normal">
												{t(Messages.referenceData.name)}
											</TableHead>
											<TableHead>
												{t(Messages.referenceData.goodsCode)}
											</TableHead>
											<TableHead>
												{t(Messages.referenceData.goodsType)}
											</TableHead>
											<TableHead className="w-36">
												{t(Messages.common.fields.status)}
											</TableHead>
											<TableHead className="w-32 text-right">
												{t(Messages.referenceData.actions)}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{(goods.data ?? []).length ? (
											(goods.data ?? []).map((item) => {
												const type = goodsTypeOptions.find(
													(entry) => entry.id === item.goodsTypeId,
												);
												return (
													<TableRow key={item.id}>
														<TableCell className="w-1/4 whitespace-normal">
															<button
																type="button"
																className="block min-h-11 w-full whitespace-normal break-words text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
																onClick={() => startGoodEdit(item)}
															>
																{item.name}
															</button>
														</TableCell>
														<TableCell className="font-mono">
															{item.goodsCode}
														</TableCell>
														<TableCell>{type?.name ?? "—"}</TableCell>
														<TableCell>
															<Badge variant="outline">
																{t(
																	item.isActive
																		? Messages.referenceData.active
																		: Messages.referenceData.archived,
																)}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<Button
																type="button"
																variant="ghost"
																onClick={() => startGoodEdit(item)}
															>
																<PencilIcon aria-hidden="true" />
																{t(Messages.referenceData.edit)}
															</Button>
														</TableCell>
													</TableRow>
												);
											})
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
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
						<CatalogEntryDialog
							open={goodsDialogOpen}
							onOpenChange={setGoodsDialogOpen}
							title={t(
								editingGood
									? Messages.referenceData.editTitle
									: Messages.referenceData.addTitle,
								{ resource: t(Messages.referenceData.sections.goods) },
							)}
							description={t(Messages.referenceData.dialogDescription, {
								resource: t(Messages.referenceData.sections.goods),
							})}
							initialValue={
								editingGood
									? {
											name: editingGood.name,
											goodsCode: editingGood.goodsCode,
											goodsTypeId: editingGood.goodsTypeId,
											isActive: editingGood.isActive,
										}
									: {
											...emptyDraft,
											goodsTypeId:
												goodsTypeOptions.find((type) => type.isActive)?.id ??
												"",
										}
							}
							goodsTypes={goodsTypeOptions}
							showGoodsFields
							allowInactiveGoodsType={Boolean(editingGood)}
							isEditing={Boolean(editingGood)}
							error={goodsError}
							saving={goodsSaving}
							onSubmit={submitGood}
						/>
					</section>
				)}
				{category === "accessoryOperations" && (
					<SimpleCatalogSection
						title={t(Messages.referenceData.sections.accessoryOperations)}
						items={(accessoryOperations.data ?? []).map(
							({ id, name, isActive }) => ({ id, name, isActive }),
						)}
						isLoading={accessoryOperations.isLoading}
						isError={accessoryOperations.isError}
						refetch={() => void accessoryOperations.refetch()}
						create={async (name) => {
							await createAccessoryOperation.mutateAsync({ data: { name } });
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindManageAccessoryOperationsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindAccessoryOperationsQueryKey(),
								}),
							]);
						}}
						update={async (item, name, isActive) => {
							await updateAccessoryOperation.mutateAsync({
								id: item.id,
								data: { name, isActive },
							});
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindManageAccessoryOperationsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindAccessoryOperationsQueryKey(),
								}),
							]);
						}}
					/>
				)}
				{category === "rejectionReasons" && (
					<SimpleCatalogSection
						title={t(Messages.referenceData.sections.rejectionReasons)}
						items={(rejectionReasons.data ?? []).map(
							({ id, name, isActive }) => ({ id, name, isActive }),
						)}
						isLoading={rejectionReasons.isLoading}
						isError={rejectionReasons.isError}
						refetch={() => void rejectionReasons.refetch()}
						create={async (name) => {
							await createRejectionReason.mutateAsync({ data: { name } });
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindManageRejectionReasonsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindRejectionReasonsQueryKey(),
								}),
							]);
						}}
						update={async (item, name, isActive) => {
							await updateRejectionReason.mutateAsync({
								id: item.id,
								data: { name, isActive },
							});
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey:
										getCatalogControllerFindManageRejectionReasonsQueryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: getCatalogControllerFindRejectionReasonsQueryKey(),
								}),
							]);
						}}
					/>
				)}
			</div>
		</div>
	);
}
