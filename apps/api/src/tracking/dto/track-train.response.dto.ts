export class TrackTrainResponseDto {
	id: number;
	trainNumber: string;
	externalId?: string;
	status?: string;
	trainTrackings?: {
		id: number;
		latitude: string;
		longitude: string;
		status: string;
		recordedAt: string;
	}[];
}
