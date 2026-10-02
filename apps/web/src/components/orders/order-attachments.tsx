"use client";

import { Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { AttachmentList } from "@/components/attachments/attachment-list";
import {
	AttachmentUploadDialog,
	type AttachmentUploadInput,
} from "@/components/attachments/attachment-upload-dialog";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import {
	getFilesControllerListFilesQueryKey,
	useFilesControllerDeleteFile,
	useFilesControllerListFiles,
} from "@/lib/api/files";
import type { FileDto } from "@/lib/api/generated.schemas";
import { customFetch } from "@/lib/axios";
import { useAuth } from "@/providers/auth-provider";

interface OrderAttachmentsProps {
	orderNumber: string;
}

export function OrderAttachments({ orderNumber }: OrderAttachmentsProps) {
	const t = useTranslate();
	const queryClient = useQueryClient();
	const { hasPermission } = useAuth();

	const { data: files, isLoading } = useFilesControllerListFiles(orderNumber);

	const deleteMutation = useFilesControllerDeleteFile();

	const canManage = hasPermission(Permission.ORDERS_UPDATE);

	const invalidateFiles = () =>
		queryClient.invalidateQueries({
			queryKey: getFilesControllerListFilesQueryKey(orderNumber),
		});

	const handleUpload = async ({ file, description }: AttachmentUploadInput) => {
		const formData = new FormData();

		formData.append("file", file);

		if (description) {
			formData.append("description", description);
		}

		await customFetch({
			url: `/orders/${orderNumber}/files`,
			method: "POST",
			data: formData,
		});

		await invalidateFiles();
	};

	const handleDownload = async (file: FileDto) => {
		const blob = await customFetch<Blob>({
			url: `/orders/${orderNumber}/files/${file.id}/download`,
			method: "GET",
			responseType: "blob",
		});

		const url = window.URL.createObjectURL(blob);
		const anchor = document.createElement("a");

		anchor.href = url;
		anchor.download = file.fileName;

		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();

		window.setTimeout(() => {
			window.URL.revokeObjectURL(url);
		}, 0);
	};

	const handleDelete = async (file: FileDto) => {
		await deleteMutation.mutateAsync({
			id: orderNumber,
			fileId: file.id,
		});

		await invalidateFiles();
	};

	return (
		<AttachmentList
			files={files}
			isLoading={isLoading}
			canDelete={canManage}
			description={t(Messages.orders.attachments)}
			uploadAction={
				canManage ? (
					<AttachmentUploadDialog onUpload={handleUpload} />
				) : undefined
			}
			onDownload={handleDownload}
			onDelete={canManage ? handleDelete : undefined}
		/>
	);
}
