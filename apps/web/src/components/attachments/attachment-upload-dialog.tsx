"use client";

import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
			setError("The file could not be uploaded. Please try again.");
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
						Upload file
					</Button>
				}
			/>

			<DialogContent className="sm:max-w-lg">
				<form className="flex flex-col gap-8" onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Upload attachment</DialogTitle>
						<DialogDescription>
							Add a document or supporting file.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-8">
						<div className="flex flex-col gap-4">
							<Label htmlFor="attachment-file">File</Label>

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

									<p className="text-xs text-muted-foreground">
										{formatFileSize(file.size)}
									</p>
								</div>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									disabled={isUploading}
									onClick={clearFile}
								>
									<XIcon className="size-4" />
									<span className="sr-only">Remove selected file</span>
								</Button>
							</div>
						)}

						<div className="flex flex-col gap-4">
							<Label htmlFor="attachment-description">
								Description (optional)
							</Label>

							<Input
								id="attachment-description"
								value={description}
								placeholder="Describe this attachment"
								disabled={isUploading}
								onChange={(event) => setDescription(event.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isUploading}
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>

						<Button type="submit" disabled={!file || isUploading}>
							<UploadIcon className="size-4" />
							{isUploading ? "Uploading..." : "Upload"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
