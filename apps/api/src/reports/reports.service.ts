import { Permission } from "@ecommand/shared";
import { BadRequestException, Injectable } from "@nestjs/common";
import { customers, goods, orderStatus, orders } from "drizzle/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { DrizzleService } from "@/database/drizzle.service";
import type { OrderReportQueryDto } from "./reports.dto";

function dateStart(value: string) {
	const date = new Date(`${value}T00:00:00.000Z`);
	if (
		Number.isNaN(date.getTime()) ||
		date.toISOString().slice(0, 10) !== value
	) {
		throw new BadRequestException("Invalid report date");
	}
	return `${value} 00:00:00`;
}

@Injectable()
export class ReportsService {
	constructor(private readonly drizzle: DrizzleService) {}

	async getOrders(user: AuthUser, query: OrderReportQueryDto) {
		const from = query.from ? dateStart(query.from) : undefined;
		const to = query.to ? dateStart(query.to) : undefined;
		if (from && to && from > to) {
			throw new BadRequestException(
				"From date must be before or equal to to date",
			);
		}
		const nextDay = to ? new Date(`${query.to}T00:00:00.000Z`) : undefined;
		nextDay?.setUTCDate(nextDay.getUTCDate() + 1);
		const canManageOther = hasOnePermission(
			user,
			Permission.ORDERS_MANAGE_OTHER,
		);
		const dataScope = canManageOther
			? undefined
			: user.customerId !== null
				? eq(orders.customerId, user.customerId)
				: eq(orders.createdByUserId, user.id);
		const where = and(
			dataScope,
			from ? gte(orders.orderDate, from) : undefined,
			nextDay
				? lt(orders.orderDate, `${nextDay.toISOString().slice(0, 10)} 00:00:00`)
				: undefined,
		);
		const count = sql<number>`count(*)::int`;
		const month = sql<string>`to_char(${orders.orderDate}, 'YYYY-MM')`;
		const db = this.drizzle.db;
		const [totals, byStatus, byCustomer, byProduct, byMonth] =
			await Promise.all([
				db.select({ count }).from(orders).where(where),
				db
					.select({ id: orderStatus.id, name: orderStatus.name, count })
					.from(orders)
					.innerJoin(orderStatus, eq(orders.statusId, orderStatus.id))
					.where(where)
					.groupBy(orderStatus.id, orderStatus.name)
					.orderBy(desc(count)),
				db
					.select({ id: customers.id, name: customers.companyName, count })
					.from(orders)
					.innerJoin(customers, eq(orders.customerId, customers.id))
					.where(where)
					.groupBy(customers.id, customers.companyName)
					.orderBy(desc(count)),
				db
					.select({ id: goods.id, name: goods.name, count })
					.from(orders)
					.innerJoin(goods, eq(orders.goodsId, goods.id))
					.where(where)
					.groupBy(goods.id, goods.name)
					.orderBy(desc(count)),
				db
					.select({ month, count })
					.from(orders)
					.where(where)
					.groupBy(month)
					.orderBy(month),
			]);

		return {
			from: query.from ?? null,
			to: query.to ?? null,
			totalOrders: totals[0]?.count ?? 0,
			byStatus,
			byCustomer,
			byProduct,
			byMonth,
		};
	}
}
