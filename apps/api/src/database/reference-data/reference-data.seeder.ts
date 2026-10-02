import { Role } from "@ecommand/shared";
import { relations } from "drizzle/relations";
import {
	accessoryOperations,
	attributes,
	claimStatus,
	claimTypes,
	customerTypes,
	dispatchTypes,
	dtmRequestTypes,
	goodsTypes,
	movementTypes,
	notificationChannels,
	notificationTypes,
	orderStatus,
	parametrization,
	permissions,
	pickupLocationTypes,
	programStatus,
	rejectionReasons,
	rolePermissions,
	roles,
	units,
} from "drizzle/schema";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	ACCESSORY_OPERATIONS,
	ATTRIBUTES,
	CLAIM_STATUSES,
	CLAIM_TYPES,
	CUSTOMER_TYPES,
	DISPATCH_TYPES,
	DTM_REQUEST_TYPES,
	GOODS_TYPES,
	LEGACY_UNITS,
	MOVEMENT_TYPES,
	NOTIFICATION_CHANNELS,
	NOTIFICATION_TYPES,
	ORDER_STATUSES,
	PARAMETRIZATION,
	PERMISSIONS,
	PICKUP_LOCATION_TYPES,
	PROGRAM_STATUSES,
	REJECTION_REASONS,
	ROLE_PERMISSIONS,
	ROLE_PERMISSIONS_MAP,
	ROLES,
	UNITS,
} from "@/database/reference-data";

export type DatabaseClient = NodePgDatabase<typeof relations>;

const referenceTables = [
	{ table: roles, data: ROLES, key: roles.name },
	{ table: permissions, data: PERMISSIONS, key: permissions.name },
	{ table: customerTypes, data: CUSTOMER_TYPES, key: customerTypes.name },
	{ table: attributes, data: ATTRIBUTES, key: attributes.name },
	{ table: orderStatus, data: ORDER_STATUSES, key: orderStatus.name },
	{ table: programStatus, data: PROGRAM_STATUSES, key: programStatus.name },
	{ table: claimTypes, data: CLAIM_TYPES, key: claimTypes.name },
	{ table: claimStatus, data: CLAIM_STATUSES, key: claimStatus.name },
	{ table: movementTypes, data: MOVEMENT_TYPES, key: movementTypes.name },
	{
		table: pickupLocationTypes,
		data: PICKUP_LOCATION_TYPES,
		key: pickupLocationTypes.name,
	},
	{ table: dispatchTypes, data: DISPATCH_TYPES, key: dispatchTypes.name },
	{
		table: notificationTypes,
		data: NOTIFICATION_TYPES,
		key: notificationTypes.name,
	},
	{
		table: notificationChannels,
		data: NOTIFICATION_CHANNELS,
		key: notificationChannels.name,
	},
	{
		table: dtmRequestTypes,
		data: DTM_REQUEST_TYPES,
		key: dtmRequestTypes.name,
	},
] as const;

const adminManagedCatalogTables = [
	{ table: goodsTypes, data: GOODS_TYPES },
	{ table: rejectionReasons, data: REJECTION_REASONS },
	{ table: accessoryOperations, data: ACCESSORY_OPERATIONS },
	{ table: units, data: UNITS },
] as const;

export async function seedReferenceData(db: DatabaseClient) {
	await db.transaction(async (tx) => {
		await seedReferenceTables(tx);
		await deactivateLegacyUnits(tx);
		await seedRolePermissions(tx);
		await seedParametrization(tx);
	});
}

async function seedReferenceTables(tx: DatabaseClient) {
	for (const { table, data, key } of referenceTables) {
		for (const item of Object.values(data)) {
			await tx
				.insert(table)
				.values({
					...item,
					isActive: true,
				})
				.onConflictDoUpdate({
					target: key,
					set: {
						...item,
						isActive: true,
					},
				});
		}
	}

	for (const { table, data } of adminManagedCatalogTables) {
		for (const item of Object.values(data)) {
			await tx
				.insert(table)
				.values({
					...item,
					isActive: true,
				})
				.onConflictDoNothing();
		}
	}
}

async function deactivateLegacyUnits(tx: DatabaseClient) {
	if (!LEGACY_UNITS.length) return;

	await tx
		.update(units)
		.set({ isActive: false })
		.where(inArray(units.name, LEGACY_UNITS));
}

async function seedRolePermissions(tx: DatabaseClient) {
	if (!ROLE_PERMISSIONS.length) return;

	const adminPermissionIds = ROLE_PERMISSIONS_MAP[Role.ADMIN].map(
		({ permissionId }) => permissionId,
	);
	await tx
		.delete(rolePermissions)
		.where(
			and(
				eq(rolePermissions.roleId, ROLES[Role.ADMIN].id),
				notInArray(rolePermissions.permissionId, adminPermissionIds),
			),
		);

	await tx
		.insert(rolePermissions)
		.values(ROLE_PERMISSIONS)
		.onConflictDoNothing();
}

async function seedParametrization(tx: DatabaseClient) {
	if (!PARAMETRIZATION.length) return;

	await tx
		.insert(parametrization)
		.values(PARAMETRIZATION)
		.onConflictDoUpdate({
			target: [parametrization.goodsTypeId, parametrization.attributeId],
			set: {
				isRequired: true,
			},
		});
}
