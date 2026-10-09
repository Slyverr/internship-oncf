import { OrderStatus, ProgramStatus } from "@ecommand/shared";
import {
	forecastProgramHistory,
	forecastPrograms,
	orderStatusHistory,
	orders,
} from "drizzle/schema";
import { DrizzleService } from "@/database/drizzle.service";
import { ORDER_STATUSES, PROGRAM_STATUSES } from "@/database/reference-data";
import { DtmQuery } from "./dtm.query";

function selectResult<T>(row: T) {
	const query = {
		from: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		for: jest.fn().mockResolvedValue([row]),
	};
	return query;
}

function createDtmQuery(
	entityType: string,
	entityRow: Record<string, unknown>,
) {
	const pendingQuery = selectResult({
		relatedEntityType: entityType,
		relatedEntityId: 7,
		createdByUserId: 41,
	});
	const entityQuery = selectResult(entityRow);
	const insertValues = jest.fn().mockResolvedValue([]);
	const insert = jest.fn((table: unknown) => ({
		values: jest.fn((values: unknown) => {
			insertValues(table, values);
			return Promise.resolve([]);
		}),
	}));
	const returning = jest.fn().mockResolvedValue([{ id: 7 }]);
	const updateWhere = jest.fn(() => ({ returning }));
	const update = jest.fn(() => ({
		set: jest.fn(() => ({ where: updateWhere })),
	}));
	const tx = {
		select: jest
			.fn()
			.mockReturnValueOnce(pendingQuery)
			.mockReturnValueOnce(entityQuery),
		update,
		insert,
	};
	const drizzle = {
		db: {
			transaction: jest.fn((callback: (transaction: typeof tx) => unknown) =>
				callback(tx),
			),
		},
	} as unknown as DrizzleService;
	return { query: new DtmQuery(drizzle), insertValues, tx };
}

describe("DtmQuery completion", () => {
	it("moves an accepted order from sent to DTM into progress and records history", async () => {
		const { query, insertValues, tx } = createDtmQuery("orders", {
			statusId: ORDER_STATUSES[OrderStatus.SENT_TO_DTM].id,
			orderNumber: "ORD-ABCDEFGHIJ",
			createdByUserId: 84,
		});

		await expect(
			query.completeSimulatorRequest(15, "ACCEPTED"),
		).resolves.toEqual({
			relatedEntityType: "orders",
			relatedEntityId: 7,
			relatedEntityCode: "ORD-ABCDEFGHIJ",
			createdByUserId: 41,
			relatedEntityOwnerUserId: 84,
		});

		expect(tx.update).toHaveBeenNthCalledWith(2, orders);
		expect(tx.insert).toHaveBeenCalledWith(orderStatusHistory);
		expect(insertValues).toHaveBeenCalledWith(
			orderStatusHistory,
			expect.objectContaining({
				orderId: 7,
				statusId: ORDER_STATUSES[OrderStatus.IN_PROGRESS].id,
				changedById: 41,
				comment: "DTM accepted the submitted order",
			}),
		);
	});

	it("moves an accepted forecast program from sent to DTM into progress", async () => {
		const { query, insertValues, tx } = createDtmQuery("forecast_programs", {
			statusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id,
			programNumber: "PRG-ABCDEFGHIJ",
			createdByUserId: 85,
		});

		await expect(
			query.completeSimulatorRequest(16, "ACCEPTED"),
		).resolves.toEqual({
			relatedEntityType: "forecast_programs",
			relatedEntityId: 7,
			relatedEntityCode: "PRG-ABCDEFGHIJ",
			createdByUserId: 41,
			relatedEntityOwnerUserId: 85,
		});

		expect(tx.update).toHaveBeenNthCalledWith(2, forecastPrograms);
		expect(tx.insert).toHaveBeenCalledWith(forecastProgramHistory);
		expect(insertValues).toHaveBeenCalledWith(
			forecastProgramHistory,
			expect.objectContaining({
				programId: 7,
				eventType: "STATUS_CHANGED",
				oldStatusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id,
				newStatusId: PROGRAM_STATUSES[ProgramStatus.IN_PROGRESS].id,
				changedByUserId: 41,
				reason: "DTM accepted the submitted program",
			}),
		);
	});
});
