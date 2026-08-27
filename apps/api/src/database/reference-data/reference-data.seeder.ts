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
import { eq, inArray } from "drizzle-orm";
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
	ROLES,
	UNITS,
} from "@/database/reference-data";

export type DatabaseClient = NodePgDatabase<typeof relations>;

const referenceTables = [
	{ table: roles, data: ROLES, key: roles.name },
	{ table: permissions, data: PERMISSIONS, key: permissions.name },
	{ table: customerTypes, data: CUSTOMER_TYPES, key: customerTypes.name },
	{ table: goodsTypes, data: GOODS_TYPES, key: goodsTypes.name },
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
		table: rejectionReasons,
		data: REJECTION_REASONS,
		key: rejectionReasons.name,
	},
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
	{
		table: accessoryOperations,
		data: ACCESSORY_OPERATIONS,
		key: accessoryOperations.name,
	},
	{ table: units, data: UNITS, key: units.name },
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
}

async function deactivateLegacyUnits(tx: DatabaseClient) {
	if (!LEGACY_UNITS.length) return;

	await tx
		.update(units)
		.set({ isActive: false })
		.where(inArray(units.name, LEGACY_UNITS));
}

async function seedRolePermissions(tx: DatabaseClient) {
	for (const [roleName, permissionsList] of Object.entries(ROLE_PERMISSIONS)) {
		const roleId = ROLES[roleName].id;

		await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

		const permissionIds =
			permissionsList === "ALL"
				? Object.values(PERMISSIONS).map(({ id }) => id)
				: permissionsList.map((permission) => PERMISSIONS[permission].id);

		if (!permissionIds.length) continue;

		await tx.insert(rolePermissions).values(
			permissionIds.map((permissionId) => ({
				roleId,
				permissionId,
			})),
		);
	}
}

async function seedParametrization(tx: DatabaseClient) {
	const goodsTypeIds = new Map(
		Object.values(GOODS_TYPES).map(({ id, name }) => [name, id]),
	);

	const attributeIds = new Map(
		Object.values(ATTRIBUTES).map(({ id, name }) => [name, id]),
	);

	for (const [goodsType, requiredAttributes] of Object.entries(
		PARAMETRIZATION,
	)) {
		const goodsTypeId = goodsTypeIds.get(goodsType);
		if (!goodsTypeId) continue;

		for (const { attributeName, isRequired } of requiredAttributes) {
			const attributeId = attributeIds.get(attributeName);
			if (!attributeId) continue;

			await tx
				.insert(parametrization)
				.values({
					goodsTypeId,
					attributeId,
					isRequired,
				})
				.onConflictDoUpdate({
					target: [parametrization.goodsTypeId, parametrization.attributeId],
					set: {
						isRequired,
					},
				});
		}
	}
}
