import { Assert, Equals } from "@/common/utils/type-assertions";
import { WagonPosition } from "../tracking.types";

type _Assertion = Assert<Equals<WagonPositionDto, WagonPosition>>;

export class WagonPositionDto implements WagonPosition {
	id: number;
	wagonId: number;
	latitude: string | null;
	longitude: string | null;
	status: string | null;
	recordedAt: string;
}
