export const CUSTOMER_ICE_LENGTH = 15;
export const CUSTOMER_ICE_PATTERN = new RegExp(`^\\d{${CUSTOMER_ICE_LENGTH}}$`);

export function isValidCustomerIce(value: string): boolean {
	return CUSTOMER_ICE_PATTERN.test(value);
}
