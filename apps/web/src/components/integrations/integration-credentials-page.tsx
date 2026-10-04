"use client";

import {
	INTEGRATION_CREDENTIAL_PERMISSIONS,
	Permission,
} from "@ecommand/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BanIcon,
	CheckIcon,
	CopyIcon,
	KeyRoundIcon,
	RotateCwIcon,
	XIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { TableActionButton } from "@/components/common/table-action-button";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	Table,
	TableBody,
	TableCell,
	TableFrame,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	type IssuedIntegrationCredential,
	integrationCredentialsApi,
} from "@/lib/api/integration-credentials";

const credentialsKey = ["integration-credentials"];
const TRACKING_PERMISSION = Permission.TRACKING_UPDATE;
type CredentialAction = {
	type: "rotate" | "revoke";
	id: number;
	name: string;
};

export function IntegrationCredentialsPage() {
	const t = useTranslate();
	const locale = useLocale();
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [name, setName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
		TRACKING_PERMISSION,
	]);
	const [revealed, setRevealed] = useState<IssuedIntegrationCredential | null>(
		null,
	);
	const [copied, setCopied] = useState(false);
	const [actionError, setActionError] = useState(false);
	const [pendingAction, setPendingAction] = useState<CredentialAction | null>(
		null,
	);
	const credentials = useQuery({
		queryKey: credentialsKey,
		queryFn: integrationCredentialsApi.list,
	});
	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: credentialsKey });
	const create = useMutation({
		mutationFn: () =>
			integrationCredentialsApi.create(name.trim(), selectedPermissions),
		onSuccess: async (credential) => {
			setRevealed(credential);
			setName("");
			setSelectedPermissions([...INTEGRATION_CREDENTIAL_PERMISSIONS]);
			setCreateOpen(false);
			setActionError(false);
			await refresh();
		},
	});
	const rotate = useMutation({
		mutationFn: integrationCredentialsApi.rotate,
		onSuccess: async (credential) => {
			setRevealed(credential);
			setActionError(false);
			await refresh();
		},
		onError: () => setActionError(true),
	});
	const revoke = useMutation({
		mutationFn: integrationCredentialsApi.revoke,
		onSuccess: refresh,
		onError: () => setActionError(true),
	});

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (name.trim() && selectedPermissions.length > 0) create.mutate();
	}

	async function copySecret() {
		if (!revealed) return;
		await navigator.clipboard.writeText(revealed.secret);
		setCopied(true);
	}

	function closeCreate(open: boolean) {
		setCreateOpen(open);
		if (open) create.reset();
	}

	return (
		<div className="workspace-page">
			<PageHeader
				title={t(Messages.integrationCredentials.pageTitle)}
				description={t(Messages.integrationCredentials.description)}
			>
				<Button type="button" onClick={() => closeCreate(true)}>
					<KeyRoundIcon aria-hidden="true" />
					{t(Messages.integrationCredentials.create)}
				</Button>
			</PageHeader>

			{revealed && (
				<Card aria-live="polite">
					<CardHeader className="flex flex-row items-start justify-between gap-4">
						<div className="grid gap-1">
							<CardTitle>
								{t(Messages.integrationCredentials.created)}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								{t(Messages.integrationCredentials.secretOnce)}
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={t(Messages.common.dialog.close)}
							onClick={() => {
								setRevealed(null);
								setCopied(false);
							}}
						>
							<XIcon aria-hidden="true" />
						</Button>
					</CardHeader>
					<CardContent className="grid gap-3">
						<code className="block overflow-x-auto rounded-md border bg-muted p-3 text-sm">
							{revealed.secret}
						</code>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap gap-1.5">
								{revealed.permissions.map((permission) => (
									<Badge key={permission} variant="secondary">
										{permissionLabel(permission, t)}
									</Badge>
								))}
							</div>
							<Button type="button" variant="outline" onClick={copySecret}>
								{copied ? (
									<CheckIcon aria-hidden="true" />
								) : (
									<CopyIcon aria-hidden="true" />
								)}
								{copied
									? t(Messages.integrationCredentials.copied)
									: t(Messages.integrationCredentials.copy)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{actionError && (
				<p role="alert" className="text-sm text-destructive">
					{t(Messages.integrationCredentials.requestFailed)}
				</p>
			)}

			<section aria-label={t(Messages.integrationCredentials.pageTitle)}>
				<TableFrame className="overflow-hidden">
					<Table className="min-w-[60rem]">
						<TableHeader>
							<TableRow>
								<TableHead>
									{t(Messages.integrationCredentials.integrationColumn)}
								</TableHead>
								<TableHead>
									{t(Messages.integrationCredentials.keyColumn)}
								</TableHead>
								<TableHead>
									{t(Messages.integrationCredentials.permissionsColumn)}
								</TableHead>
								<TableHead>
									{t(Messages.integrationCredentials.lastUsedColumn)}
								</TableHead>
								<TableHead className="w-28 text-right">
									{t(Messages.integrationCredentials.statusColumn)}
								</TableHead>
								<TableHead className="w-32 text-right">
									{t(Messages.integrationCredentials.actionsColumn)}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{credentials.isLoading && (
								<TableEmptyStateRow
									colSpan={6}
									message={t(Messages.integrationCredentials.loading)}
								/>
							)}
							{credentials.isError && (
								<TableEmptyStateRow
									colSpan={6}
									message={t(Messages.integrationCredentials.requestFailed)}
									action={
										<Button
											type="button"
											variant="outline"
											onClick={() => credentials.refetch()}
										>
											{t(Messages.common.actions.retry)}
										</Button>
									}
								/>
							)}
							{credentials.data?.length === 0 && (
								<TableEmptyStateRow
									colSpan={6}
									message={t(Messages.integrationCredentials.empty)}
									action={
										<Button type="button" onClick={() => closeCreate(true)}>
											{t(Messages.integrationCredentials.create)}
										</Button>
									}
								/>
							)}
							{credentials.data?.map((credential) => {
								const disabled = Boolean(credential.revokedAt);
								return (
									<TableRow key={credential.id}>
										<TableCell className="font-medium">
											{credential.name}
										</TableCell>
										<TableCell>
											<code className="font-mono text-xs text-muted-foreground">
												{credential.keyId}
											</code>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1.5">
												{credential.permissions.map((permission) => (
													<Badge key={permission} variant="secondary">
														{permissionLabel(permission, t)}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{credential.lastUsedAt
												? new Date(credential.lastUsedAt).toLocaleString(locale)
												: t(Messages.integrationCredentials.neverUsed)}
										</TableCell>
										<TableCell className="text-right">
											<Badge variant={disabled ? "secondary" : "outline"}>
												{t(
													disabled
														? Messages.integrationCredentials.revoked
														: Messages.integrationCredentials.active,
												)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												{!disabled && (
													<TableActionButton
														icon={RotateCwIcon}
														label={t(Messages.integrationCredentials.rotate)}
														disabled={rotate.isPending}
														onClick={() =>
															setPendingAction({
																type: "rotate",
																id: credential.id,
																name: credential.name,
															})
														}
													/>
												)}
												{!disabled && (
													<TableActionButton
														icon={BanIcon}
														label={t(Messages.integrationCredentials.revoke)}
														disabled={revoke.isPending}
														onClick={() =>
															setPendingAction({
																type: "revoke",
																id: credential.id,
																name: credential.name,
															})
														}
													/>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableFrame>
			</section>

			<ConfirmDialog
				open={pendingAction !== null}
				onOpenChange={(open) => {
					if (!open) setPendingAction(null);
				}}
				title={
					pendingAction?.type === "rotate"
						? t(Messages.integrationCredentials.rotateConfirmTitle)
						: t(Messages.integrationCredentials.revokeConfirmTitle)
				}
				description={
					pendingAction?.type === "rotate"
						? t(Messages.integrationCredentials.rotationConfirm, {
								name: pendingAction.name,
							})
						: t(Messages.integrationCredentials.revokeConfirm, {
								name: pendingAction?.name ?? "",
							})
				}
				confirmLabel={
					pendingAction?.type === "rotate"
						? t(Messages.integrationCredentials.rotate)
						: t(Messages.integrationCredentials.revoke)
				}
				variant={pendingAction?.type === "revoke" ? "destructive" : "default"}
				disabled={rotate.isPending || revoke.isPending}
				onConfirm={() => {
					if (!pendingAction) return;
					const action = pendingAction;
					setPendingAction(null);
					if (action.type === "rotate") rotate.mutate(action.id);
					else revoke.mutate(action.id);
				}}
			/>

			<Dialog open={createOpen} onOpenChange={closeCreate}>
				<DialogContent size="content" className="gap-0 overflow-hidden p-0">
					<DialogHeader className="mx-6 mt-6">
						<DialogTitle>
							{t(Messages.integrationCredentials.createTitle)}
						</DialogTitle>
						<DialogDescription>
							{t(Messages.integrationCredentials.permission)}
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="grid gap-5 px-6 py-4">
						<form
							id="create-integration-credential"
							onSubmit={submit}
							className="grid gap-5"
						>
							<div className="oncf-field">
								<Label htmlFor="integration-name">
									{t(Messages.integrationCredentials.name)}
								</Label>
								<Input
									id="integration-name"
									value={name}
									maxLength={100}
									onChange={(event) => setName(event.target.value)}
									required
								/>
							</div>
							<fieldset className="grid gap-3">
								<legend className="font-medium">
									{t(Messages.integrationCredentials.permissionsTitle)}
								</legend>
								<p className="text-sm text-muted-foreground">
									{t(Messages.integrationCredentials.permissionsHint)}
								</p>
								{INTEGRATION_CREDENTIAL_PERMISSIONS.map((permission) => (
									<div
										key={permission}
										className="flex min-h-11 items-start gap-3 rounded-md border p-3"
									>
										<Checkbox
											id={`integration-permission-${permission.replace(/[^a-z0-9]+/gi, "-")}`}
											checked={selectedPermissions.includes(permission)}
											onCheckedChange={(checked) =>
												setSelectedPermissions((current) =>
													checked
														? [...new Set([...current, permission])]
														: current.filter((item) => item !== permission),
												)
											}
										/>
										<div className="grid gap-1">
											<Label
												htmlFor={`integration-permission-${permission.replace(/[^a-z0-9]+/gi, "-")}`}
												className="cursor-pointer"
											>
												{permissionLabel(permission, t)}
											</Label>
											<p className="text-sm text-muted-foreground">
												{t(
													Messages.integrationCredentials
														.trackingPermissionDescription,
												)}
											</p>
											<code className="text-xs text-muted-foreground">
												{permission}
											</code>
										</div>
									</div>
								))}
							</fieldset>
							{selectedPermissions.length === 0 && (
								<p className="text-sm text-muted-foreground" role="status">
									{t(Messages.integrationCredentials.noPermissions)}
								</p>
							)}
							{create.isError && (
								<p className="text-sm text-destructive" role="alert">
									{t(Messages.integrationCredentials.requestFailed)}
								</p>
							)}
						</form>
					</DialogBody>
					<DialogFooter className="mx-6 mb-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreateOpen(false)}
							disabled={create.isPending}
						>
							{t(Messages.common.actions.cancel)}
						</Button>
						<Button
							form="create-integration-credential"
							type="submit"
							disabled={
								create.isPending ||
								!name.trim() ||
								selectedPermissions.length === 0
							}
						>
							<KeyRoundIcon aria-hidden="true" />
							{t(Messages.integrationCredentials.create)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function permissionLabel(
	permission: string,
	t: ReturnType<typeof useTranslate>,
) {
	if (permission === Permission.TRACKING_UPDATE) {
		return t(Messages.integrationCredentials.trackingPermission);
	}
	return permission;
}
