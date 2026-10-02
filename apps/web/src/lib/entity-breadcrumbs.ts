import {
	createTranslator,
	DEFAULT_LOCALE,
	type MessageKeyWithoutPlaceholders,
	type TypedMessageTranslator,
} from "@/i18n";
import type { BreadcrumbItem } from "@/providers/breadcrumb-provider";

interface EntityBreadcrumbConfig {
	resourceKey: MessageKeyWithoutPlaceholders;
	baseUrl: string;
	createKey: MessageKeyWithoutPlaceholders;
	editKey: MessageKeyWithoutPlaceholders;
}

export function createEntityBreadcrumbs({
	resourceKey,
	baseUrl,
	createKey,
	editKey,
}: EntityBreadcrumbConfig) {
	const defaultTranslator = createTranslator(DEFAULT_LOCALE);
	const home = (
		t: TypedMessageTranslator = defaultTranslator,
	): BreadcrumbItem[] => [{ label: t(resourceKey), href: baseUrl }];
	const detail = (
		id: string,
		label?: string,
		t: TypedMessageTranslator = defaultTranslator,
	): BreadcrumbItem[] => [
		...home(t),
		{ label: label ?? id, href: `${baseUrl}/${id}` },
	];

	return {
		home,
		create: (
			t: TypedMessageTranslator = defaultTranslator,
		): BreadcrumbItem[] => [...home(t), { label: t(createKey) }],
		detail,
		edit: (
			id: string,
			label?: string,
			t: TypedMessageTranslator = defaultTranslator,
		): BreadcrumbItem[] => [...detail(id, label, t), { label: t(editKey) }],
	};
}
