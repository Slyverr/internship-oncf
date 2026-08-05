export enum ClaimType {
	DELIVERY_DELAY = "Delivery delay",
	DAMAGED_GOODS = "Damaged goods",
	INCORRECT_QUANTITY = "Incorrect quantity",
	NON_COMPLIANT_QUALITY = "Non-compliant quality",
	BILLING_ISSUE = "Billing issue",
	DOCUMENTATION_PROBLEM = "Documentation problem",
	CUSTOMER_SERVICE = "Customer service",
	OTHER = "Other",
}

export enum ClaimStatus {
	NEW = "NEW",
	IN_PROGRESS = "IN_PROGRESS",
	AWAITING_INFO = "AWAITING_INFO",
	IN_TREATMENT = "IN_TREATMENT",
	RESOLVED = "RESOLVED",
	CLOSED = "CLOSED",
	REJECTED = "REJECTED",
	SENT_TO_DTM = "SENT_TO_DTM",
}

export enum RejectionReason {
	INSUFFICIENT_CAPACITY = "Insufficient capacity",
	INCOMPLETE_DOCUMENTATION = "Incomplete documentation",
	INCORRECT_INFORMATION = "Incorrect information",
	UNAUTHORIZED_CUSTOMER = "Unauthorized customer",
	UNAUTHORIZED_GOODS = "Unauthorized goods",
	PAYMENT_ISSUE = "Payment issue",
	OPERATIONAL_CONSTRAINTS = "Operational constraints",
	OTHER = "Other",
}
