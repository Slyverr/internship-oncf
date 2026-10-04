"use client";

import { Permission, RolePersona } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
	ChevronDownIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
import { TableActionButton } from "@/components/common/table-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
	disabled,
}: {
	profile: RoleProfileDto;
	onToggle: () => void;
	disabled: boolean;
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
					? Messages.roleProfiles.deactivate
					: Messages.roleProfiles.activate,
				{ profile: getProfileDisplayName(profile, t) },
			)}
			disabled={disabled}
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

function RoleProfileWizard({
	profile,
	permissions,
	isSaving,
	error,
	onSave,
	onCancel,
}: {
	profile: RoleProfileDto | null;
	permissions: PermissionDefinitionDto[];
	isSaving: boolean;
	error: string;
	onSave: (draft: Draft, profile: RoleProfileDto | null) => Promise<void>;
	onCancel: () => void;
}) {
	const t = useTranslate();
	const [draft, setDraft] = useState<Draft>(() =>
		createInitialDraft(profile, permissions),
	);
	const [permissionSearch, setPermissionSearch] = useState("");
	const [currentStep, setCurrentStep] = useState(0);

	const selectablePermissions = permissions
		.filter((permission) => permission.assignable)
		.map((permission) => ({
			...permission,
			description: t(
				Messages.roleProfiles.permissionDescriptions[
					permission.name as Permission
				],
			),
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
	const permissionByName = new Map(
		selectablePermissions.map((permission) => [permission.name, permission]),
	);
	const visiblePermissionNames = new Set(
		filteredPermissions.map((permission) => permission.name),
	);
	const addVisibleDescendants = (parentName: string) => {
		for (const child of selectablePermissions.filter(
			(candidate) => candidate.parent === parentName,
		)) {
			visiblePermissionNames.add(child.name);
			addVisibleDescendants(child.name);
		}
	};
	for (const permission of filteredPermissions) {
		let parent = permission.parent;
		while (parent) {
			visiblePermissionNames.add(parent);
			parent = permissionByName.get(parent)?.parent;
		}
		addVisibleDescendants(permission.name);
	}
	const visiblePermissions = selectablePermissions.filter((permission) =>
		visiblePermissionNames.has(permission.name),
	);
	const filteredModules = modules.filter((module) =>
		visiblePermissions.some((permission) =>
			permission.name.startsWith(`${module}:`),
		),
	);
	const steps = [
		{
			title: t(Messages.roleProfiles.profileDetailsStep),
			description: t(Messages.roleProfiles.profileDetailsStep),
		},
		{
			title: t(Messages.roleProfiles.permissionsStep),
			description: t(Messages.roleProfiles.permissionsStep),
		},
	];

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft.name.trim()) return;
		if (currentStep === 0) {
			setCurrentStep(1);
			return;
		}
		if (draft.permissionNames.length === 0) return;
		await onSave(
			{
				...draft,
				name: draft.name.trim(),
				description: draft.description.trim(),
			},
			profile,
		);
	}

	function togglePermission(name: string, checked: boolean) {
		setDraft((current) => ({
			...current,
			permissionNames: checked
				? Array.from(new Set([...current.permissionNames, name]))
				: current.permissionNames.filter((permission) => permission !== name),
		}));
	}

	function renderPermissionNode(
		permission: (typeof selectablePermissions)[number],
		inheritedFrom?: string,
	) {
		const directlySelected = draft.permissionNames.includes(permission.name);
		const selected = directlySelected || inheritedFrom !== undefined;
		const children = visiblePermissions.filter(
			(child) => child.parent === permission.name,
		);
		const id = `role-permission-${permission.name.replaceAll(":", "-")}`;
		return (
			<div key={permission.name} className="grid gap-control">
				<label
					htmlFor={id}
					className={`flex min-w-0 cursor-pointer items-start gap-control rounded-md border px-3 py-compact transition-colors ${selected ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/50"}`}
				>
					<Checkbox
						id={id}
						className="mt-1"
						checked={selected}
						disabled={isSaving || inheritedFrom !== undefined}
						onCheckedChange={(checked) =>
							togglePermission(permission.name, Boolean(checked))
						}
					/>
					<span className="grid min-w-0 gap-1">
						<span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							<span className="text-sm font-medium">
								{permission.description}
							</span>
							<code className="break-all text-xs text-muted-foreground">
								{permission.name}
							</code>
						</span>
						{inheritedFrom && (
							<span className="text-xs text-muted-foreground">
								{t(Messages.roleProfiles.permissionInherited, {
									permission: inheritedFrom,
								})}
							</span>
						)}
					</span>
				</label>
				{children.length > 0 && (
					<div className="ml-4 grid gap-control border-l pl-3">
						{children.map((child) =>
							renderPermissionNode(
								child,
								inheritedFrom ??
									(directlySelected ? permission.name : undefined),
							),
						)}
					</div>
				)}
			</div>
		);
	}

	return (
		<form id="role-profile-form" className="workspace-form" onSubmit={submit}>
			<PageHeader
				title={t(
					profile
						? Messages.roleProfiles.editTitle
						: Messages.roleProfiles.createTitle,
				)}
				description={t(Messages.roleProfiles.dialogDescription)}
			/>
			<GuidedFormProgress steps={steps} currentStep={currentStep} />
			<Card>
				{currentStep === 0 && (
					<CardHeader>
						<CardTitle>{t(Messages.roleProfiles.profileDetailsStep)}</CardTitle>
					</CardHeader>
				)}
				<CardContent className="grid min-w-0 gap-6">
					{currentStep === 0 ? (
						<div className="grid content-start gap-4 xl:grid-cols-2">
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
								<p className="text-sm text-muted-foreground">
									{t(Messages.roleProfiles.personaHint)}
								</p>
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
					) : (
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
							<details className="group rounded-lg border bg-muted/20 px-4 py-3">
								<summary className="cursor-pointer list-none text-sm font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
									<span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
										<span className="flex min-w-0 items-center gap-2">
											<span>
												{t(Messages.roleProfiles.permissionGuideTitle)}
											</span>
											<ChevronDownIcon
												className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
												aria-hidden="true"
											/>
										</span>
										<span className="text-xs font-normal text-muted-foreground">
											{t(Messages.roleProfiles.permissionConventionHint)}
										</span>
									</span>
								</summary>
								<div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2">
									{(["records", "scope", "target", "action"] as const).map(
										(kind) => (
											<div key={kind} className="grid content-start gap-1">
												<p className="text-sm font-medium">
													{t(
														Messages.roleProfiles.permissionGuide[
															`${kind}Label`
														],
													)}
												</p>
												<code className="break-words text-xs text-muted-foreground">
													{t(
														Messages.roleProfiles.permissionGuide[
															`${kind}Code`
														],
													)}
												</code>
												<p className="text-sm leading-5 text-muted-foreground">
													{t(
														Messages.roleProfiles.permissionGuide[
															`${kind}Description`
														],
													)}
												</p>
											</div>
										),
									)}
								</div>
							</details>
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
											{filteredModules.map((module) => {
												const modulePermissions = visiblePermissions.filter(
													(permission) =>
														permission.name.startsWith(`${module}:`),
												);
												const moduleNames = new Set(
													modulePermissions.map(
														(permission) => permission.name,
													),
												);
												const roots = modulePermissions.filter(
													(permission) =>
														!permission.parent ||
														!moduleNames.has(permission.parent),
												);
												return (
													<fieldset
														key={module}
														className="min-w-0 rounded-lg border p-4"
													>
														<legend className="px-2 text-sm font-semibold capitalize">
															{module}
														</legend>
														<div className="grid gap-2">
															{roots.map((permission) =>
																renderPermissionNode(permission),
															)}
														</div>
													</fieldset>
												);
											})}
										</div>
									)}
								</div>
							)}
						</section>
					)}
				</CardContent>
			</Card>
			<GuidedFormActions
				currentStep={currentStep}
				stepCount={steps.length}
				onCancel={onCancel}
				onPrevious={() => setCurrentStep(0)}
				onContinue={() => setCurrentStep(1)}
				submitLabel={t(Messages.roleProfiles.save)}
				pendingLabel={t(Messages.roleProfiles.saving)}
				isSubmitting={false}
				isPending={isSaving}
				isSubmitDisabled={draft.permissionNames.length === 0}
				isContinueDisabled={!draft.name.trim()}
				errorMessage={error}
				formId="role-profile-form"
				mobileInline
			/>
		</form>
	);
}

type RoleProfilesPageProps = {
	mode?: "list" | "create" | "edit";
	profileId?: string;
};

export function RoleProfilesPage({
	mode = "list",
	profileId,
}: RoleProfilesPageProps) {
	const t = useTranslate();
	const locale = useLocale();
	const router = useRouter();
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
	const [editorError, setEditorError] = useState("");
	const [pageError, setPageError] = useState("");

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
	const editingProfile =
		mode === "edit"
			? profiles.find((profile) => profile.id === profileId)
			: null;

	async function saveProfile(draft: Draft, profile: RoleProfileDto | null) {
		setEditorError("");
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
			router.push("/dashboard/roles");
		} catch (error) {
			setEditorError(getSafeError(error, locale));
		}
	}

	async function updateProfileStatus(
		profile: RoleProfileDto,
		isActive: boolean,
	) {
		setPageError("");
		try {
			await updateMutation.mutateAsync({
				id: profile.id,
				data: { isActive },
			});
			await queryClient.invalidateQueries({
				queryKey: getRolesControllerFindProfilesQueryKey(),
			});
		} catch (error) {
			setPageError(getSafeError(error, locale));
		}
	}

	function handleProfileStatusToggle(profile: RoleProfileDto) {
		void updateProfileStatus(profile, !profile.isActive);
	}

	const queryError = profilesQuery.isError
		? t(Messages.roleProfiles.loadFailed)
		: permissionsQuery.isError
			? t(Messages.roleProfiles.permissionLoadFailed)
			: "";

	if (mode !== "list") {
		if (
			permissionsQuery.isPending ||
			(mode === "edit" && profilesQuery.isPending)
		) {
			return (
				<p className="text-sm text-muted-foreground">
					{t(Messages.common.loadingResource, {
						resource: t(Messages.roleProfiles.pageTitle),
					})}
				</p>
			);
		}
		if (
			permissionsQuery.isError ||
			(mode === "edit" && profilesQuery.isError)
		) {
			return (
				<div className="grid gap-4">
					<p role="alert" className="text-sm text-destructive">
						{queryError}
					</p>
					<Button
						variant="outline"
						onClick={() => router.push("/dashboard/roles")}
					>
						{t(Messages.common.actions.cancel)}
					</Button>
				</div>
			);
		}
		if (mode === "edit" && (!editingProfile || editingProfile.isSystem)) {
			return (
				<div className="grid gap-4">
					<p role="alert" className="text-sm text-destructive">
						{t(
							editingProfile?.isSystem
								? Messages.roleProfiles.systemProfileReadOnly
								: Messages.roleProfiles.profileNotFound,
						)}
					</p>
					<Button
						variant="outline"
						onClick={() => router.push("/dashboard/roles")}
					>
						{t(Messages.roleProfiles.backToProfiles)}
					</Button>
				</div>
			);
		}
		return (
			<RoleProfileWizard
				key={editingProfile?.id ?? "new"}
				profile={editingProfile ?? null}
				permissions={permissions}
				isSaving={isSaving}
				error={editorError}
				onSave={saveProfile}
				onCancel={() => router.push("/dashboard/roles")}
			/>
		);
	}

	return (
		<>
			<PageHeader
				title={t(Messages.roleProfiles.pageTitle)}
				description={t(Messages.roleProfiles.description)}
			>
				<Button
					onClick={() => router.push("/dashboard/roles/new")}
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
				<Card className="min-h-40 items-center justify-center gap-4 px-8 py-8 text-center">
					<ShieldCheckIcon className="size-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						{t(Messages.roleProfiles.noProfiles)}
					</p>
				</Card>
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
										disabled={updateMutation.isPending}
										onToggle={() => handleProfileStatusToggle(profile)}
									/>
									<ProfileActions
										profile={profile}
										onEdit={() =>
											router.push(`/dashboard/roles/${profile.id}/edit`)
										}
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
													<span className="text-sm font-normal text-muted-foreground">
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
												disabled={updateMutation.isPending}
												onToggle={() => handleProfileStatusToggle(profile)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex justify-end">
												<ProfileActions
													profile={profile}
													onEdit={() =>
														router.push(`/dashboard/roles/${profile.id}/edit`)
													}
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
		</>
	);
}
