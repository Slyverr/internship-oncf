import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const forecastProgramsPart = defineRelationsPart(schema, (r) => ({
	forecastPrograms: {
		forecastProgramHistories: r.many.forecastProgramHistory({
			from: r.forecastPrograms.id,
			to: r.forecastProgramHistory.programId,
		}),
		order: r.one.orders({
			from: r.forecastPrograms.orderId,
			to: r.orders.id,
		}),
		programStatus: r.one.programStatus({
			from: r.forecastPrograms.statusId,
			to: r.programStatus.id,
		}),
		createdByUser: r.one.users({
			from: r.forecastPrograms.createdByUserId,
			to: r.users.id,
			alias: "forecastPrograms_createdByUserId",
		}),
		realizedByUser: r.one.users({
			from: r.forecastPrograms.realizedByUserId,
			to: r.users.id,
			alias: "forecastPrograms_realizedByUserId",
		}),
		orderWagons: r.many.orderWagons({
			from: r.forecastPrograms.id,
			to: r.orderWagons.forecastProgramId,
		}),
		programConvois: r.many.programConvoi({
			from: r.forecastPrograms.id,
			to: r.programConvoi.forecastProgramId,
		}),
	},
}));

const forecastProgramHistoryPart = defineRelationsPart(schema, (r) => ({
	forecastProgramHistory: {
		forecastProgram: r.one.forecastPrograms({
			from: r.forecastProgramHistory.programId,
			to: r.forecastPrograms.id,
		}),
		changedByUser: r.one.users({
			from: r.forecastProgramHistory.changedByUserId,
			to: r.users.id,
		}),
		oldStatus: r.one.programStatus({
			from: r.forecastProgramHistory.oldStatusId,
			to: r.programStatus.id,
			alias: "oldStatus",
		}),
		newStatus: r.one.programStatus({
			from: r.forecastProgramHistory.newStatusId,
			to: r.programStatus.id,
			alias: "newStatus",
		}),
	},
}));

const programStatusPart = defineRelationsPart(schema, (r) => ({
	programStatus: {
		oldStatusHistories: r.many.forecastProgramHistory({
			from: r.programStatus.id,
			to: r.forecastProgramHistory.oldStatusId,
			alias: "oldStatusHistories",
		}),
		newStatusHistories: r.many.forecastProgramHistory({
			from: r.programStatus.id,
			to: r.forecastProgramHistory.newStatusId,
			alias: "newStatusHistories",
		}),
		forecastPrograms: r.many.forecastPrograms({
			from: r.programStatus.id,
			to: r.forecastPrograms.statusId,
		}),
	},
}));

const programConvoiPart = defineRelationsPart(schema, (r) => ({
	programConvoi: {
		forecastProgram: r.one.forecastPrograms({
			from: r.programConvoi.forecastProgramId,
			to: r.forecastPrograms.id,
		}),
		train: r.one.trains({
			from: r.programConvoi.trainId,
			to: r.trains.id,
		}),
	},
}));

export const forecastProgramsRelations = {
	...forecastProgramsPart,
	...forecastProgramHistoryPart,
	...programStatusPart,
	...programConvoiPart,
};
