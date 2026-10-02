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
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogBody className="flex items-center">
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogBody>

				<AlertDialogFooter>
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
