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
	return (
		<ol
			aria-label="Form steps"
			className="grid max-w-3xl gap-3 sm:grid-flow-col sm:auto-cols-fr"
		>
			{steps.map((step, index) => (
				<li
					key={step.title}
					aria-current={currentStep === index ? "step" : undefined}
					className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
						currentStep === index
							? "border-primary bg-primary/5"
							: currentStep > index
								? "border-primary/30 bg-muted/40"
								: "border-border"
					}`}
				>
					<span
						aria-hidden="true"
						className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
							currentStep >= index
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{currentStep > index ? <Check className="size-4" /> : index + 1}
					</span>
					<span className="grid gap-0.5">
						<span className="text-sm font-medium">{step.title}</span>
						<span className="text-xs text-muted-foreground">
							{step.description}
						</span>
					</span>
				</li>
			))}
		</ol>
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
}) {
	const isLastStep = currentStep === stepCount - 1;

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<Button type="button" variant="outline" onClick={onCancel}>
				Cancel
			</Button>
			<div className="flex items-center gap-2">
				{currentStep > 0 ? (
					<Button type="button" variant="outline" onClick={onPrevious}>
						<ArrowLeft />
						Back
					</Button>
				) : null}
				{isLastStep ? (
					<Button type="submit" disabled={isPending || isSubmitting}>
						{isPending || isSubmitting ? pendingLabel : submitLabel}
					</Button>
				) : (
					<Button type="button" onClick={onContinue}>
						Continue
						<ArrowRight />
					</Button>
				)}
			</div>
		</div>
	);
}
