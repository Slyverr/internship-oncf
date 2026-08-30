import { ClaimCreateForm } from "@/components/claims/claim-create-form";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { claimsBreadcrumbs } from "../breadcrumbs";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.create()} />

			<ClaimCreateForm />
		</>
	);
}
