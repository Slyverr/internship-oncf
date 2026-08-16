import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const customersPart = defineRelationsPart(schema, (r) => ({
	customers: {
		customerType: r.one.customerTypes({
			from: r.customers.typeId,
			to: r.customerTypes.id,
		}),
		users: r.many.users({
			from: r.customers.id,
			to: r.users.customerId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.customers.id,
			to: r.userActivityLog.customerId,
		}),
		orders_customerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.customerId,
			alias: "orders_customerId",
		}),
		orders_debtorCustomerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.debtorCustomerId,
			alias: "orders_debtorCustomerId",
		}),
		orders_destinationCustomerId: r.many.orders({
			from: r.customers.id,
			to: r.orders.destinationCustomerId,
			alias: "orders_destinationCustomerId",
		}),
		claims: r.many.claims({
			from: r.customers.id,
			to: r.claims.customerId,
		}),
		userCustomers: r.many.userCustomers({
			from: r.customers.id,
			to: r.userCustomers.customerId,
		}),
	},
}));

const customerTypesPart = defineRelationsPart(schema, (r) => ({
	customerTypes: {
		customers: r.many.customers({
			from: r.customerTypes.id,
			to: r.customers.typeId,
		}),
	},
}));

const agenciesPart = defineRelationsPart(schema, (r) => ({
	agencies: {
		centers: r.many.centers({
			from: r.agencies.id,
			to: r.centers.agencyId,
		}),
		users: r.many.users({
			from: r.agencies.id,
			to: r.users.agencyId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.agencies.id,
			to: r.userActivityLog.agencyId,
		}),
		orderShares: r.many.orderShares({
			from: r.agencies.id,
			to: r.orderShares.agencyId,
		}),
	},
}));

const centersPart = defineRelationsPart(schema, (r) => ({
	centers: {
		agency: r.one.agencies({
			from: r.centers.agencyId,
			to: r.agencies.id,
		}),
	},
}));

export const customersRelations = {
	...customersPart,
	...customerTypesPart,
	...agenciesPart,
	...centersPart,
};
