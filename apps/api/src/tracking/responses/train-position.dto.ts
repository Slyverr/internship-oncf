import { Assert, Equals } from "@/common/utils/type-assertions";
import { TrainPosition } from "../tracking.types";

type _Assertion = Assert<Equals<TrainPositionDto, TrainPosition>>;

export class TrainPositionDto implements TrainPosition {
	id: number;
	trainId: number;
	latitude: string | null;
	longitude: string | null;
	status: string | null;
	recordedAt: string;
}
