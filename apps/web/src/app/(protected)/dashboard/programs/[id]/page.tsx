import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramDetailsClient } from "@/components/programs/program-details-client";
import { programsControllerFindOne } from "@/lib/api/programs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const program = await programsControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Programs", href: "/dashboard/programs" },
					{ label: program.programNumber ?? `#${program.id}` },
				]}
			/>

			<ProgramDetailsClient program={program} />
		</>
	);
}
