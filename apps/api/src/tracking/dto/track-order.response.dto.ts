export class TrackOrderResponseDto {
	orderId: number;
	wagonId: number;
	wagon: {
		id: number;
		wagonNumber: string;
		wagonTrackings?: {
			id: number;
			latitude: string;
			longitude: string;
			status: string;
			recordedAt: string;
		}[];
	};
}
