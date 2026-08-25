"use client";

import { PageHeader } from "@/components/common/page-header";
import { ProgramActions } from "@/components/programs/program-actions";
import { ProgramOverview } from "@/components/programs/program-overview";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { useProgramsControllerFindOne } from "@/lib/api/programs";

interface ProgramDetailsClientProps {
	program: ProgramDetailDto;
}

export function ProgramDetailsClient({ program }: ProgramDetailsClientProps) {
	const { data: currentProgram } = useProgramsControllerFindOne(program.id, {
		query: {
			initialData: program,
		},
	});

	if (!currentProgram) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={currentProgram.programNumber ?? `Program #${currentProgram.id}`}
				description={currentProgram.order.orderNumber ?? "Program"}
			>
				<ProgramActions program={currentProgram} />
			</PageHeader>

			<ProgramOverview program={currentProgram} />
		</>
	);
}
