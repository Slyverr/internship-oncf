import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";
import { programsControllerFindOne } from "@/lib/api/programs";
import { programsBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const program = await programsControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={programsBreadcrumbs.edit(
					id,
					program.programNumber ?? `#${program.id}`,
				)}
			/>

			<UnderConstruction />
		</>
	);
}
