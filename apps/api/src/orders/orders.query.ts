import { QueryColumns, QueryRelations } from "src/db/drizzle.types";

type OrdersColumns = QueryColumns<"orders">;
type OrdersRelations = QueryRelations<"orders">;

export const orderListColumns = {
	id: true,
	orderNumber: true,
	quantityDemanded: true,
	quantityAchieved: true,
	orderDate: true,
	startDate: true,
	endDate: true,
	createdAt: true,
} satisfies OrdersColumns;

export const orderListRelations = {
	createdBy: {
		columns: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},

	orderStatus: {
		columns: {
			id: true,
			name: true,
		},
	},

	customer: {
		columns: {
			id: true,
			companyName: true,
		},
	},

	good: {
		columns: {
			id: true,
			name: true,
		},
	},

	unit: {
		columns: {
			name: true,
		},
	},
} satisfies OrdersRelations;

export const orderDetailRelations = {
	...orderListRelations,

	claims: true,
	forecastPrograms: true,
	orderStatusHistories: true,
	orderExecutions: true,
	orderFiles: true,
} satisfies OrdersRelations;
