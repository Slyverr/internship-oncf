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
import { inArray } from "drizzle-orm";
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
} from "src/database/reference-data";

export type DatabaseClient = NodePgDatabase<typeof relations>;

export async function seedReferenceData(db: DatabaseClient) {
	await db.transaction(async (tx) => {
		await seedSimpleTables(tx);
		await deactivateLegacyUnits(tx);
		await seedRolePermissions(tx);
		await seedParametrization(tx);
	});
}

async function seedSimpleTables(tx: DatabaseClient) {
	const tables = [
		{ table: roles, data: ROLES },
		{ table: permissions, data: PERMISSIONS },
		{ table: customerTypes, data: CUSTOMER_TYPES },
		{ table: goodsTypes, data: GOODS_TYPES },
		{ table: attributes, data: ATTRIBUTES },
		{ table: orderStatus, data: ORDER_STATUSES },
		{ table: programStatus, data: PROGRAM_STATUSES },
		{ table: claimTypes, data: CLAIM_TYPES },
		{ table: claimStatus, data: CLAIM_STATUSES },
		{ table: movementTypes, data: MOVEMENT_TYPES },
		{ table: pickupLocationTypes, data: PICKUP_LOCATION_TYPES },
		{ table: dispatchTypes, data: DISPATCH_TYPES },
		{ table: rejectionReasons, data: REJECTION_REASONS },
		{ table: notificationTypes, data: NOTIFICATION_TYPES },
		{ table: notificationChannels, data: NOTIFICATION_CHANNELS },
		{ table: dtmRequestTypes, data: DTM_REQUEST_TYPES },
		{ table: accessoryOperations, data: ACCESSORY_OPERATIONS },
		{ table: units, data: UNITS },
	];

	for (const { table, data } of tables) {
		for (const item of Object.values(data)) {
			const values = { ...item, isActive: true };
			await tx.insert(table).values(values).onConflictDoUpdate({
				target: table.id,
				set: values,
			});
		}
	}
}

async function deactivateLegacyUnits(tx: DatabaseClient) {
	if (LEGACY_UNITS.length === 0) return;
	await tx
		.update(units)
		.set({ isActive: false })
		.where(inArray(units.name, LEGACY_UNITS));
}

async function seedRolePermissions(tx: DatabaseClient) {
	for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
		const roleId = ROLES[role as keyof typeof ROLES].id;
		const permissionIds =
			perms === "ALL"
				? Object.values(PERMISSIONS).map((p) => p.id)
				: perms.map((p) => PERMISSIONS[p].id);

		for (const permissionId of permissionIds) {
			await tx
				.insert(rolePermissions)
				.values({ roleId, permissionId })
				.onConflictDoNothing();
		}
	}
}

async function seedParametrization(tx: DatabaseClient) {
	const attrIdByName = new Map(ATTRIBUTES.map((a) => [a.name, a.id]));

	for (const [goodsTypeName, requiredAttrs] of Object.entries(
		PARAMETRIZATION,
	)) {
		const goodsTypeId =
			GOODS_TYPES[goodsTypeName as keyof typeof GOODS_TYPES]?.id;
		if (!goodsTypeId) continue;

		for (const { attributeName, isRequired } of requiredAttrs) {
			const attributeId = attrIdByName.get(attributeName);
			if (!attributeId) continue;

			await tx
				.insert(parametrization)
				.values({ goodsTypeId, attributeId, isRequired })
				.onConflictDoUpdate({
					target: [parametrization.goodsTypeId, parametrization.attributeId],
					set: { isRequired },
				});
		}
	}
}
