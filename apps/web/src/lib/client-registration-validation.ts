import { isValidCustomerIce } from "@ecommand/shared";

export type RegistrationIdentityField =
	| "firstName"
	| "lastName"
	| "customerCode"
	| "ice";

export type RegistrationIdentityErrors = Partial<
	Record<RegistrationIdentityField, "required" | "format">
>;

export function validateRegistrationIdentity(values: {
	firstName: string;
	lastName: string;
	customerCode: string;
	ice: string;
}): RegistrationIdentityErrors {
	const errors: RegistrationIdentityErrors = {};
	if (!values.firstName.trim()) errors.firstName = "required";
	if (!values.lastName.trim()) errors.lastName = "required";
	if (!values.customerCode.trim()) errors.customerCode = "required";
	if (!values.ice.trim()) errors.ice = "required";
	else if (!isValidCustomerIce(values.ice)) errors.ice = "format";
	return errors;
}
