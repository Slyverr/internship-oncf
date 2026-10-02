"use client";

"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export type GuidedFormStep = {
	title: string;
	description: string;
};

export function GuidedFormProgress({
	steps,
	currentStep,
}: {
	steps: GuidedFormStep[];
	currentStep: number;
}) {
	const t = useTranslate();
	const current = steps[currentStep];
	const progress =
		steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

	return (
		<div className="grid gap-3">
			<p className="sr-only" aria-live="polite" aria-atomic="true">
				{t(Messages.common.formSteps.stepOf, {
					current: currentStep + 1,
					total: steps.length,
					title: current?.title ?? "",
				})}
			</p>
			<div className="relative">
				<div
					aria-hidden="true"
					className="absolute top-4 h-0.5 bg-muted"
					style={{
						left: `${50 / steps.length}%`,
						right: `${50 / steps.length}%`,
					}}
				>
					<span
						className="block h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<ol
					aria-label={t(Messages.common.formSteps.ariaLabel)}
					className="relative flex w-full items-start justify-between"
				>
					{steps.map((step, index) => (
						<li
							key={step.title}
							aria-current={currentStep === index ? "step" : undefined}
							className="z-0 flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
						>
							<span
								aria-hidden="true"
								className={
									"flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors " +
									(currentStep === index
										? "border-primary bg-primary text-primary-foreground"
										: currentStep > index
											? "border-primary bg-card text-primary"
											: "border-border bg-card text-muted-foreground")
								}
							>
								{currentStep > index ? <Check className="size-4" /> : index + 1}
							</span>
							<span
								className={
									"max-w-full px-2 text-sm leading-5 " +
									(currentStep === index
										? "font-semibold text-foreground"
										: "text-muted-foreground")
								}
							>
								{step.title}
							</span>
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}
export function GuidedFormActions({
	currentStep,
	stepCount,
	onCancel,
	onPrevious,
	onContinue,
	submitLabel,
	pendingLabel,
	isSubmitting,
	isPending,
	isSubmitDisabled = false,
}: {
	currentStep: number;
	stepCount: number;
	onCancel: () => void;
	onPrevious: () => void;
	onContinue: () => void;
	submitLabel: string;
	pendingLabel: string;
	isSubmitting: boolean;
	isPending: boolean;
	isSubmitDisabled?: boolean;
}) {
	const t = useTranslate();
	const isLastStep = currentStep === stepCount - 1;
	const isBusy = isPending || isSubmitting;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<Button
				type="button"
				variant="outline"
				className="w-full sm:w-auto"
				disabled={isBusy}
				onClick={onCancel}
			>
				{t(Messages.common.actions.cancel)}
			</Button>
			<div className="grid w-full grid-cols-[auto_1fr] gap-4 sm:ml-auto sm:flex sm:w-auto sm:justify-end">
				{currentStep > 0 ? (
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						disabled={isBusy}
						onClick={onPrevious}
					>
						<ArrowLeft />
						{t(Messages.common.actions.back)}
					</Button>
				) : null}
				{isLastStep ? (
					<Button
						type="submit"
						className={
							currentStep === 0
								? "col-span-2 w-full sm:col-span-1 sm:w-auto"
								: "w-full sm:w-auto"
						}
						disabled={isBusy || isSubmitDisabled}
					>
						{isPending || isSubmitting ? pendingLabel : submitLabel}
					</Button>
				) : (
					<Button
						type="button"
						className={
							currentStep === 0
								? "col-span-2 w-full sm:col-span-1 sm:w-auto"
								: "w-full sm:w-auto"
						}
						disabled={isBusy}
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onContinue();
						}}
					>
						{t(Messages.common.actions.continue)}
						<ArrowRight />
					</Button>
				)}
			</div>
		</div>
	);
}
