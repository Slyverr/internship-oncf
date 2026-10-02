"use client";

import { PageHeader } from "@/components/common/page-header";
import { ProgramActions } from "@/components/programs/program-actions";
import { ProgramOverview } from "@/components/programs/program-overview";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { useProgramsControllerFindOne } from "@/lib/api/programs";

interface ProgramDetailsClientProps {
	program: ProgramDetailDto;
}

export function ProgramDetailsClient({ program }: ProgramDetailsClientProps) {
	const t = useTranslate();
	const { data: currentProgram } = useProgramsControllerFindOne(
		program.programNumber,
		{
			query: {
				initialData: program,
			},
		},
	);

	if (!currentProgram) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={
					currentProgram.programNumber ??
					t(Messages.programs.numberFallback, { id: currentProgram.id })
				}
				description={
					currentProgram.order.orderNumber ?? t(Messages.programs.singular)
				}
			>
				<ProgramActions program={currentProgram} />
			</PageHeader>

			<ProgramOverview program={currentProgram} />
		</>
	);
}
