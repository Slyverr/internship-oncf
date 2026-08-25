import { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";

export const metadata: Metadata = {
	title: "New Program",
	description: "",
};

export default function Page() {
	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Programs", href: "/dashboard/programs" },
					{ label: "New Program", href: "/dashboard/programs/new" },
				]}
			/>

			<UnderConstruction />
		</>
	);
}
