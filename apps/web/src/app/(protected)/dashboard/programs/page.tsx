import { PlusIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { ProgramsTable } from "@/components/programs/programs-table";
import { buttonVariants } from "@/components/ui/button";
import { programsControllerFindAll } from "@/lib/api/programs";

export const metadata: Metadata = {
	title: "Programs",
	description: "Browse and manage operational programs.",
};

export default async function Page() {
	const programs = await programsControllerFindAll({});

	return (
		<>
			<Breadcrumbs
				items={[{ label: "Programs", href: "/dashboard/programs" }]}
			/>

			<PageHeader
				title="Programs"
				description="View and manage operational programs and their planned quantities."
			>
				<Link className={buttonVariants()} href="/dashboard/programs/new">
					<PlusIcon />
					Create Program
				</Link>
			</PageHeader>

			<ProgramsTable data={programs} />
		</>
	);
}
