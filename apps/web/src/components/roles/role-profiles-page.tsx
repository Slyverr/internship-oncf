"use client";

import {
	PERMISSION_DEFINITIONS,
	Permission,
	RolePersona,
} from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	PencilIcon,
	PlusIcon,
	SearchIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
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
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { TypedMessageTranslator } from "@/i18n";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	RolePersona as ApiRolePersona,
	type CreateRoleProfileDto,
	type PermissionDefinitionDto,
	type RoleProfileDto,
} from "@/lib/api/generated.schemas";
import {
	getRolesControllerFindProfilesQueryKey,
	useRolesControllerCreateProfile,
	useRolesControllerFindPermissionDefinitions,
	useRolesControllerFindProfiles,
	useRolesControllerUpdateProfile,
} from "@/lib/api/roles";
import { getFormErrorMessage } from "@/lib/form-utils";
import { filterPermissionsBySearch } from "@/lib/permission-search";
import { useAuth } from "@/providers/auth-provider";

type Draft = {
	name: string;
	description: string;
	persona: CreateRoleProfileDto["persona"];
	permissionNames: string[];
};

const emptyDraft: Draft = {
	name: "",
	description: "",
	persona: ApiRolePersona.AGENT_COMMERCIAL,
	permissionNames: [],
};

const permissionModuleOrder = [
	"orders",
	"programs",
	"claims",
	"customers",
	"tracking",
	"reports",
	"users",
	"catalog",
	"roles",
	"permissions",
	"attachments",
	"profile",
	"notifications",
	"logs",
	"archival",
];

function createInitialDraft(
	profile: RoleProfileDto | null,
	permissions: PermissionDefinitionDto[],
): Draft {
	if (!profile) return emptyDraft;
	return {
		name: profile.name,
		description: profile.description ?? "",
		persona:
			profile.persona === RolePersona.CLIENT_REPRESENTATIVE
				? ApiRolePersona.CLIENT_REPRESENTATIVE
				: ApiRolePersona.AGENT_COMMERCIAL,
		permissionNames: profile.permissionNames.filter((name) =>
			permissions.some(
				(permission) => permission.name === name && permission.assignable,
			),
		),
	};
}

function getPersonaLabel(
	persona: RoleProfileDto["persona"],
	t: TypedMessageTranslator,
) {
	if (persona === RolePersona.ADMIN) return t(Messages.users.roles.admin);
	if (persona === RolePersona.AGENT_COMMERCIAL)
		return t(Messages.roleProfiles.agentPersona);
	if (persona === RolePersona.CLIENT_REPRESENTATIVE)
		return t(Messages.roleProfiles.clientPersona);
	return t(Messages.users.roles.unknown);
}

function getProfileDisplayName(
	profile: RoleProfileDto,
	t: TypedMessageTranslator,
) {
	return profile.isSystem ? getPersonaLabel(profile.persona, t) : profile.name;
}

function getSafeError(error: unknown, locale: ReturnType<typeof useLocale>) {
	return getFormErrorMessage(error, locale) ?? "";
}

function ProfileStatus({
	profile,
	onToggle,
}: {
	profile: RoleProfileDto;
	onToggle: () => void;
}) {
	const t = useTranslate();
	if (profile.isSystem) {
		return <Badge variant="secondary">{t(Messages.roleProfiles.system)}</Badge>;
	}

	return (
		<Switch
			checked={profile.isActive}
			aria-label={t(
				profile.isActive
					? Messages.roleProfiles.archive
					: Messages.roleProfiles.restore,
			)}
			onCheckedChange={onToggle}
		/>
	);
}

function ProfileActions({
	profile,
	onEdit,
}: {
	profile: RoleProfileDto;
	onEdit: () => void;
}) {
	const t = useTranslate();
	if (profile.isSystem) return null;
	return (
		<div className="flex flex-wrap gap-2">
			<TableActionButton
				icon={PencilIcon}
				label={t(Messages.roleProfiles.edit)}
				onClick={onEdit}
			/>
		</div>
	);
}

function RoleProfileDialog({
	open,
	onOpenChange,
	profile,
	permissions,
	isSaving,
	error,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: RoleProfileDto | null;
	permissions: PermissionDefinitionDto[];
	isSaving: boolean;
	error: string;
	onSave: (draft: Draft, profile: RoleProfileDto | null) => Promise<void>;
}) {
	const t = useTranslate();
	const [draft, setDraft] = useState<Draft>(() =>
		createInitialDraft(profile, permissions),
	);
	const [permissionSearch, setPermissionSearch] = useState("");

	const selectablePermissions = permissions
		.filter((permission) => permission.assignable)
		.map((permission) => ({
			...permission,
			description:
				PERMISSION_DEFINITIONS[permission.name as Permission]?.description ??
				"",
		}));
	const modules = Array.from(
		new Set(
			selectablePermissions.map((permission) => permission.name.split(":")[0]),
		),
	).sort((left, right) => {
		const leftIndex = permissionModuleOrder.indexOf(left);
		const rightIndex = permissionModuleOrder.indexOf(right);
		if (leftIndex < 0 && rightIndex < 0) return left.localeCompare(right);
		if (leftIndex < 0) return 1;
		if (rightIndex < 0) return -1;
		return leftIndex - rightIndex;
	});
	const filteredPermissions = filterPermissionsBySearch(
		selectablePermissions,
		permissionSearch,
	);
	const filteredModules = modules.filter((module) =>
		filteredPermissions.some((permission) =>
			permission.name.startsWith(`${module}:`),
		),
	);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft.name.trim() || draft.permissionNames.length === 0) return;
		await onSave(
			{
				...draft,
				name: draft.name.trim(),
				description: draft.description.trim(),
			},
			profile,
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) setPermissionSearch("");
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent size="wide" className="gap-0 overflow-hidden p-0">
				<DialogHeader className="mx-6 mt-6 pb-4">
					<DialogTitle className="text-base">
						{t(
							profile
								? Messages.roleProfiles.editTitle
								: Messages.roleProfiles.createTitle,
						)}
					</DialogTitle>
					<DialogDescription>
						{t(Messages.roleProfiles.dialogDescription)}
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="p-6">
					<form id="role-profile-form" className="grid gap-6" onSubmit={submit}>
						<div className="grid gap-4 xl:grid-cols-2">
							<div className="oncf-field">
								<Label htmlFor="role-profile-name">
									{t(Messages.roleProfiles.name)}
								</Label>
								<Input
									id="role-profile-name"
									value={draft.name}
									placeholder={t(Messages.roleProfiles.namePlaceholder)}
									maxLength={100}
									onChange={(event) =>
										setDraft((current) => ({
											...current,
											name: event.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="oncf-field">
								<Label htmlFor="role-profile-persona">
									{t(Messages.roleProfiles.persona)}
								</Label>
								<Select
									value={draft.persona}
									onValueChange={(value) =>
										value &&
										setDraft((current) => ({
											...current,
											persona: value as Draft["persona"],
										}))
									}
								>
									<SelectTrigger id="role-profile-persona" className="w-full">
										<SelectValue>
											{t(
												draft.persona === ApiRolePersona.AGENT_COMMERCIAL
													? Messages.roleProfiles.agentPersona
													: Messages.roleProfiles.clientPersona,
											)}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={ApiRolePersona.AGENT_COMMERCIAL}>
											{t(Messages.roleProfiles.agentPersona)}
										</SelectItem>
										<SelectItem value={ApiRolePersona.CLIENT_REPRESENTATIVE}>
											{t(Messages.roleProfiles.clientPersona)}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="oncf-field xl:col-span-2">
								<Label htmlFor="role-profile-description">
									{t(Messages.roleProfiles.descriptionLabel)}
								</Label>
								<Input
									id="role-profile-description"
									value={draft.description}
									placeholder={t(Messages.roleProfiles.descriptionPlaceholder)}
									maxLength={500}
									onChange={(event) =>
										setDraft((current) => ({
											...current,
											description: event.target.value,
										}))
									}
								/>
							</div>
						</div>
						<section
							className="grid min-h-0 gap-4"
							aria-labelledby="role-profile-permissions-heading"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="grid gap-1">
									<h3
										id="role-profile-permissions-heading"
										className="text-sm font-semibold"
									>
										{t(Messages.roleProfiles.permissions)}
									</h3>
									<p className="text-sm text-muted-foreground">
										{t(Messages.roleProfiles.permissionHint)}
									</p>
								</div>
								<Badge variant="secondary">
									{t(Messages.roleProfiles.selectedPermissionCount, {
										count: draft.permissionNames.length,
									})}
								</Badge>
							</div>
							{selectablePermissions.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									{t(Messages.roleProfiles.noPermissions)}
								</p>
							) : (
								<div className="grid content-start gap-4">
									<div className="oncf-field">
										<Label htmlFor="role-profile-permission-search">
											{t(Messages.roleProfiles.permissionSearchLabel)}
										</Label>
										<div className="relative">
											<SearchIcon
												aria-hidden="true"
												className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
											/>
											<Input
												id="role-profile-permission-search"
												type="search"
												value={permissionSearch}
												placeholder={t(
													Messages.roleProfiles.permissionSearchPlaceholder,
												)}
												onChange={(event) =>
													setPermissionSearch(event.target.value)
												}
												className="pl-10"
											/>
										</div>
									</div>
									{filteredPermissions.length === 0 ? (
										<p className="text-sm text-muted-foreground" role="status">
											{t(Messages.roleProfiles.noPermissionMatches)}
										</p>
									) : (
										<div className="grid content-start gap-4 xl:grid-cols-2">
											{filteredModules.map((module) => (
												<fieldset
													key={module}
													className="min-w-0 rounded-lg border p-4"
												>
													<legend className="px-2 text-sm font-semibold capitalize">
														{module}
													</legend>
													<div className="grid gap-control sm:grid-cols-2">
														{filteredPermissions
															.filter((permission) =>
																permission.name.startsWith(`${module}:`),
															)
															.map((permission) => {
																const checked = draft.permissionNames.includes(
																	permission.name,
																);
																return (
																	<label
																		key={permission.name}
																		htmlFor={`role-permission-${permission.name.replaceAll(":", "-")}`}
																		className={`flex min-h-12 min-w-0 cursor-pointer items-center gap-control rounded-md border px-control py-compact transition-colors ${checked ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/50"}`}
																	>
																		<Checkbox
																			id={`role-permission-${permission.name.replaceAll(":", "-")}`}
																			checked={checked}
																			onCheckedChange={(next) =>
																				setDraft((current) => ({
																					...current,
																					permissionNames: next
																						? Array.from(
																								new Set([
																									...current.permissionNames,
																									permission.name,
																								]),
																							)
																						: current.permissionNames.filter(
																								(name) =>
																									name !== permission.name,
																							),
																				}))
																			}
																		/>
																		<code className="min-w-0 break-words text-sm">
																			{permission.name}
																		</code>
																	</label>
																);
															})}
													</div>
												</fieldset>
											))}
										</div>
									)}
								</div>
							)}
						</section>
						{error && (
							<p className="text-sm text-destructive" role="alert">
								{error}
							</p>
						)}
					</form>
				</DialogBody>
				<DialogFooter className="mx-6 mb-6">
					<Button
						variant="outline"
						type="button"
						onClick={() => onOpenChange(false)}
					>
						{t(Messages.roleProfiles.cancel)}
					</Button>
					<Button
						type="submit"
						form="role-profile-form"
						disabled={
							isSaving ||
							draft.permissionNames.length === 0 ||
							!draft.name.trim()
						}
					>
						{t(Messages.roleProfiles.save)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function RoleProfilesPage() {
	const t = useTranslate();
	const locale = useLocale();
	const { hasPermission } = useAuth();
	const canManage = hasPermission(Permission.ROLES_MANAGE);
	const queryClient = useQueryClient();
	const profilesQuery = useRolesControllerFindProfiles({
		query: { enabled: canManage },
	});
	const permissionsQuery = useRolesControllerFindPermissionDefinitions({
		query: { enabled: canManage },
	});
	const createMutation = useRolesControllerCreateProfile();
	const updateMutation = useRolesControllerUpdateProfile();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingProfile, setEditingProfile] = useState<RoleProfileDto | null>(
		null,
	);
	const [dialogError, setDialogError] = useState("");
	const [pageError, setPageError] = useState("");
	const [statusTarget, setStatusTarget] = useState<RoleProfileDto | null>(null);
	const [statusSaving, setStatusSaving] = useState(false);

	if (!canManage) {
		return (
			<p className="text-sm text-muted-foreground">
				{t(Messages.roleProfiles.noAccess)}
			</p>
		);
	}

	const profiles = profilesQuery.data ?? [];
	const permissions = permissionsQuery.data ?? [];
	const isSaving = createMutation.isPending || updateMutation.isPending;

	function openCreate() {
		setEditingProfile(null);
		setDialogError("");
		setDialogOpen(true);
	}

	function openEdit(profile: RoleProfileDto) {
		setEditingProfile(profile);
		setDialogError("");
		setDialogOpen(true);
	}

	async function saveProfile(draft: Draft, profile: RoleProfileDto | null) {
		setDialogError("");
		try {
			if (profile) {
				await updateMutation.mutateAsync({
					id: profile.id,
					data: {
						name: draft.name,
						description: draft.description || null,
						persona: draft.persona,
						permissionNames:
							draft.permissionNames as CreateRoleProfileDto["permissionNames"],
					},
				});
			} else {
				await createMutation.mutateAsync({
					data: {
						name: draft.name,
						description: draft.description || null,
						persona: draft.persona,
						permissionNames:
							draft.permissionNames as CreateRoleProfileDto["permissionNames"],
					},
				});
			}
			await queryClient.invalidateQueries({
				queryKey: getRolesControllerFindProfilesQueryKey(),
			});
			setDialogOpen(false);
		} catch (error) {
			setDialogError(getSafeError(error, locale));
		}
	}

	async function changeProfileStatus() {
		if (!statusTarget) return;
		setStatusSaving(true);
		setPageError("");
		try {
			await updateMutation.mutateAsync({
				id: statusTarget.id,
				data: { isActive: !statusTarget.isActive },
			});
			await queryClient.invalidateQueries({
				queryKey: getRolesControllerFindProfilesQueryKey(),
			});
			setStatusTarget(null);
		} catch (error) {
			setPageError(getSafeError(error, locale));
		} finally {
			setStatusSaving(false);
		}
	}

	const queryError = profilesQuery.isError
		? t(Messages.roleProfiles.loadFailed)
		: permissionsQuery.isError
			? t(Messages.roleProfiles.permissionLoadFailed)
			: "";

	return (
		<>
			<PageHeader
				title={t(Messages.roleProfiles.pageTitle)}
				description={t(Messages.roleProfiles.description)}
			>
				<Button
					onClick={openCreate}
					disabled={permissionsQuery.isPending || permissionsQuery.isError}
				>
					<PlusIcon data-icon="inline-start" />
					{t(Messages.roleProfiles.create)}
				</Button>
			</PageHeader>
			{(queryError || pageError) && (
				<p role="alert" className="text-sm text-destructive">
					{pageError || queryError}
				</p>
			)}
			{profilesQuery.isPending ? (
				<p className="text-sm text-muted-foreground">
					{t(Messages.common.loadingResource, {
						resource: t(Messages.roleProfiles.pageTitle),
					})}
				</p>
			) : profiles.length === 0 ? (
				<div className="oncf-card grid justify-items-center gap-4 p-8 text-center">
					<ShieldCheckIcon className="size-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						{t(Messages.roleProfiles.noProfiles)}
					</p>
				</div>
			) : (
				<>
					<div className="grid divide-y border-y @5xl/workspace:hidden">
						{profiles.map((profile) => (
							<article
								key={profile.id}
								className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 py-4"
							>
								<div className="grid min-w-0 gap-1">
									<div className="flex min-w-0 flex-wrap items-center gap-2">
										<h2 className="min-w-0 break-words text-sm font-semibold">
											{getProfileDisplayName(profile, t)}
										</h2>
									</div>
									{!profile.isSystem && profile.description && (
										<p className="text-sm text-muted-foreground">
											{profile.description}
										</p>
									)}
								</div>
								<div className="flex items-center justify-end gap-2">
									<ProfileStatus
										profile={profile}
										onToggle={() => setStatusTarget(profile)}
									/>
									<ProfileActions
										profile={profile}
										onEdit={() => openEdit(profile)}
									/>
								</div>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
									<span>{getPersonaLabel(profile.persona, t)}</span>
									<span className="text-muted-foreground">
										{t(Messages.roleProfiles.permissionCount, {
											count: profile.permissionNames.length,
										})}
									</span>
								</div>
							</article>
						))}
					</div>
					<div className="hidden rounded-md border @5xl/workspace:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t(Messages.roleProfiles.name)}</TableHead>
									<TableHead>{t(Messages.roleProfiles.persona)}</TableHead>
									<TableHead>{t(Messages.roleProfiles.permissions)}</TableHead>
									<TableHead className="w-24 text-center">
										{t(Messages.roleProfiles.status)}
									</TableHead>
									<TableHead className="text-right">
										{t(Messages.referenceData.actions)}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{profiles.map((profile) => (
									<TableRow key={profile.id}>
										<TableCell className="font-medium">
											<div className="grid min-w-0 gap-1">
												<div className="flex min-w-0 flex-wrap items-center gap-2">
													<span className="min-w-0 break-words">
														{getProfileDisplayName(profile, t)}
													</span>
												</div>
												{!profile.isSystem && profile.description && (
													<span className="text-xs font-normal text-muted-foreground">
														{profile.description}
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>{getPersonaLabel(profile.persona, t)}</TableCell>
										<TableCell className="text-center">
											{t(Messages.roleProfiles.permissionCount, {
												count: profile.permissionNames.length,
											})}
										</TableCell>
										<TableCell className="text-center">
											<ProfileStatus
												profile={profile}
												onToggle={() => setStatusTarget(profile)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex justify-end">
												<ProfileActions
													profile={profile}
													onEdit={() => openEdit(profile)}
												/>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</>
			)}
			<RoleProfileDialog
				key={`${editingProfile?.id ?? "new"}:${dialogOpen}`}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				profile={editingProfile}
				permissions={permissions}
				isSaving={isSaving}
				error={dialogError}
				onSave={saveProfile}
			/>
			<ConfirmDialog
				open={statusTarget !== null}
				onOpenChange={(open) => !open && setStatusTarget(null)}
				title={t(
					statusTarget?.isActive
						? Messages.roleProfiles.archiveTitle
						: Messages.roleProfiles.restoreTitle,
				)}
				description={t(
					statusTarget?.isActive
						? Messages.roleProfiles.archiveDescription
						: Messages.roleProfiles.restoreDescription,
				)}
				confirmLabel={t(
					statusTarget?.isActive
						? Messages.roleProfiles.archive
						: Messages.roleProfiles.restore,
				)}
				variant={statusTarget?.isActive ? "destructive" : "default"}
				disabled={statusSaving}
				onConfirm={() => void changeProfileStatus()}
			/>
		</>
	);
}
