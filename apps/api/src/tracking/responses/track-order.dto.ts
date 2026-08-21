import { Assert, Equals } from "src/common/utils/type-assertions";
import { TrackOrder } from "../tracking.types";

type _Assertion = Assert<Equals<TrackOrderDto, TrackOrder>>;

export class TrackOrderDto implements TrackOrder {
	orderId: number;
	wagonId: number;
	wagon: {
		id: number;
		wagonNumber: string;
		wagonTrackings: {
			id: number;
			status: string | null;
			wagonId: number;
			latitude: string | null;
			longitude: string | null;
			recordedAt: string;
		}[];
	} | null;
}
