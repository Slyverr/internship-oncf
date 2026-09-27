import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramCreateForm } from "@/components/programs/program-create-form";
import { programsBreadcrumbs } from "../breadcrumbs";

export const metadata: Metadata = {
	title: "New Program",
	description: "",
};

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
	const params = await searchParams;
	const orderIdValue = params.orderId;
	const initialOrderId =
		typeof orderIdValue === "string" && /^\d+$/.test(orderIdValue)
			? Number(orderIdValue)
			: undefined;
	const searchValue = params.search;

	return (
		<>
			<Breadcrumbs items={programsBreadcrumbs.create()} />
			<ProgramCreateForm
				initialOrderId={
					initialOrderId && Number.isSafeInteger(initialOrderId)
						? initialOrderId
						: undefined
				}
				initialOrderSearch={
					typeof searchValue === "string" ? searchValue : undefined
				}
			/>
		</>
	);
}
