import { Injectable, OnModuleInit } from "@nestjs/common";
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
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import {
	AccessoryOperation,
	ATTRIBUTES,
	ClaimStatus,
	ClaimType,
	CustomerType,
	DispatchType,
	DtmRequestType,
	GoodsType,
	LEGACY_UNITS,
	MovementType,
	NotificationChannel,
	NotificationType,
	OrderStatus,
	PARAMETRIZATION,
	Permission,
	PickupLocationType,
	ProgramStatus,
	RejectionReason,
	ROLE_PERMISSIONS,
	Role,
	Unit,
} from ".";

@Injectable()
export class ReferenceDataSeederService implements OnModuleInit {
	constructor(private drizzle: DrizzleService) {}

	async onModuleInit() {
		await this.seedRoles();
		await this.seedPermissions();
		await this.seedRolePermissions();
		await this.seedCustomerTypes();
		await this.seedGoodsTypes();
		await this.seedAttributes();
		await this.seedParametrization();
		await this.seedOrderStatus();
		await this.seedProgramStatus();
		await this.seedClaimTypes();
		await this.seedClaimStatus();
		await this.seedMovementTypes();
		await this.seedPickupLocationTypes();
		await this.seedDispatchTypes();
		await this.seedRejectionReasons();
		await this.seedNotificationTypes();
		await this.seedNotificationChannels();
		await this.seedDtmRequestTypes();
		await this.seedAccessoryOperations();
		await this.seedUnits();
	}

	private async seedRoles() {
		for (const [name] of Object.entries(Role)) {
			await this.drizzle.db
				.insert(roles)
				.values({ name, description: `${name} role`, isActive: true })
				.onConflictDoNothing({ target: roles.name });
		}
	}

	private async seedPermissions() {
		for (const name of Object.values(Permission)) {
			await this.drizzle.db
				.insert(permissions)
				.values({
					name,
					description: `Permission to ${name.replace(":", " ")}`,
					isActive: true,
				})
				.onConflictDoNothing({ target: permissions.name });
		}
	}

	private async seedRolePermissions() {
		for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
			const role = await this.drizzle.db.query.roles.findFirst({
				where: { name: roleName },
			});
			if (!role) continue;

			const permissionList =
				perms === "ALL" ? Object.values(Permission) : perms;

			for (const permName of permissionList) {
				const perm = await this.drizzle.db.query.permissions.findFirst({
					where: { name: permName },
				});
				if (!perm) continue;

				await this.drizzle.db
					.insert(rolePermissions)
					.values({ roleId: role.id, permissionId: perm.id })
					.onConflictDoNothing();
			}
		}
	}

	private async seedCustomerTypes() {
		for (const name of Object.values(CustomerType)) {
			await this.drizzle.db
				.insert(customerTypes)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: customerTypes.name });
		}
	}

	private async seedGoodsTypes() {
		for (const name of Object.values(GoodsType)) {
			await this.drizzle.db
				.insert(goodsTypes)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: goodsTypes.name });
		}
	}

	private async seedAttributes() {
		for (const attr of ATTRIBUTES) {
			await this.drizzle.db
				.insert(attributes)
				.values({
					name: attr.name,
					dataType: attr.dataType,
					isActive: true,
				})
				.onConflictDoNothing({ target: attributes.name });
		}
	}

	private async seedParametrization() {
		for (const [goodsTypeName, requiredAttrs] of Object.entries(
			PARAMETRIZATION,
		)) {
			const goodsType = await this.drizzle.db.query.goodsTypes.findFirst({
				where: { name: goodsTypeName },
			});
			if (!goodsType) continue;

			for (const { attributeName, isRequired } of requiredAttrs) {
				const attr = await this.drizzle.db.query.attributes.findFirst({
					where: { name: attributeName },
				});
				if (!attr) continue;

				await this.drizzle.db
					.insert(parametrization)
					.values({
						goodsTypeId: goodsType.id,
						attributeId: attr.id,
						isRequired,
					})
					.onConflictDoNothing();
			}
		}
	}

	private async seedOrderStatus() {
		for (const name of Object.values(OrderStatus)) {
			await this.drizzle.db
				.insert(orderStatus)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: orderStatus.name });
		}
	}

	private async seedProgramStatus() {
		for (const name of Object.values(ProgramStatus)) {
			await this.drizzle.db
				.insert(programStatus)
				.values({
					name,
					description: `${name} status`,
					isActive: true,
				})
				.onConflictDoNothing({ target: programStatus.name });
		}
	}

	private async seedClaimTypes() {
		for (const name of Object.values(ClaimType)) {
			await this.drizzle.db
				.insert(claimTypes)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: claimTypes.name });
		}
	}

	private async seedClaimStatus() {
		for (const name of Object.values(ClaimStatus)) {
			await this.drizzle.db
				.insert(claimStatus)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: claimStatus.name });
		}
	}

	private async seedMovementTypes() {
		for (const name of Object.values(MovementType)) {
			await this.drizzle.db
				.insert(movementTypes)
				.values({
					name,
					description: `${name} movement`,
					isActive: true,
				})
				.onConflictDoNothing({ target: movementTypes.name });
		}
	}

	private async seedPickupLocationTypes() {
		for (const name of Object.values(PickupLocationType)) {
			await this.drizzle.db
				.insert(pickupLocationTypes)
				.values({
					name,
					description: `${name} location`,
					isActive: true,
				})
				.onConflictDoNothing({ target: pickupLocationTypes.name });
		}
	}

	private async seedDispatchTypes() {
		for (const name of Object.values(DispatchType)) {
			await this.drizzle.db
				.insert(dispatchTypes)
				.values({
					name,
					description: `${name} dispatch`,
					isActive: true,
				})
				.onConflictDoNothing({ target: dispatchTypes.name });
		}
	}

	private async seedRejectionReasons() {
		for (const name of Object.values(RejectionReason)) {
			await this.drizzle.db
				.insert(rejectionReasons)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: rejectionReasons.name });
		}
	}

	private async seedNotificationTypes() {
		for (const name of Object.values(NotificationType)) {
			await this.drizzle.db
				.insert(notificationTypes)
				.values({
					name,
					description: `${name} notification`,
					isActive: true,
				})
				.onConflictDoNothing({ target: notificationTypes.name });
		}
	}

	private async seedNotificationChannels() {
		for (const name of Object.values(NotificationChannel)) {
			await this.drizzle.db
				.insert(notificationChannels)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: notificationChannels.name });
		}
	}

	private async seedDtmRequestTypes() {
		for (const name of Object.values(DtmRequestType)) {
			await this.drizzle.db
				.insert(dtmRequestTypes)
				.values({
					name,
					description: `${name} DTM request`,
					isActive: true,
				})
				.onConflictDoNothing({ target: dtmRequestTypes.name });
		}
	}

	private async seedAccessoryOperations() {
		for (const name of Object.values(AccessoryOperation)) {
			await this.drizzle.db
				.insert(accessoryOperations)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: accessoryOperations.name });
		}
	}

	private async seedUnits() {
		for (const name of Object.values(Unit)) {
			await this.drizzle.db
				.insert(units)
				.values({ name, isActive: true })
				.onConflictDoNothing({ target: units.name });
		}

		for (const name of LEGACY_UNITS) {
			await this.drizzle.db
				.update(units)
				.set({ isActive: false })
				.where(eq(units.name, name));
		}
	}
}
