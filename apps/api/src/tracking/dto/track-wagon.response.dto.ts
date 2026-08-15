export class TrackWagonResponseDto {
	id: number;
	wagonNumber: string;
	externalId?: string;
	type?: string;
	capacity?: number;
	status?: string;
	wagonTrackings?: {
		id: number;
		latitude: string;
		longitude: string;
		status: string;
		recordedAt: string;
	}[];
}
