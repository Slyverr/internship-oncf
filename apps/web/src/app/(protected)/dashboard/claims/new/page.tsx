import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";
import { claimsBreadcrumbs } from "../breadcrumbs";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.create()} />

			<UnderConstruction />
		</>
	);
}
