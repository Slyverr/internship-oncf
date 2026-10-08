"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, EyeIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { TableActionButton } from "@/components/common/table-action-button";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	dtmOperationsControllerList,
	dtmOperationsControllerResolve,
	getDtmOperationsControllerListQueryKey,
} from "@/lib/api/dtm-operations";
import type {
	DtmRequestDto,
	DtmRequestDtoStatus,
	ResolveDtmRequestDtoResult,
} from "@/lib/api/generated.schemas";
import { formatDisplayDateTime } from "@/lib/date-utils";

const requestsKey = getDtmOperationsControllerListQueryKey();
type DtmRequest = DtmRequestDto;
type DtmSimulationResult = ResolveDtmRequestDtoResult;

type PendingResolution = {
	requestId: number;
	result: DtmSimulationResult;
};

function getResponseValue(
	request: DtmRequest,
	key: "status" | "source",
): string | null {
	if (!request.responsePayload) return null;
	try {
		const payload = JSON.parse(request.responsePayload) as Record<
			string,
			unknown
		>;
		const value = payload[key];
		return typeof value === "string" ? value : null;
	} catch {
		return null;
	}
}

function formatPayload(payload: string | null) {
	if (!payload) return null;
	try {
		return JSON.stringify(JSON.parse(payload), null, 2);
	} catch {
		return payload;
	}
}

function statusVariant(status: DtmRequestDtoStatus) {
	if (status === "SUCCESS") return "secondary" as const;
	if (status === "FAILED" || status === "TIMEOUT")
		return "destructive" as const;
	return "outline" as const;
}

export function DtmActivityPage() {
	const t = useTranslate();
	const locale = useLocale();
	const queryClient = useQueryClient();
	const [pendingResolution, setPendingResolution] =
		useState<PendingResolution | null>(null);
	const [selectedRequest, setSelectedRequest] = useState<DtmRequest | null>(
		null,
	);
	const [actionFailed, setActionFailed] = useState(false);
	const activity = useQuery({
		queryKey: requestsKey,
		queryFn: dtmOperationsControllerList,
		refetchInterval: (query) =>
			query.state.data?.mode === "SIMULATOR" &&
			query.state.data.requests.some((request) => request.status === "PENDING")
				? 1_000
				: false,
	});
	const resolveRequest = useMutation({
		mutationFn: ({ requestId, result }: PendingResolution) =>
			dtmOperationsControllerResolve(requestId, { result }),
		onSuccess: async () => {
			setPendingResolution(null);
			setActionFailed(false);
			await queryClient.invalidateQueries({ queryKey: requestsKey });
		},
		onError: () => setActionFailed(true),
	});

	const data = activity.data;
	const requests = data?.requests ?? [];
	const pendingCount = requests.filter(
		(request) => request.status === "PENDING",
	).length;
	const resolvedCount = requests.filter(
		(request) => request.status !== "PENDING",
	).length;
	const confirmationIsAccept = pendingResolution?.result === "ACCEPTED";

	function requestStatusLabel(status: DtmRequestDtoStatus) {
		if (status === "SUCCESS") return t(Messages.dtmActivity.success);
		if (status === "FAILED") return t(Messages.dtmActivity.failed);
		if (status === "TIMEOUT") return t(Messages.dtmActivity.timeout);
		return t(Messages.dtmActivity.pending);
	}

	function relatedRecordLabel(request: DtmRequest) {
		if (request.relatedEntityType === "orders") {
			return `Order #${request.relatedEntityId}`;
		}
		if (request.relatedEntityType === "forecast_programs") {
			return `Forecast program #${request.relatedEntityId}`;
		}
		return request.relatedEntityType ?? "—";
	}

	return (
		<div className="workspace-page">
			<PageHeader
				title={t(Messages.dtmActivity.pageTitle)}
				description={t(Messages.dtmActivity.description)}
			>
				<Button
					type="button"
					variant="outline"
					disabled={activity.isFetching}
					onClick={() => void activity.refetch()}
				>
					<RefreshCwIcon aria-hidden="true" />
					{t(Messages.dtmActivity.refresh)}
				</Button>
			</PageHeader>

			<div className="grid gap-4 @5xl/workspace:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-start justify-between gap-4">
						<div className="grid gap-1">
							<CardTitle>{t(Messages.dtmActivity.mode)}</CardTitle>
							<p className="text-sm text-muted-foreground">
								{data?.mode === "SIMULATOR"
									? data.responseMode === "AUTO"
										? t(Messages.dtmActivity.autoResponseDescription)
										: t(Messages.dtmActivity.manualResponseDescription)
									: data?.mode === "DISABLED"
										? t(Messages.dtmActivity.disabledDescription)
										: t(Messages.dtmActivity.loading)}
							</p>
							{data?.mode === "SIMULATOR" && (
								<p className="text-xs text-muted-foreground">
									{t(Messages.dtmActivity.simulatorDescription)}
								</p>
							)}
						</div>
						<Badge
							variant={data?.mode === "SIMULATOR" ? "secondary" : "outline"}
						>
							{data?.mode === "SIMULATOR"
								? t(Messages.dtmActivity.simulatorMode)
								: data?.mode === "DISABLED"
									? t(Messages.dtmActivity.disabledMode)
									: t(Messages.dtmActivity.loading)}
						</Badge>
					</CardHeader>
					{data?.mode === "SIMULATOR" && (
						<div className="px-6 pb-4">
							<Badge variant="outline">
								{data.responseMode === "AUTO"
									? t(Messages.dtmActivity.autoResponseMode)
									: t(Messages.dtmActivity.manualResponseMode)}
							</Badge>
						</div>
					)}
				</Card>
				<Card>
					<CardHeader className="grid gap-1">
						<CardTitle>{t(Messages.dtmActivity.pending)}</CardTitle>
						<p className="text-2xl font-semibold tabular-nums">
							{pendingCount}
						</p>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="grid gap-1">
						<CardTitle>{t(Messages.dtmActivity.responsesRecorded)}</CardTitle>
						<p className="text-2xl font-semibold tabular-nums">
							{resolvedCount}
						</p>
					</CardHeader>
				</Card>
			</div>

			{activity.isError && (
				<p role="alert" className="text-sm text-destructive">
					{t(Messages.dtmActivity.loadFailed)}
				</p>
			)}
			{actionFailed && (
				<p role="alert" className="text-sm text-destructive">
					{t(Messages.dtmActivity.actionFailed)}
				</p>
			)}

			<section aria-label={t(Messages.dtmActivity.recentRequests)}>
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-lg font-semibold">
						{t(Messages.dtmActivity.recentRequests)}
					</h2>
					<p className="text-sm text-muted-foreground">
						{t(Messages.dtmActivity.latestLimit)}
					</p>
				</div>
				<TableFrame className="overflow-hidden">
					<Table className="min-w-[72rem]">
						<TableHeader>
							<TableRow>
								<TableHead>{t(Messages.dtmActivity.requestId)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.requestType)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.relatedRecord)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.requestedAt)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.status)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.response)}</TableHead>
								<TableHead>{t(Messages.dtmActivity.duration)}</TableHead>
								<TableHead className="w-32 text-right">
									{t(Messages.dtmActivity.actions)}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{activity.isPending ? (
								<TableEmptyStateRow
									colSpan={8}
									message={t(Messages.dtmActivity.loading)}
								/>
							) : requests.length === 0 ? (
								<TableEmptyStateRow
									colSpan={8}
									message={t(Messages.dtmActivity.requestNotSent)}
									description={t(
										Messages.dtmActivity.requestNotSentDescription,
									)}
								/>
							) : (
								requests.map((request) => {
									const responseStatus = getResponseValue(request, "status");
									const responseSource = getResponseValue(request, "source");
									return (
										<TableRow key={request.id}>
											<TableCell className="font-mono text-xs">
												#{request.id}
											</TableCell>
											<TableCell>{request.requestType}</TableCell>
											<TableCell>{relatedRecordLabel(request)}</TableCell>
											<TableCell className="whitespace-nowrap">
												{formatDisplayDateTime(request.createdAt, locale)}
											</TableCell>
											<TableCell>
												<Badge variant={statusVariant(request.status)}>
													{requestStatusLabel(request.status)}
												</Badge>
											</TableCell>
											<TableCell>
												{responseStatus ? (
													<span className="inline-flex flex-wrap items-center gap-1">
														<span>{responseStatus}</span>
														{responseSource === "MANUAL_SIMULATOR" && (
															<Badge variant="outline">
																{t(Messages.dtmActivity.simulatorMode)}
															</Badge>
														)}
													</span>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell className="whitespace-nowrap">
												{request.durationMs === null
													? "—"
													: `${request.durationMs} ${t(Messages.dtmActivity.milliseconds)}`}
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-1">
													<TableActionButton
														icon={EyeIcon}
														label={t(Messages.dtmActivity.viewDetails)}
														onClick={() => setSelectedRequest(request)}
													/>
													{data?.mode === "SIMULATOR" &&
														request.status === "PENDING" && (
															<>
																<TableActionButton
																	icon={CheckIcon}
																	label={t(
																		Messages.dtmActivity.resolveAccepted,
																	)}
																	onClick={() =>
																		setPendingResolution({
																			requestId: request.id,
																			result: "ACCEPTED",
																		})
																	}
																/>
																<TableActionButton
																	icon={XIcon}
																	label={t(
																		Messages.dtmActivity.resolveRejected,
																	)}
																	onClick={() =>
																		setPendingResolution({
																			requestId: request.id,
																			result: "REJECTED",
																		})
																	}
																/>
															</>
														)}
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableFrame>
			</section>

			<ConfirmDialog
				open={pendingResolution !== null}
				onOpenChange={(open) => !open && setPendingResolution(null)}
				title={
					confirmationIsAccept
						? t(Messages.dtmActivity.acceptTitle)
						: t(Messages.dtmActivity.rejectTitle)
				}
				description={
					confirmationIsAccept
						? t(Messages.dtmActivity.acceptDescription, {
								id: pendingResolution?.requestId ?? "",
							})
						: t(Messages.dtmActivity.rejectDescription, {
								id: pendingResolution?.requestId ?? "",
							})
				}
				confirmLabel={
					confirmationIsAccept
						? t(Messages.dtmActivity.confirmAccepted)
						: t(Messages.dtmActivity.confirmRejected)
				}
				variant={confirmationIsAccept ? "default" : "destructive"}
				disabled={resolveRequest.isPending}
				onConfirm={() => {
					if (pendingResolution) resolveRequest.mutate(pendingResolution);
				}}
			/>

			<Dialog
				open={selectedRequest !== null}
				onOpenChange={(open) => !open && setSelectedRequest(null)}
			>
				<DialogContent
					size="content"
					className="max-h-[min(80svh,48rem)] overflow-y-auto"
				>
					<DialogHeader>
						<DialogTitle>
							{t(Messages.dtmActivity.requestDetails)}
							{selectedRequest && ` #${selectedRequest.id}`}
						</DialogTitle>
						<DialogDescription>
							{selectedRequest?.requestType ?? ""}
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="grid gap-4">
						{selectedRequest?.errorMessage && (
							<div className="grid gap-1">
								<h3 className="text-sm font-medium">
									{t(Messages.dtmActivity.error)}
								</h3>
								<p className="text-sm text-destructive">
									{selectedRequest.errorMessage}
								</p>
							</div>
						)}
						{(
							[
								[
									Messages.dtmActivity.requestPayload,
									formatPayload(selectedRequest?.requestPayload ?? null),
								],
								[
									Messages.dtmActivity.responsePayload,
									formatPayload(selectedRequest?.responsePayload ?? null),
								],
							] as const
						).map(([label, payload]) => (
							<div key={label} className="grid min-w-0 gap-2">
								<h3 className="text-sm font-medium">{t(label)}</h3>
								<pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs whitespace-pre-wrap wrap-anywhere">
									{payload ?? t(Messages.dtmActivity.noPayload)}
								</pre>
							</div>
						))}
					</DialogBody>
				</DialogContent>
			</Dialog>
		</div>
	);
}
