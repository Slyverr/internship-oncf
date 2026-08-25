import { OrderStatus, Permission } from "@ecommand/shared";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import {
	FindManyQueryOptions,
	QueryColumns,
	QueryRelations,
} from "@/database/drizzle.types";

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
	createdByUser: {
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

type EligibleProgramOrdersWhere = FindManyQueryOptions<"orders">["where"];

export function buildEligibleProgramOrdersFilters(
	user: AuthUser,
	query: ListQueryDto,
): EligibleProgramOrdersWhere {
	const filters: EligibleProgramOrdersWhere = {
		orderStatus: {
			name: {
				in: [
					OrderStatus.APPROVED,
					OrderStatus.SENT_TO_DTM,
					OrderStatus.IN_PROGRESS,
				],
			},
		},
	};

	if (!hasOnePermission(user, Permission.ORDERS_MANAGE_OTHER)) {
		filters.createdByUserId = user.id;
	}

	if (query.search) {
		filters.orderNumber = {
			ilike: `%${query.search}%`,
		};
	}

	return filters;
}

type EligibleProgramOrdersOrderBy = FindManyQueryOptions<"orders">["orderBy"];

export function buildEligibleProgramOrdersOrder(
	query: ListQueryDto,
): EligibleProgramOrdersOrderBy {
	const sortOrder = query.sortOrder ?? "desc";

	switch (query.sortBy) {
		case "orderNumber":
			return {
				orderNumber: sortOrder,
				id: sortOrder,
			};

		case "createdAt":
			return {
				createdAt: sortOrder,
				id: sortOrder,
			};

		default:
			return {
				orderDate: "desc",
				id: "desc",
			};
	}
}

export function buildEligibleProgramOrdersQuery(
	user: AuthUser,
	query: ListQueryDto,
) {
	return {
		where: buildEligibleProgramOrdersFilters(user, query),

		columns: {
			id: true,
			orderNumber: true,
			quantityDemanded: true,
		},

		orderBy: buildEligibleProgramOrdersOrder(query),

		limit: query.limit,
		offset: (query.page - 1) * query.limit,
	} satisfies FindManyQueryOptions<"orders">;
}
