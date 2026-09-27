"use client";

import { useState } from "react";
import { getFormStepErrors, omitFormStepError } from "@/lib/form-utils";

type FormStepIssue = {
	path: readonly unknown[];
	message: string;
};

type StepValidationResult =
	| { success: true }
	| { success: false; error: { issues: readonly FormStepIssue[] } };

export function useGuidedFormState() {
	const [step, setStep] = useState(0);
	const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

	function advanceIfValid(result: StepValidationResult) {
		if (!result.success) {
			setStepErrors(getFormStepErrors(result.error.issues));
			return false;
		}

		setStepErrors({});
		setStep((currentStep) => currentStep + 1);
		return true;
	}

	function clearFieldError(fieldName: string) {
		setStepErrors((errors) => omitFormStepError(errors, fieldName));
	}

	return { step, setStep, stepErrors, advanceIfValid, clearFieldError };
}
