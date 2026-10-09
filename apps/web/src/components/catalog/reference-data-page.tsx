"use client";

import {
	CATALOG_MANAGEMENT_REQUIREMENTS,
	GoodsType,
	ManagedReferenceResource,
	Permission,
} from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	AnchorIcon,
	Building2Icon,
	CircleHelpIcon,
	MapPinIcon,
	PackageIcon,
	PencilIcon,
	RulerIcon,
	ShipIcon,
	TagIcon,
	TrainTrackIcon,
	WrenchIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { ReferenceDataSectionHeader } from "@/components/catalog/reference-data-section-header";
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
	useCatalogControllerFindGoodsTypes,
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
import { ManagedReferenceDataSection } from "./managed-reference-data-section";

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

function getGoodsTypeLabel(name: string) {
	return name in GoodsType ? GoodsType[name as keyof typeof GoodsType] : name;
}

const emptyDraft: CatalogDraft = {
	name: "",
	isActive: true,
	goodsCode: "",
	goodsTypeId: "",
};

const categoryOptions = [
	{
		value: "units",
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.units,
		message: Messages.referenceData.sections.units,
		icon: RulerIcon,
	},
	{
		value: "goodsTypes",
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.goodsTypes,
		message: Messages.referenceData.sections.goodsTypes,
		icon: TagIcon,
	},
	{
		value: "goods",
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.goods,
		message: Messages.referenceData.sections.goods,
		icon: PackageIcon,
	},
	{
		value: "accessoryOperations",
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.accessoryOperations,
		message: Messages.referenceData.sections.accessoryOperations,
		icon: WrenchIcon,
	},
	{
		value: "rejectionReasons",
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.rejectionReasons,
		message: Messages.referenceData.sections.rejectionReasons,
		icon: CircleHelpIcon,
	},
	{
		value: ManagedReferenceResource.STATIONS,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.stations,
		message: Messages.referenceData.sections.stations,
		icon: MapPinIcon,
	},
	{
		value: ManagedReferenceResource.AGENCIES,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.agencies,
		message: Messages.referenceData.sections.agencies,
		icon: Building2Icon,
	},
	{
		value: ManagedReferenceResource.PORTS,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.ports,
		message: Messages.referenceData.sections.ports,
		icon: AnchorIcon,
	},
	{
		value: ManagedReferenceResource.BERTHS,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.berths,
		message: Messages.referenceData.sections.berths,
		icon: AnchorIcon,
	},
	{
		value: ManagedReferenceResource.SIDINGS,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.sidings,
		message: Messages.referenceData.sections.sidings,
		icon: TrainTrackIcon,
	},
	{
		value: ManagedReferenceResource.VESSELS,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.vessels,
		message: Messages.referenceData.sections.vessels,
		icon: ShipIcon,
	},
	{
		value: ManagedReferenceResource.SHIPPING_COMPANIES,
		permissions: CATALOG_MANAGEMENT_REQUIREMENTS.shippingCompanies,
		message: Messages.referenceData.sections.shippingCompanies,
		icon: Building2Icon,
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
	const selectedGoodsType = availableGoodsTypes.find(
		(type) => type.id === draft.goodsTypeId,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="content" className="gap-0 overflow-hidden p-0">
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
											>
												{draft.goodsTypeId
													? selectedGoodsType
														? getGoodsTypeLabel(selectedGoodsType.name)
														: "—"
													: undefined}
											</SelectValue>
										</SelectTrigger>
										<SelectContent className="max-h-40">
											{availableGoodsTypes.map((type) => (
												<SelectItem key={type.id} value={type.id}>
													{getGoodsTypeLabel(type.name)}
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
	formatName,
}: {
	items: CatalogItem[];
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
	onEdit: (item: CatalogItem) => void;
	formatName?: (name: string) => string;
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
			<Table className="min-w-[34rem]">
				<TableHeader>
					<TableRow>
						<TableHead>{t(Messages.referenceData.name)}</TableHead>
						<TableHead className="w-36 text-right">
							{t(Messages.common.fields.status)}
						</TableHead>
						<TableHead className="w-20 text-right">
							{t(Messages.referenceData.actions)}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length ? (
						items.map((item) => (
							<TableRow key={item.id} onClick={() => onEdit(item)}>
								<TableCell className="font-medium">
									{formatName?.(item.name) ?? item.name}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end">
										<Badge variant="outline">
											{t(
												item.isActive
													? Messages.referenceData.active
													: Messages.referenceData.archived,
											)}
										</Badge>
									</div>
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
	formatName,
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
	formatName?: (name: string) => string;
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
			<ReferenceDataSectionHeader title={title} onAdd={startCreate} />
			<CatalogTable
				items={items}
				isLoading={isLoading}
				isError={isError}
				refetch={refetch}
				onEdit={startEdit}
				formatName={formatName}
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
	const accessibleCategories = categoryOptions.filter(({ permissions }) =>
		permissions.every(hasPermission),
	);
	const canManageUnits = hasPermission(Permission.CATALOG_MANAGE_UNITS);
	const canManageGoodsTypes = hasPermission(
		Permission.CATALOG_MANAGE_GOODS_TYPES,
	);
	const canManageGoods = hasPermission(Permission.CATALOG_MANAGE_GOODS);
	const canManageAccessoryOperations = hasPermission(
		Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS,
	);
	const canManageRejectionReasons = hasPermission(
		Permission.CATALOG_MANAGE_REJECTION_REASONS,
	);
	const queryClient = useQueryClient();
	const units = useCatalogControllerFindManageUnits({
		query: { enabled: canManageUnits },
	});
	const goodsTypes = useCatalogControllerFindManageGoodsTypes({
		query: { enabled: canManageGoodsTypes },
	});
	const goods = useCatalogControllerFindManageGoods({
		query: { enabled: canManageGoods },
	});
	const accessoryOperations = useCatalogControllerFindManageAccessoryOperations(
		{ query: { enabled: canManageAccessoryOperations } },
	);
	const rejectionReasons = useCatalogControllerFindManageRejectionReasons({
		query: { enabled: canManageRejectionReasons },
	});
	const readableGoodsTypes = useCatalogControllerFindGoodsTypes({
		query: { enabled: canManageGoods && !canManageGoodsTypes },
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
	const [category, setCategory] = useState(
		() => accessibleCategories[0]?.value ?? "units",
	);
	const activeCategory = accessibleCategories.some(
		({ value }) => value === category,
	)
		? category
		: (accessibleCategories[0]?.value ?? "units");
	const [goodsDialogOpen, setGoodsDialogOpen] = useState(false);
	const [editingGood, setEditingGood] = useState<GoodItem | null>(null);
	const [goodsError, setGoodsError] = useState("");
	const [goodsSaving, setGoodsSaving] = useState(false);

	if (accessibleCategories.length === 0) {
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

	const goodsTypeOptions = (
		goodsTypes.data ??
		readableGoodsTypes.data ??
		[]
	).map(({ id, name, isActive }) => ({ id, name, isActive }));

	return (
		<div className="space-y-6">
			<PageHeader
				title={t(Messages.referenceData.pageTitle)}
				description={t(Messages.referenceData.description)}
			/>
			<nav
				aria-label={t(Messages.referenceData.chooseCategory)}
				className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto border-b pb-2 md:flex-wrap md:overflow-visible"
			>
				{accessibleCategories.map(({ value, message, icon: Icon }) => (
					<Button
						key={value}
						type="button"
						variant={activeCategory === value ? "secondary" : "ghost"}
						aria-label={t(message)}
						aria-pressed={activeCategory === value}
						className="h-11 shrink-0 justify-center gap-2 whitespace-nowrap px-3"
						onClick={() => setCategory(value)}
					>
						<Icon aria-hidden="true" className="size-4 shrink-0" />
						<span className="text-left">{t(message)}</span>
					</Button>
				))}
			</nav>
			<div className="min-w-0 w-full">
				{activeCategory === "units" && (
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
				{activeCategory === "goodsTypes" && (
					<SimpleCatalogSection
						title={t(Messages.referenceData.sections.goodsTypes)}
						formatName={getGoodsTypeLabel}
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
				{activeCategory === "goods" && (
					<section className="min-w-0">
						<ReferenceDataSectionHeader
							title={t(Messages.referenceData.sections.goods)}
							onAdd={startGoodCreate}
							addDisabled={!goodsTypeOptions.some((type) => type.isActive)}
						/>
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
											<TableHead className="w-36 text-right">
												{t(Messages.common.fields.status)}
											</TableHead>
											<TableHead className="w-20 text-right">
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
													<TableRow
														key={item.id}
														onClick={() => startGoodEdit(item)}
													>
														<TableCell className="w-1/4 whitespace-normal font-medium">
															{item.name}
														</TableCell>
														<TableCell className="font-mono">
															{item.goodsCode}
														</TableCell>
														<TableCell>
															{type ? getGoodsTypeLabel(type.name) : "—"}
														</TableCell>
														<TableCell className="text-right">
															<div className="flex justify-end">
																<Badge variant="outline">
																	{t(
																		item.isActive
																			? Messages.referenceData.active
																			: Messages.referenceData.archived,
																	)}
																</Badge>
															</div>
														</TableCell>
														<TableCell className="text-right">
															<TableActionButton
																icon={PencilIcon}
																label={t(Messages.referenceData.edit)}
																onClick={() => startGoodEdit(item)}
															/>
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
				{activeCategory === "accessoryOperations" && (
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
				{activeCategory === "rejectionReasons" && (
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
				{[
					ManagedReferenceResource.STATIONS,
					ManagedReferenceResource.AGENCIES,
					ManagedReferenceResource.PORTS,
					ManagedReferenceResource.BERTHS,
					ManagedReferenceResource.SIDINGS,
					ManagedReferenceResource.VESSELS,
					ManagedReferenceResource.SHIPPING_COMPANIES,
				].includes(activeCategory as ManagedReferenceResource) && (
					<ManagedReferenceDataSection
						resource={activeCategory as ManagedReferenceResource}
						title={t(
							Messages.referenceData.sections[
								activeCategory as keyof typeof Messages.referenceData.sections
							],
						)}
					/>
				)}
			</div>
		</div>
	);
}
