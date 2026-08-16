import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const usersPart = defineRelationsPart(schema, (r) => ({
	users: {
		role: r.one.roles({
			from: r.users.roleId,
			to: r.roles.id,
		}),
		customer: r.one.customers({
			from: r.users.customerId,
			to: r.customers.id,
		}),
		agency: r.one.agencies({
			from: r.users.agencyId,
			to: r.agencies.id,
		}),
		userSessions: r.many.userSessions({
			from: r.users.id,
			to: r.userSessions.userId,
		}),
		userActivityLogs: r.many.userActivityLog({
			from: r.users.id,
			to: r.userActivityLog.userId,
		}),
		orders: r.many.orders({
			from: r.users.id,
			to: r.orders.userId,
		}),
		forecastProgramHistories: r.many.forecastProgramHistory({
			from: r.users.id,
			to: r.forecastProgramHistory.changedBy,
		}),
		orderStatusHistories: r.many.orderStatusHistory({
			from: r.users.id,
			to: r.orderStatusHistory.changedById,
		}),
		forecastPrograms_createdBy: r.many.forecastPrograms({
			from: r.users.id,
			to: r.forecastPrograms.createdBy,
			alias: "forecastPrograms_createdBy",
		}),
		forecastPrograms_realizedBy: r.many.forecastPrograms({
			from: r.users.id,
			to: r.forecastPrograms.realizedBy,
			alias: "forecastPrograms_realizedBy",
		}),
		orderExecutions: r.many.orderExecutions({
			from: r.users.id,
			to: r.orderExecutions.executedBy,
		}),
		orderFiles: r.many.orderFiles({
			from: r.users.id,
			to: r.orderFiles.uploadedBy,
		}),
		orderShares: r.many.orderShares({
			from: r.users.id,
			to: r.orderShares.sharedByUserId,
		}),
		orderDateModifications: r.many.orderDateModifications({
			from: r.users.id,
			to: r.orderDateModifications.modifiedById,
		}),
		claimFiles: r.many.claimFiles({
			from: r.users.id,
			to: r.claimFiles.uploadedBy,
		}),
		claims_userId: r.many.claims({
			from: r.users.id,
			to: r.claims.userId,
			alias: "claims_userId",
		}),
		claims_closedBy: r.many.claims({
			from: r.users.id,
			to: r.claims.closedBy,
			alias: "claims_closedBy",
		}),
		claimStatusHistories: r.many.claimStatusHistory({
			from: r.users.id,
			to: r.claimStatusHistory.changedBy,
		}),
		claimComments: r.many.claimComments({
			from: r.users.id,
			to: r.claimComments.userId,
		}),
		notifications: r.many.notifications({
			from: r.users.id,
			to: r.notifications.userId,
		}),
		passwordResetTokens: r.many.passwordResetTokens({
			from: r.users.id,
			to: r.passwordResetTokens.userId,
		}),
		dtmIntegrationLogs: r.many.dtmIntegrationLog({
			from: r.users.id,
			to: r.dtmIntegrationLog.createdBy,
		}),
		archivalExecutionLogs: r.many.archivalExecutionLog({
			from: r.users.id,
			to: r.archivalExecutionLog.triggeredByUserId,
		}),
		userCustomers: r.many.userCustomers({
			from: r.users.id,
			to: r.userCustomers.userId,
		}),
	},
}));

const rolesPart = defineRelationsPart(schema, (r) => ({
	roles: {
		users: r.many.users({
			from: r.roles.id,
			to: r.users.roleId,
		}),
		rolePermissions: r.many.rolePermissions({
			from: r.roles.id,
			to: r.rolePermissions.roleId,
		}),
	},
}));

const permissionsPart = defineRelationsPart(schema, (r) => ({
	permissions: {
		rolePermissions: r.many.rolePermissions({
			from: r.permissions.id,
			to: r.rolePermissions.permissionId,
		}),
	},
}));

const rolePermissionsPart = defineRelationsPart(schema, (r) => ({
	rolePermissions: {
		role: r.one.roles({
			from: r.rolePermissions.roleId,
			to: r.roles.id,
		}),
		permission: r.one.permissions({
			from: r.rolePermissions.permissionId,
			to: r.permissions.id,
		}),
	},
}));

const userSessionsPart = defineRelationsPart(schema, (r) => ({
	userSessions: {
		user: r.one.users({
			from: r.userSessions.userId,
			to: r.users.id,
		}),
	},
}));

const userActivityLogPart = defineRelationsPart(schema, (r) => ({
	userActivityLog: {
		user: r.one.users({
			from: r.userActivityLog.userId,
			to: r.users.id,
		}),
		customer: r.one.customers({
			from: r.userActivityLog.customerId,
			to: r.customers.id,
		}),
		agency: r.one.agencies({
			from: r.userActivityLog.agencyId,
			to: r.agencies.id,
		}),
	},
}));

const passwordResetTokensPart = defineRelationsPart(schema, (r) => ({
	passwordResetTokens: {
		user: r.one.users({
			from: r.passwordResetTokens.userId,
			to: r.users.id,
		}),
	},
}));

const userCustomersPart = defineRelationsPart(schema, (r) => ({
	userCustomers: {
		user: r.one.users({
			from: r.userCustomers.userId,
			to: r.users.id,
		}),
		customer: r.one.customers({
			from: r.userCustomers.customerId,
			to: r.customers.id,
		}),
	},
}));

export const usersRelations = {
	...usersPart,
	...rolesPart,
	...permissionsPart,
	...rolePermissionsPart,
	...userSessionsPart,
	...userActivityLogPart,
	...passwordResetTokensPart,
	...userCustomersPart,
};
