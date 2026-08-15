export class UpdatePositionResponseDto {
	id: number;
	wagonId?: number;
	trainId?: number;
	latitude: string;
	longitude: string;
	status: string;
	recordedAt: string;
}
