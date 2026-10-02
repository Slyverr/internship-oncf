import { Messages, type TypedMessageTranslator } from "@/i18n";

const customerTypeMessages: Record<
	string,
	(typeof Messages.customers.types)[keyof typeof Messages.customers.types]
> = {
	INDUSTRIAL: Messages.customers.types.industrial,
	COMMERCIAL: Messages.customers.types.commercial,
	AGRICULTURAL: Messages.customers.types.agricultural,
	MINING: Messages.customers.types.mining,
	PETROLEUM: Messages.customers.types.petroleum,
	FREIGHT_FORWARDER: Messages.customers.types.freightForwarder,
	OTHER: Messages.customers.types.other,
};

export function getCustomerTypeLabel(
	code: string | null | undefined,
	t: TypedMessageTranslator,
): string | undefined {
	if (!code) return undefined;
	const message = customerTypeMessages[code];
	if (message) return t(message);
	return code
		.toLocaleLowerCase("en")
		.replaceAll("_", " ")
		.replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("en"));
}
