import type { AuthUser } from "@/auth/auth.types";
import type { OrderDetail } from "@/orders/orders.types";
import type { ProgramDetail } from "@/programs/programs.types";

export const DTM_GATEWAY = Symbol("DTM_GATEWAY");

/** Stable boundary between ECommand workflows and a DTM transport. */
export interface DtmGateway {
	submitOrder(order: OrderDetail, user: AuthUser): Promise<void>;
	submitProgram(program: ProgramDetail, user: AuthUser): Promise<void>;
}

export function selectDtmGateway(
	mode: string | undefined,
	simulator: DtmGateway,
	disabled: DtmGateway,
): DtmGateway {
	return mode === "simulator" ? simulator : disabled;
}
