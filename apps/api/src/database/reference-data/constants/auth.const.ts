import {
	DEFAULT_ROLE_PERMISSIONS,
	PERMISSION_DEFINITIONS,
	Role,
	RolePersona,
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
		[Role.ADMIN]: "Manages accounts, access rights, and reports",
		[Role.CLIENT_REPRESENTATIVE]:
			"Client-facing representative with order and claims management",
		[Role.AGENT_COMMERCIAL]:
			"Commercial agent with full order lifecycle and customer management",
	},
	(name, description) => ({
		...defaultReferenceMapper(ROLES_SCOPE)(name, description),
		isSystem: true,
		persona: {
			[Role.ADMIN]: RolePersona.ADMIN,
			[Role.AGENT_COMMERCIAL]: RolePersona.AGENT_COMMERCIAL,
			[Role.CLIENT_REPRESENTATIVE]: RolePersona.CLIENT_REPRESENTATIVE,
		}[name as Role],
	}),
);

export const PERMISSIONS = createReferenceMap(
	PERMISSION_DEFINITIONS,
	(name, { parent }) => ({
		id: createReferenceId(PERMISSIONS_SCOPE, name),
		name,
		parentId: parent ? createReferenceId(PERMISSIONS_SCOPE, parent) : undefined,
	}),
);

export const ROLE_PERMISSIONS_MAP = createReferenceMap(
	DEFAULT_ROLE_PERMISSIONS,
	(roleName, permissions) => {
		const roleId = ROLES[roleName as Role].id;

		return permissions.map((perm) => ({
			roleId,
			permissionId: PERMISSIONS[perm].id,
		}));
	},
);

export const ROLE_PERMISSIONS = Object.values(ROLE_PERMISSIONS_MAP).flat();
