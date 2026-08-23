import { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "",
};

export default function Page() {
	return (
		<>
			<Breadcrumbs items={[]} />
			<UnderConstruction />
		</>
	);
}
