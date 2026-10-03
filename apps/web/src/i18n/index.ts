import {
	API_CONSTRAINT_ERROR_CODES,
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	API_TRANSPORT_ERROR_CODES,
	API_VALIDATION_RULE_CODES,
	type ApiConstraintErrorCode,
	type ApiErrorCode,
	type ApiResponseCode,
	type ApiValidationRuleCode,
	type AppLocale,
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
} from "@ecommand/shared";
import { Messages } from "./message-keys";
import { en } from "./messages/en";

export type { AppLocale };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES };

export function isAppLocale(value: string | undefined): value is AppLocale {
	return value !== undefined && SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function resolveAppLocale(value: string | undefined): AppLocale {
	return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

type PluralForms = Partial<Record<Intl.LDMLPluralRule | "zero", string>> & {
	other: string;
};
type PluralMessage = { plural: PluralForms };

type MessagePaths<Value> = {
	[Key in keyof Value & string]: Value[Key] extends string
		? Key
		: Value[Key] extends PluralMessage
			? Key
			: `${Key}.${MessagePaths<Value[Key]>}`;
}[keyof Value & string];

export type MessageKey = MessagePaths<typeof en>;
type MessageAtPath<
	Path extends string,
	Value = typeof en,
> = Path extends `${infer Head}.${infer Tail}`
	? Head extends keyof Value
		? MessageAtPath<Tail, Value[Head]>
		: never
	: Path extends keyof Value
		? Value[Path]
		: never;

type MessageText<Value> = Value extends string
	? Value
	: Value extends PluralMessage
		? Value["plural"][keyof Value["plural"]]
		: never;
type PlaceholderNames<Text extends string> =
	Text extends `${string}{${infer Name}}${infer Rest}`
		? Name | PlaceholderNames<Rest>
		: never;
type MessagePlaceholders<Key extends MessageKey> = PlaceholderNames<
	MessageText<MessageAtPath<Key>> & string
>;
export type MessageKeyWithoutPlaceholders = {
	[Key in MessageKey]: [MessagePlaceholders<Key>] extends [never] ? Key : never;
}[MessageKey];
type TranslationValues<Key extends MessageKey> = Key extends MessageKey
	? [MessagePlaceholders<Key>] extends [never]
		? [values?: Record<string, string | number>]
		: [values: Record<MessagePlaceholders<Key>, string | number>]
	: never;
type TranslationArguments<Key extends MessageKey> = [
	...TranslationValues<Key>,
	locale?: AppLocale,
];

export type TypedMessageTranslator = <Key extends MessageKey>(
	key: Key,
	...args: TranslationValues<Key>
) => string;

const catalogs = { en } satisfies Record<AppLocale, typeof en>;

function resolveMessage(
	key: MessageKey,
	values: Record<string, string | number>,
	locale: AppLocale,
): string {
	const resolved = key.split(".").reduce<unknown>((current, part) => {
		if (typeof current !== "object" || current === null) return undefined;
		return (current as Record<string, unknown>)[part];
	}, catalogs[locale]);
	let message: string;
	if (typeof resolved === "string") {
		message = resolved;
	} else if (
		typeof resolved === "object" &&
		resolved !== null &&
		typeof (resolved as PluralMessage).plural === "object" &&
		typeof values.count === "number"
	) {
		const forms = (resolved as PluralMessage).plural;
		const category =
			values.count === 0 && forms.zero
				? "zero"
				: new Intl.PluralRules(locale).select(values.count);
		message = forms[category] ?? forms.other;
	} else {
		return key;
	}
	return message.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		String(values[name] ?? placeholder),
	);
}

export function createTranslator(locale: AppLocale): TypedMessageTranslator {
	return <Key extends MessageKey>(key: Key, ...args: TranslationValues<Key>) =>
		resolveMessage(key, args[0] ?? {}, locale);
}

export function translate<Key extends MessageKey>(
	key: Key,
	...args: TranslationArguments<Key>
): string;
export function translate(
	key: MessageKeyWithoutPlaceholders,
	values?: Record<string, string | number>,
	locale?: AppLocale,
): string;
export function translate(
	key: MessageKey,
	values: Record<string, string | number> = {},
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return resolveMessage(key, values, locale);
}

export function translateApiResponse(
	code: string,
	locale: AppLocale = DEFAULT_LOCALE,
): string | undefined {
	const responseMessages: Record<ApiResponseCode, MessageKey> = {
		[API_RESPONSE_CODES.AUTH_LOGGED_OUT]: Messages.apiResponse.authLoggedOut,
		[API_RESPONSE_CODES.AUTH_PASSWORD_CHANGED]:
			Messages.apiResponse.authPasswordChanged,
		[API_RESPONSE_CODES.AUTH_PASSWORD_RESET]:
			Messages.apiResponse.authPasswordReset,
		[API_RESPONSE_CODES.AUTH_PASSWORD_RESET_REQUEST_ACCEPTED]:
			Messages.apiResponse.authPasswordResetRequestAccepted,
		[API_RESPONSE_CODES.NOTIFICATIONS_MARKED_READ]:
			Messages.apiResponse.notificationsMarkedRead,
		[API_RESPONSE_CODES.ORDER_ATTACHMENT_DELETED]:
			Messages.apiResponse.orderAttachmentDeleted,
		[API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW]:
			Messages.apiResponse.registrationSubmittedForReview,
	};
	return Object.hasOwn(responseMessages, code)
		? translate(responseMessages[code as ApiResponseCode], {}, locale)
		: undefined;
}

const apiValidationRuleMessages: Record<ApiValidationRuleCode, MessageKey> = {
	[API_VALIDATION_RULE_CODES.ARRAY_MAX_SIZE]:
		Messages.apiError.validationRules.arrayMaxSize,
	[API_VALIDATION_RULE_CODES.ARRAY_UNIQUE]:
		Messages.apiError.validationRules.arrayUnique,
	[API_VALIDATION_RULE_CODES.IS_ARRAY]:
		Messages.apiError.validationRules.isArray,
	[API_VALIDATION_RULE_CODES.IS_BOOLEAN]:
		Messages.apiError.validationRules.isBoolean,
	[API_VALIDATION_RULE_CODES.IS_DATE_STRING]:
		Messages.apiError.validationRules.isDateString,
	[API_VALIDATION_RULE_CODES.IS_EMAIL]:
		Messages.apiError.validationRules.isEmail,
	[API_VALIDATION_RULE_CODES.IS_ENUM]: Messages.apiError.validationRules.isEnum,
	[API_VALIDATION_RULE_CODES.IS_IN]: Messages.apiError.validationRules.isIn,
	[API_VALIDATION_RULE_CODES.IS_INT]: Messages.apiError.validationRules.isInt,
	[API_VALIDATION_RULE_CODES.IS_NOT_EMPTY]:
		Messages.apiError.validationRules.isNotEmpty,
	[API_VALIDATION_RULE_CODES.IS_NUMBER]:
		Messages.apiError.validationRules.isNumber,
	[API_VALIDATION_RULE_CODES.IS_NUMBER_STRING]:
		Messages.apiError.validationRules.isNumberString,
	[API_VALIDATION_RULE_CODES.IS_OBJECT]:
		Messages.apiError.validationRules.isObject,
	[API_VALIDATION_RULE_CODES.IS_STRING]:
		Messages.apiError.validationRules.isString,
	[API_VALIDATION_RULE_CODES.IS_UUID]: Messages.apiError.validationRules.isUUID,
	[API_VALIDATION_RULE_CODES.MATCHES]:
		Messages.apiError.validationRules.matches,
	[API_VALIDATION_RULE_CODES.MAX]: Messages.apiError.validationRules.max,
	[API_VALIDATION_RULE_CODES.MAX_LENGTH]:
		Messages.apiError.validationRules.maxLength,
	[API_VALIDATION_RULE_CODES.MIN]: Messages.apiError.validationRules.min,
	[API_VALIDATION_RULE_CODES.MIN_LENGTH]:
		Messages.apiError.validationRules.minLength,
	[API_VALIDATION_RULE_CODES.UNKNOWN]: Messages.apiError.validationFailed,
};

export function translateApiValidationRule(
	code: string,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	const key = Object.hasOwn(apiValidationRuleMessages, code)
		? (code as ApiValidationRuleCode)
		: API_VALIDATION_RULE_CODES.UNKNOWN;
	return translate(apiValidationRuleMessages[key], {}, locale);
}

const constraintErrorMessages = Object.fromEntries(
	Object.values(API_CONSTRAINT_ERROR_CODES).map((code) => [
		code,
		code.startsWith("DUPLICATE_")
			? Messages.apiError.duplicate
			: Messages.apiError.relatedRecordNotFound,
	]),
) as Record<ApiConstraintErrorCode, MessageKey>;

export const apiErrorMessages: Record<ApiErrorCode, MessageKey> = {
	...constraintErrorMessages,
	[API_ERROR_CODES.DUPLICATE_ORDER_ATTRIBUTE]: Messages.apiError.conflict,
	[API_ERROR_CODES.DUPLICATE_PARAMETRIZATION]: Messages.apiError.conflict,
	[API_ERROR_CODES.DUPLICATE_ORDER_SHARE]: Messages.apiError.conflict,
	[API_ERROR_CODES.DUPLICATE_PROGRAM_CONVOI]: Messages.apiError.conflict,
	[API_ERROR_CODES.ACCOUNT_REGISTRATION_NOT_PENDING]:
		Messages.apiError.accountRegistrationNotPending,
	[API_ERROR_CODES.ACCESS_DENIED]: Messages.apiError.accessDenied,
	[API_ERROR_CODES.CLAIM_COMMENT_NOT_FOUND]:
		Messages.apiError.claimCommentNotFound,
	[API_ERROR_CODES.CLAIM_NOT_FOUND]: Messages.apiError.claimNotFound,
	[API_ERROR_CODES.CLAIM_ORDER_CUSTOMER_MISMATCH]:
		Messages.apiError.claimOrderCustomerMismatch,
	[API_ERROR_CODES.CLAIM_RESOLUTION_REQUIRED]:
		Messages.apiError.claimResolutionRequired,
	[API_ERROR_CODES.CLAIM_TRANSITION_INVALID]:
		Messages.apiError.claimTransitionInvalid,
	[API_ERROR_CODES.CATALOG_GOODS_TYPE_HAS_ACTIVE_GOODS]:
		Messages.apiError.catalogGoodsTypeHasActiveGoods,
	[API_ERROR_CODES.CATALOG_GOODS_TYPE_INACTIVE]:
		Messages.apiError.catalogGoodsTypeInactive,
	[API_ERROR_CODES.CURRENT_PASSWORD_INVALID]:
		Messages.apiError.currentPasswordInvalid,
	[API_ERROR_CODES.CUSTOMER_IDENTITY_INVALID]:
		Messages.apiError.customerIdentityInvalid,
	[API_ERROR_CODES.AUTHENTICATION_REQUIRED]:
		Messages.apiError.authenticationRequired,
	[API_ERROR_CODES.CONFLICT]: Messages.apiError.conflict,
	[API_ERROR_CODES.INTERNAL_ERROR]: Messages.apiError.internal,
	[API_ERROR_CODES.INVALID_IDENTIFIER]: Messages.apiError.invalidIdentifier,
	[API_ERROR_CODES.LAST_ACTIVE_ADMIN]: Messages.apiError.lastActiveAdmin,
	[API_ERROR_CODES.ORDER_ALREADY_PROGRAMMED]:
		Messages.apiError.orderAlreadyProgrammed,
	[API_ERROR_CODES.ORDER_DATE_RANGE_INVALID]:
		Messages.apiError.orderDateRangeInvalid,
	[API_ERROR_CODES.ORDER_CUSTOMER_REQUIRED]:
		Messages.apiError.orderCustomerRequired,
	[API_ERROR_CODES.ORDER_CUSTOMER_ACCESS_DENIED]:
		Messages.apiError.orderCustomerAccessDenied,
	[API_ERROR_CODES.ORDER_OWNERSHIP_CHANGE_FORBIDDEN]:
		Messages.apiError.orderOwnershipChangeForbidden,
	[API_ERROR_CODES.ORDER_STATUS_CHANGE_FORBIDDEN]:
		Messages.apiError.orderStatusChangeForbidden,
	[API_ERROR_CODES.PROGRAM_CUSTOMER_ACCESS_DENIED]:
		Messages.apiError.programCustomerAccessDenied,
	[API_ERROR_CODES.PROGRAM_OWNERSHIP_CHANGE_FORBIDDEN]:
		Messages.apiError.programOwnershipChangeForbidden,
	[API_ERROR_CODES.PROGRAM_STATUS_CHANGE_FORBIDDEN]:
		Messages.apiError.programStatusChangeForbidden,
	[API_ERROR_CODES.NOTIFICATION_NOT_FOUND]:
		Messages.apiError.notificationNotFound,
	[API_ERROR_CODES.ORDER_MUST_BE_DRAFT]: Messages.apiError.orderMustBeDraft,
	[API_ERROR_CODES.ORDER_NOT_ELIGIBLE_FOR_PROGRAM]:
		Messages.apiError.orderNotEligibleForProgram,
	[API_ERROR_CODES.ORDER_NOT_FOUND]: Messages.apiError.orderNotFound,
	[API_ERROR_CODES.ORDER_QUANTITY_INVALID]:
		Messages.apiError.orderQuantityInvalid,
	[API_ERROR_CODES.ORDER_TRANSITION_INVALID]:
		Messages.apiError.orderTransitionInvalid,
	[API_ERROR_CODES.ORDER_UPDATE_CONFLICT]:
		Messages.apiError.orderUpdateConflict,
	[API_ERROR_CODES.PROGRAM_MUST_BE_DRAFT]: Messages.apiError.programMustBeDraft,
	[API_ERROR_CODES.PROGRAM_NOT_FOUND]: Messages.apiError.programNotFound,
	[API_ERROR_CODES.PROGRAM_TRANSITION_INVALID]:
		Messages.apiError.programTransitionInvalid,
	[API_ERROR_CODES.RATE_LIMITED]: Messages.apiError.rateLimited,
	[API_ERROR_CODES.REQUEST_FAILED]: Messages.apiError.requestFailed,
	[API_ERROR_CODES.RESOURCE_NOT_FOUND]: Messages.apiError.notFound,
	[API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE]:
		Messages.apiError.rolePermissionUnavailable,
	[API_ERROR_CODES.ROLE_PROFILE_IN_USE]: Messages.apiError.roleProfileInUse,
	[API_ERROR_CODES.RESET_TOKEN_EXPIRED]: Messages.apiError.resetTokenExpired,
	[API_ERROR_CODES.RESET_TOKEN_INVALID]: Messages.apiError.resetTokenInvalid,
	[API_ERROR_CODES.VALIDATION_FAILED]: Messages.apiError.validationFailed,
	[API_ERROR_CODES.USER_EMAIL_ALREADY_EXISTS]:
		Messages.apiError.userEmailAlreadyExists,
	[API_ERROR_CODES.USER_NOT_FOUND]: Messages.apiError.userNotFound,
	[API_ERROR_CODES.USER_ROLE_NOT_FOUND]: Messages.apiError.userRoleNotFound,
	[API_ERROR_CODES.CUSTOMER_ASSIGNMENT_REQUIRED]:
		Messages.apiError.customerAssignmentRequired,
	[API_ERROR_CODES.CUSTOMER_NOT_FOUND]: Messages.apiError.customerNotFound,
	[API_ERROR_CODES.CUSTOMER_OUTSIDE_PORTFOLIO]:
		Messages.apiError.customerOutsidePortfolio,
	[API_ERROR_CODES.TRACKED_TRAIN_NOT_FOUND]:
		Messages.apiError.trackedTrainNotFound,
	[API_ERROR_CODES.TRACKED_WAGON_NOT_FOUND]:
		Messages.apiError.trackedWagonNotFound,
	[API_ERROR_CODES.ATTACHMENT_NOT_FOUND]: Messages.apiError.attachmentNotFound,
	[API_ERROR_CODES.ORDER_FILE_NOT_FOUND]: Messages.apiError.orderFileNotFound,
	[API_ERROR_CODES.REPORT_DATE_INVALID]: Messages.apiError.reportDateInvalid,
	[API_ERROR_CODES.REPORT_DATE_RANGE_INVALID]:
		Messages.apiError.reportDateRangeInvalid,
};

export function translateApiError(
	code?: string,
	status?: number,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	if (code === API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE) {
		return translate(Messages.transport.apiUnavailable, {}, locale);
	}
	if (code && Object.hasOwn(apiErrorMessages, code)) {
		return translate(apiErrorMessages[code as ApiErrorCode], {}, locale);
	}
	if (code?.startsWith("DUPLICATE_")) {
		return translate(Messages.apiError.duplicate, {}, locale);
	}
	if (code?.endsWith("_NOT_FOUND")) {
		return translate(Messages.apiError.relatedRecordNotFound, {}, locale);
	}
	if ((status ?? 0) >= 500) {
		return translate(Messages.apiError.internal, {}, locale);
	}
	return translate(Messages.apiError.requestFailed, {}, locale);
}

export { Messages };
