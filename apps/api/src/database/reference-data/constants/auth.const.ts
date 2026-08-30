import {
	DEFAULT_ROLE_PERMISSIONS,
	PERMISSION_DEFINITIONS,
	Role,
} from "@ecommand/shared";
import {
	createReferenceId,
	createReferenceMap,
	defaultReferenceMapper,
} from "../reference-data.utils";

export const ROLES_SCOPE = "roles";
export const PERMISSIONS_SCOPE = "permissions";

export const ROLES = createReferenceMap(
	{
		[Role.ADMIN]: "Full system access with all permissions",
		[Role.CLIENT_REPRESENTATIVE]:
			"Client-facing representative with order and claims management",
		[Role.AGENT_COMMERCIAL]:
			"Commercial agent with full order lifecycle and customer management",
	},
	defaultReferenceMapper(ROLES_SCOPE),
);

export const PERMISSIONS = createReferenceMap(
	PERMISSION_DEFINITIONS,
	(name, { description, parent }) => ({
		id: createReferenceId(PERMISSIONS_SCOPE, name),
		name,
		description,
		parentId: parent ? createReferenceId(PERMISSIONS_SCOPE, parent) : undefined,
	}),
);

export const ROLE_PERMISSIONS_MAP = createReferenceMap(
	DEFAULT_ROLE_PERMISSIONS,
	(roleName, permissions) => {
		const roleId = ROLES[roleName as Role].id;

		if (permissions === "ALL") {
			return Object.values(PERMISSIONS).map((perm) => ({
				roleId,
				permissionId: perm.id,
			}));
		}

		return permissions.map((perm) => ({
			roleId,
			permissionId: PERMISSIONS[perm].id,
		}));
	},
);

export const ROLE_PERMISSIONS = Object.values(ROLE_PERMISSIONS_MAP).flat();
