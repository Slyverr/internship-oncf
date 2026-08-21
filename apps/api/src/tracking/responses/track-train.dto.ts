import { Assert, Equals } from "src/common/utils/type-assertions";
import { TrackTrain } from "../tracking.types";

type _Assertion = Assert<Equals<TrackTrainDto, TrackTrain>>;

export class TrackTrainDto implements TrackTrain {
	id: number;
	externalId: string | null;
	trainNumber: string;
	status: string | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	trainTrackings: {
		id: number;
		trainId: number;
		latitude: string | null;
		longitude: string | null;
		status: string | null;
		recordedAt: string;
	}[];
}
