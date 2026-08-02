import { Injectable, NotFoundException } from "@nestjs/common";
import { orders } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import type { OrderId } from "./orders.types";

@Injectable()
export class OrdersService {
	constructor(private readonly drizzle: DrizzleService) {}

	async create(dto: CreateOrderDto) {
		const [created] = await this.drizzle.db
			.insert(orders)
			.values(dto)
			.returning();
		return created;
	}

	async findAll() {
		return this.drizzle.db.query.orders.findMany();
	}

	async findOne(id: OrderId) {
		const order = await this.drizzle.db.query.orders.findFirst({
			where: {
				id,
			},
		});
		if (!order) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}
		return order;
	}

	async update(id: OrderId, dto: UpdateOrderDto) {
		const [updated] = await this.drizzle.db
			.update(orders)
			.set(dto)
			.where(eq(orders.id, id))
			.returning();
		if (!updated) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}
		return updated;
	}

	async remove(id: OrderId) {
		const [deleted] = await this.drizzle.db
			.delete(orders)
			.where(eq(orders.id, id))
			.returning();
		if (!deleted) {
			throw new NotFoundException(`Order with id ${id} not found`);
		}
		return deleted;
	}
}
