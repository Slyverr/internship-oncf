import type { ManagedReferenceResource } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import {
	accessoryOperations,
	agencies,
	berths,
	goods,
	goodsTypes,
	ports,
	rejectionReasons,
	shippingCompanies,
	sidings,
	stations,
	units,
	vessels,
} from "drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import {
	AccessoryOperationInsert,
	AccessoryOperationUpdate,
	GoodInsert,
	GoodsTypeInsert,
	GoodsTypeUpdate,
	GoodUpdate,
	RejectionReasonInsert,
	RejectionReasonUpdate,
	UnitInsert,
	UnitUpdate,
} from "./catalog.types";
import type {
	CreateManagedReferenceDataDto,
	UpdateManagedReferenceDataDto,
} from "./requests/managed-reference-data.dto";

@Injectable()
export class CatalogQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findManagedReferenceData(resource: ManagedReferenceResource) {
		switch (resource) {
			case "stations":
				return this.drizzle.db.query.stations.findMany({
					orderBy: { name: "asc" },
				});
			case "agencies":
				return this.drizzle.db.query.agencies.findMany({
					orderBy: { name: "asc" },
				});
			case "ports": {
				const rows = await this.drizzle.db.query.ports.findMany({
					with: { station: { columns: { id: true, name: true } } },
					orderBy: { name: "asc" },
				});
				return rows.map(({ station, ...port }) => ({
					...port,
					stationName: station?.name ?? null,
				}));
			}
			case "berths": {
				const rows = await this.drizzle.db.query.berths.findMany({
					with: { port: { columns: { id: true, name: true } } },
					orderBy: { name: "asc" },
				});
				return rows.map(({ port, ...berth }) => ({
					...berth,
					portName: port?.name ?? null,
				}));
			}
			case "sidings":
				return this.drizzle.db.query.sidings.findMany({
					orderBy: { name: "asc" },
				});
			case "vessels":
				return this.drizzle.db
					.select()
					.from(vessels)
					.orderBy(asc(vessels.name));
			case "shippingCompanies":
				return this.drizzle.db
					.select()
					.from(shippingCompanies)
					.orderBy(asc(shippingCompanies.name));
		}
	}

	async createManagedReferenceData(
		resource: ManagedReferenceResource,
		values: CreateManagedReferenceDataDto,
	) {
		const input = { ...values, createdAt: undefined };
		switch (resource) {
			case "stations":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(stations)
							.values({
								name: input.name,
								stationCode: input.stationCode as string,
								address: input.address ?? null,
								city: input.city ?? null,
							})
							.returning(),
					{},
				);
			case "agencies":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(agencies)
							.values({
								name: input.name,
								city: input.city ?? null,
								address: input.address ?? null,
								phone: input.phone ?? null,
								email: input.email ?? null,
							})
							.returning(),
					{},
				);
			case "ports":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(ports)
							.values({
								name: input.name,
								type: input.type as "normal" | "dry",
								city: input.city ?? null,
								stationId: input.stationId ?? null,
							})
							.returning(),
					{},
				);
			case "berths":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(berths)
							.values({ name: input.name, portId: input.portId as number })
							.returning(),
					{},
				);
			case "sidings":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(sidings)
							.values({ name: input.name, city: input.city ?? null })
							.returning(),
					{},
				);
			case "vessels":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(vessels)
							.values({ name: input.name })
							.returning(),
					{},
				);
			case "shippingCompanies":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.insert(shippingCompanies)
							.values({ name: input.name })
							.returning(),
					{},
				);
		}
	}

	async updateManagedReferenceData(
		resource: ManagedReferenceResource,
		id: number,
		values: UpdateManagedReferenceDataDto,
	) {
		const updatedAt = new Date().toISOString();
		switch (resource) {
			case "stations":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(stations)
							.set({
								name: values.name,
								stationCode: values.stationCode as string,
								address: values.address ?? null,
								city: values.city ?? null,
								isActive: values.isActive,
								updatedAt,
							})
							.where(eq(stations.id, id))
							.returning(),
					{},
				);
			case "agencies":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(agencies)
							.set({
								name: values.name,
								city: values.city ?? null,
								address: values.address ?? null,
								phone: values.phone ?? null,
								email: values.email ?? null,
								isActive: values.isActive,
								updatedAt,
							})
							.where(eq(agencies.id, id))
							.returning(),
					{},
				);
			case "ports":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(ports)
							.set({
								name: values.name,
								type: values.type as "normal" | "dry",
								city: values.city ?? null,
								stationId: values.stationId ?? null,
								isActive: values.isActive,
								updatedAt,
							})
							.where(eq(ports.id, id))
							.returning(),
					{},
				);
			case "berths":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(berths)
							.set({
								name: values.name,
								portId: values.portId as number,
								isActive: values.isActive,
								updatedAt,
							})
							.where(eq(berths.id, id))
							.returning(),
					{},
				);
			case "sidings":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(sidings)
							.set({
								name: values.name,
								city: values.city ?? null,
								isActive: values.isActive,
								updatedAt,
							})
							.where(eq(sidings.id, id))
							.returning(),
					{},
				);
			case "vessels":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(vessels)
							.set({ name: values.name, isActive: values.isActive, updatedAt })
							.where(eq(vessels.id, id))
							.returning(),
					{},
				);
			case "shippingCompanies":
				return withDbErrorHandling(
					() =>
						this.drizzle.db
							.update(shippingCompanies)
							.set({ name: values.name, isActive: values.isActive, updatedAt })
							.where(eq(shippingCompanies.id, id))
							.returning(),
					{},
				);
		}
	}

	async hasActiveStation(id: number) {
		return Boolean(
			await this.drizzle.db.query.stations.findFirst({
				where: { id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async hasActivePortsForStation(id: number) {
		return Boolean(
			await this.drizzle.db.query.ports.findFirst({
				where: { stationId: id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async hasActivePort(id: number) {
		return Boolean(
			await this.drizzle.db.query.ports.findFirst({
				where: { id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async hasActiveBerthsForPort(id: number) {
		return Boolean(
			await this.drizzle.db.query.berths.findFirst({
				where: { portId: id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async hasActiveLoadingLocationsForPort(id: number) {
		return Boolean(
			await this.drizzle.db.query.loadingLocations.findFirst({
				where: { portId: id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async findUnits() {
		return this.drizzle.db.query.units.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findCustomerTypes() {
		return this.drizzle.db.query.customerTypes.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageUnits() {
		return this.drizzle.db.query.units.findMany({
			orderBy: { name: "asc" },
		});
	}

	async createUnit(values: UnitInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(units).values(values).returning(),
			values,
		);
		return created;
	}

	async updateUnit(id: string, values: UnitUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(units)
					.set(values)
					.where(eq(units.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findGoodsTypes() {
		return this.drizzle.db.query.goodsTypes.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageGoodsTypes() {
		return this.drizzle.db.query.goodsTypes.findMany({
			orderBy: { name: "asc" },
		});
	}

	async createGoodsType(values: GoodsTypeInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(goodsTypes).values(values).returning(),
			values,
		);
		return created;
	}

	async updateGoodsType(id: string, values: GoodsTypeUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(goodsTypes)
					.set(values)
					.where(eq(goodsTypes.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async hasActiveGoodsForType(goodsTypeId: string) {
		return Boolean(
			await this.drizzle.db.query.goods.findFirst({
				where: { goodsTypeId, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async isActiveGoodsType(id: string) {
		return Boolean(
			await this.drizzle.db.query.goodsTypes.findFirst({
				where: { id, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async findGoods() {
		return this.drizzle.db.query.goods.findMany({
			where: { isActive: true },
			with: {
				goodsType: {
					columns: { name: true },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	async createGood(values: GoodInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(goods).values(values).returning(),
			values,
		);
		return created;
	}

	async findManageGoods() {
		return this.drizzle.db.query.goods.findMany({
			orderBy: { name: "asc" },
		});
	}

	async updateGood(id: number, values: GoodUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(goods)
					.set(values)
					.where(eq(goods.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findAccessoryOperations() {
		return this.drizzle.db.query.accessoryOperations.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageAccessoryOperations() {
		return this.drizzle.db.query.accessoryOperations.findMany({
			orderBy: { name: "asc" },
		});
	}

	async createAccessoryOperation(values: AccessoryOperationInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(accessoryOperations).values(values).returning(),
			values,
		);
		return created;
	}

	async updateAccessoryOperation(id: string, values: AccessoryOperationUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(accessoryOperations)
					.set(values)
					.where(eq(accessoryOperations.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findRejectionReasons() {
		return this.drizzle.db.query.rejectionReasons.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageRejectionReasons() {
		return this.drizzle.db.query.rejectionReasons.findMany({
			orderBy: { name: "asc" },
		});
	}

	async createRejectionReason(values: RejectionReasonInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(rejectionReasons).values(values).returning(),
			values,
		);
		return created;
	}

	async updateRejectionReason(id: string, values: RejectionReasonUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(rejectionReasons)
					.set(values)
					.where(eq(rejectionReasons.id, id))
					.returning(),
			values,
		);
		return updated;
	}
}
