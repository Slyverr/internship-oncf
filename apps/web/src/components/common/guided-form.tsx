import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

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
	const current = steps[currentStep];
	const progress =
		steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

	return (
		<div className="grid gap-4">
			<p className="sr-only" aria-live="polite" aria-atomic="true">
				Step {currentStep + 1} of {steps.length}: {current?.title}
			</p>
			<div className="grid gap-4 sm:hidden">
				<div className="flex items-baseline justify-between gap-4">
					<p className="text-sm text-muted-foreground">
						Step {currentStep + 1} of {steps.length}
					</p>
					<p className="text-sm font-medium">{current?.title}</p>
				</div>
				<div
					role="progressbar"
					aria-label="Form progress"
					aria-valuemin={0}
					aria-valuemax={steps.length}
					aria-valuenow={currentStep + 1}
					aria-valuetext={
						"Step " +
						(currentStep + 1) +
						" of " +
						steps.length +
						": " +
						current?.title
					}
					className="h-2 overflow-hidden rounded-full bg-muted"
				>
					<span
						className="block h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
			<ol
				aria-label="Form steps"
				className="hidden max-w-3xl gap-4 sm:grid sm:grid-flow-col sm:auto-cols-fr"
			>
				{steps.map((step, index) => (
					<li
						key={step.title}
						aria-current={currentStep === index ? "step" : undefined}
						className={
							"flex items-center gap-4 rounded-lg border p-4 transition-colors " +
							(currentStep === index
								? "border-primary bg-primary/5"
								: currentStep > index
									? "border-primary/30 bg-muted/40"
									: "border-border")
						}
					>
						<span
							aria-hidden="true"
							className={
								"flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold " +
								(currentStep >= index
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground")
							}
						>
							{currentStep > index ? <Check className="size-4" /> : index + 1}
						</span>
						<span className="grid gap-0">
							<span className="text-sm font-medium">{step.title}</span>
							<span className="text-meta text-muted-foreground">
								{step.description}
							</span>
						</span>
					</li>
				))}
			</ol>
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
	const isLastStep = currentStep === stepCount - 1;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<Button
				type="button"
				variant="outline"
				className="w-full sm:w-auto"
				onClick={onCancel}
			>
				Cancel
			</Button>
			<div className="grid w-full grid-cols-[auto_1fr] gap-4 sm:ml-auto sm:flex sm:w-auto sm:justify-end">
				{currentStep > 0 ? (
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={onPrevious}
					>
						<ArrowLeft />
						Back
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
						disabled={isPending || isSubmitting || isSubmitDisabled}
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
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							onContinue();
						}}
					>
						Continue
						<ArrowRight />
					</Button>
				)}
			</div>
		</div>
	);
}
