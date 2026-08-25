import { Assert, Equals } from "@/common/utils/type-assertions";
import { TrackWagon } from "../tracking.types";

type _Assertion = Assert<Equals<TrackWagonDto, TrackWagon>>;

export class TrackWagonDto implements TrackWagon {
	id: number;
	externalId: string | null;
	wagonNumber: string;
	type: string | null;
	capacity: string | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	wagonTrackings: {
		id: number;
		wagonId: number;
		latitude: string | null;
		longitude: string | null;
		status: string | null;
		recordedAt: string;
	}[];
}
