import { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";

export const metadata: Metadata = {
	title: "All Programs",
	description: "",
};

export default async function Page() {
	return (
		<>
			<Breadcrumbs
				items={[{ label: "Programs", href: "/dashboard/programs" }]}
			/>

			<UnderConstruction />
		</>
	);
}
