import { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramCreateForm } from "@/components/programs/program-create-form";
import { programsBreadcrumbs } from "../breadcrumbs";

export const metadata: Metadata = {
	title: "New Program",
	description: "",
};

export default function Page() {
	return (
		<>
			<Breadcrumbs items={programsBreadcrumbs.create()} />

			<ProgramCreateForm />
		</>
	);
}
