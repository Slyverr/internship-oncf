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
	const { data: currentProgram } = useProgramsControllerFindOne(
		program.programNumber,
		{
			query: {
				initialData: program,
				refetchInterval: (query) =>
					query.state.data?.dtmStatus === "PENDING" ? 1_000 : false,
			},
		},
	);

	if (!currentProgram) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={currentProgram.programNumber}
				description={currentProgram.order.orderNumber}
			>
				<ProgramActions program={currentProgram} />
			</PageHeader>

			<ProgramOverview program={currentProgram} />
		</>
	);
}
