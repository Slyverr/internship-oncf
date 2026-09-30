import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramEditForm } from "@/components/programs/program-edit-form";
import { programsControllerFindOne } from "@/lib/api/programs";
import { programsBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const program = await programsControllerFindOne(id);

	return (
		<>
			<Breadcrumbs
				items={programsBreadcrumbs.edit(
					id,
					program.programNumber ?? `#${program.id}`,
				)}
			/>

			<ProgramEditForm program={program} />
		</>
	);
}
