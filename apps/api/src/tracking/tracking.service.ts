import { Permission } from "@ecommand/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import { trains, trainTracking, wagonTracking } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { DrizzleService } from "src/db/drizzle.service";
import { withDbErrorHandling } from "src/db/drizzle.util";
import { UpdateTrainPositionDto } from "./dto/update-train-position.dto";
import { UpdateWagonPositionDto } from "./dto/update-wagon-position.dto";
import { TrainId, WagonId } from "./tracking.types";

@Injectable()
export class TrackingService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findOrder(orderId: number) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: { id: orderId },
		});
		if (!order) throw new NotFoundException(`Order ${orderId} not found`);
		return order;
	}

	async trackWagon(wagonNumber: string) {
		const wagon = await this.drizzle.db.query.wagons.findFirst({
			where: { wagonNumber },
			with: {
				wagonTrackings: {
					orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
					limit: 1,
				},
			},
		});
		if (!wagon) throw new NotFoundException(`Wagon ${wagonNumber} not found`);
		return wagon;
	}

	async trackTrain(trainNumber: string) {
		const train = await this.drizzle.db.query.trains.findFirst({
			where: { trainNumber },
			with: {
				trainTrackings: {
					orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
					limit: 1,
				},
			},
		});
		if (!train) throw new NotFoundException(`Train ${trainNumber} not found`);
		return train;
	}

	async trackOrder(orderId: number, user: AuthUser) {
		if (!hasPermission(user, Permission.TRACKING_UPDATE)) {
			const order = await this.findOrder(orderId);
			if (order.userId !== user.id) {
				throw new NotFoundException(`Order ${orderId} not found`);
			}
		}

		const orderWagonsList = await this.drizzle.db.query.orderWagons.findMany({
			where: { orderId },
			with: {
				wagon: {
					with: {
						wagonTrackings: {
							orderBy: (tracking, { desc }) => [desc(tracking.recordedAt)],
							limit: 1,
						},
					},
				},
			},
		});

		return orderWagonsList;
	}

	async updateWagonPosition(id: WagonId, dto: UpdateWagonPositionDto) {
		const values = {
			wagonId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		};

		const [position] = await withDbErrorHandling(
			() => this.drizzle.db.insert(wagonTracking).values(values).returning(),
			values,
		);

		return position;
	}

	async updateTrainPosition(id: TrainId, dto: UpdateTrainPositionDto) {
		const values = {
			trainId: id,
			latitude: String(dto.latitude),
			longitude: String(dto.longitude),
			status: dto.status ?? "IN_TRANSIT",
		};

		const [position] = await withDbErrorHandling(
			() => this.drizzle.db.insert(trainTracking).values(values).returning(),
			values,
		);

		await this.drizzle.db
			.update(trains)
			.set({ status: dto.status ?? "IN_TRANSIT" })
			.where(eq(trains.id, id));

		return position;
	}
}
