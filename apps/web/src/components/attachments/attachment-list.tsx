"use client";

import { formatDistanceToNow } from "date-fns";
import {
	DownloadIcon,
	FileIcon,
	FileTextIcon,
	ImageIcon,
	PaperclipIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileDto } from "@/lib/api/generated.schemas";
import { formatFileSize } from "@/lib/format-file-size";

interface AttachmentListProps {
	files?: FileDto[];
	isLoading?: boolean;
	canDelete?: boolean;
	uploadAction?: React.ReactNode;
	description?: string;
	onDownload: (file: FileDto) => Promise<void>;
	onDelete?: (file: FileDto) => Promise<void>;
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
	if (mimeType.startsWith("image/")) {
		return <ImageIcon className="size-4" />;
	}

	if (mimeType === "application/pdf" || mimeType.startsWith("text/")) {
		return <FileTextIcon className="size-4" />;
	}

	return <FileIcon className="size-4" />;
}

function AttachmentItem({
	file,
	canDelete,
	onDownload,
	onDelete,
}: {
	file: FileDto;
	canDelete: boolean;
	onDownload: (file: FileDto) => Promise<void>;
	onDelete?: (file: FileDto) => Promise<void>;
}) {
	const [isDownloading, setIsDownloading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDownload = async () => {
		setIsDownloading(true);

		try {
			await onDownload(file);
		} finally {
			setIsDownloading(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete) {
			return;
		}

		setIsDeleting(true);

		try {
			await onDelete(file);
			setDeleteDialogOpen(false);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<div className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
					<AttachmentIcon mimeType={file.mimeType} />
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-4">
					<p className="truncate text-sm font-medium">{file.fileName}</p>

					<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
						<span>{formatFileSize(file.fileSize)}</span>

						<span>
							{formatDistanceToNow(new Date(file.uploadedAt), {
								addSuffix: true,
							})}
						</span>
					</div>

					{file.description && (
						<p className="truncate text-xs text-muted-foreground">
							{file.description}
						</p>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-4">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8"
						disabled={isDownloading}
						onClick={handleDownload}
					>
						<DownloadIcon className="size-4" />
						<span className="sr-only">Download {file.fileName}</span>
					</Button>

					{canDelete && onDelete && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-8 text-destructive hover:text-destructive"
							disabled={isDeleting}
							onClick={() => setDeleteDialogOpen(true)}
						>
							<Trash2Icon className="size-4" />
							<span className="sr-only">Delete {file.fileName}</span>
						</Button>
					)}
				</div>
			</div>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete attachment?"
				description={`Delete "${file.fileName}"? This action cannot be undone.`}
				confirmLabel="Delete"
				variant="destructive"
				disabled={isDeleting}
				onConfirm={handleDelete}
			/>
		</>
	);
}

function AttachmentListLoading() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<Skeleton className="h-16 w-full" />
			<Skeleton className="h-16 w-full" />
			<Skeleton className="h-16 w-full" />
		</div>
	);
}

function AttachmentListEmpty() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 px-8 py-12 text-center">
			<div className="flex size-12 items-center justify-center rounded-full bg-muted">
				<PaperclipIcon className="size-4 text-muted-foreground" />
			</div>

			<div className="flex max-w-sm flex-col gap-4">
				<p className="text-sm font-medium">No attachments</p>

				<p className="text-sm text-muted-foreground">
					Upload documents or supporting files when needed.
				</p>
			</div>
		</div>
	);
}

export function AttachmentList({
	files,
	isLoading = false,
	canDelete = false,
	uploadAction,
	description = "Documents and files attached to this resource.",
	onDownload,
	onDelete,
}: AttachmentListProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-4">
					<div className="flex items-center gap-4">
						<div className="flex size-8 items-center justify-center rounded-md bg-muted">
							<PaperclipIcon className="size-4 text-muted-foreground" />
						</div>

						<CardTitle>Attachments</CardTitle>

						{!isLoading && (
							<Badge variant="secondary">{files?.length ?? 0}</Badge>
						)}
					</div>

					<CardDescription>{description}</CardDescription>
				</div>

				{uploadAction}
			</CardHeader>

			<CardContent className="p-0">
				{isLoading ? (
					<AttachmentListLoading />
				) : files?.length ? (
					<div className="max-h-96 divide-y overflow-y-auto border-t">
						{files.map((file) => (
							<AttachmentItem
								key={file.id}
								file={file}
								canDelete={canDelete}
								onDownload={onDownload}
								onDelete={onDelete}
							/>
						))}
					</div>
				) : (
					<div className="border-t">
						<AttachmentListEmpty />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
