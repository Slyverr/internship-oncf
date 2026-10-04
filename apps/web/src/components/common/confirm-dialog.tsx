"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	disabled?: boolean;
	onConfirm: () => void;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel,
	variant = "default",
	disabled = false,
	onConfirm,
}: ConfirmDialogProps) {
	const t = useTranslate();
	const resolvedConfirmLabel =
		confirmLabel ?? t(Messages.common.actions.confirm);
	const resolvedCancelLabel = cancelLabel ?? t(Messages.common.actions.cancel);
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent size="compact">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogBody className="flex w-full min-w-0 items-center">
					<AlertDialogDescription className="min-w-0 flex-1">
						{description}
					</AlertDialogDescription>
				</AlertDialogBody>

				<AlertDialogFooter className="flex-row justify-end gap-control">
					<AlertDialogCancel disabled={disabled}>
						{resolvedCancelLabel}
					</AlertDialogCancel>

					<AlertDialogAction
						disabled={disabled}
						variant={variant}
						onClick={onConfirm}
					>
						{resolvedConfirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
