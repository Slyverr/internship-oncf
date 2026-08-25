import { compositeHandlers } from "./handlers/composite_constraints";
import { fkHandlers } from "./handlers/fk_constraints";
import { uniqueHandlers } from "./handlers/unique_constraints";
import { ConstraintHandler } from "./types";

export { ConstraintCode } from "./codes";
export type { ConstraintHandler, ErrorContext, ErrorResponse } from "./types";

export const constraintHandlers: Record<string, ConstraintHandler> = {
	...fkHandlers,
	...uniqueHandlers,
	...compositeHandlers,
};
