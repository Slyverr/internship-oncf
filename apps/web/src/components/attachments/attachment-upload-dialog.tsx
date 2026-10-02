"use client";

import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { formatFileSize } from "@/lib/format-file-size";

export interface AttachmentUploadInput {
	file: File;
	description?: string;
}

interface AttachmentUploadDialogProps {
	onUpload: (input: AttachmentUploadInput) => Promise<void>;
}

export function AttachmentUploadDialog({
	onUpload,
}: AttachmentUploadDialogProps) {
	const t = useTranslate();
	const locale = useLocale();
	const inputRef = useRef<HTMLInputElement>(null);

	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [description, setDescription] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearFile = () => {
		setFile(null);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const reset = () => {
		clearFile();
		setDescription("");
		setError(null);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (isUploading) {
			return;
		}

		setOpen(nextOpen);

		if (!nextOpen) {
			reset();
		}
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFile(event.target.files?.[0] ?? null);
		setError(null);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!file) {
			return;
		}

		setIsUploading(true);
		setError(null);

		try {
			const trimmedDescription = description.trim();

			await onUpload({
				file,
				description: trimmedDescription || undefined,
			});

			reset();
			setOpen(false);
		} catch {
			setError(t(Messages.attachments.uploadFailed));
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button size="sm">
						<UploadIcon className="size-4" />
						{t(Messages.attachments.uploadFile)}
					</Button>
				}
			/>

			<DialogContent
				size="form"
				className="min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-6"
			>
				<DialogHeader>
					<DialogTitle>{t(Messages.attachments.uploadTitle)}</DialogTitle>
					<DialogDescription>
						{t(Messages.attachments.uploadDescription)}
					</DialogDescription>
				</DialogHeader>
				<form className="contents" onSubmit={handleSubmit}>
					<DialogBody className="grid content-start gap-8 overflow-y-auto overscroll-contain">
						<div className="flex flex-col gap-4">
							<Label htmlFor="attachment-file">
								{t(Messages.attachments.file)}
							</Label>

							<Input
								ref={inputRef}
								id="attachment-file"
								type="file"
								disabled={isUploading}
								onChange={handleFileChange}
							/>
						</div>

						{file && (
							<div className="flex items-center gap-4 rounded-md border bg-muted p-4">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-background">
									<FileIcon className="size-4 text-muted-foreground" />
								</div>

								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{file.name}</p>

									<p className="text-meta text-muted-foreground">
										{formatFileSize(file.size, locale)}
									</p>
								</div>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-11 shrink-0"
									disabled={isUploading}
									onClick={clearFile}
								>
									<XIcon className="size-4" />
									<span className="sr-only">
										{t(Messages.attachments.removeSelectedFile)}
									</span>
								</Button>
							</div>
						)}

						<div className="flex flex-col gap-4">
							<Label htmlFor="attachment-description">
								{t(Messages.attachments.descriptionOptional)}
							</Label>

							<Input
								id="attachment-description"
								value={description}
								placeholder={t(Messages.attachments.descriptionPlaceholder)}
								disabled={isUploading}
								onChange={(event) => setDescription(event.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}
					</DialogBody>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isUploading}
							onClick={() => handleOpenChange(false)}
						>
							{t(Messages.attachments.cancel)}
						</Button>

						<Button type="submit" disabled={!file || isUploading}>
							<UploadIcon className="size-4" />
							{t(
								isUploading
									? Messages.attachments.uploading
									: Messages.attachments.upload,
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
