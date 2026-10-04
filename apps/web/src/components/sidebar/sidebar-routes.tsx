import { CATALOG_MANAGEMENT_REQUIREMENTS, Permission } from "@ecommand/shared";
import type { LucideIcon } from "lucide-react";
import {
	BadgeAlertIcon,
	Building2Icon,
	CalendarIcon,
	ChartNoAxesCombinedIcon,
	DatabaseIcon,
	HomeIcon,
	KeyRoundIcon,
	MapPinIcon,
	PackageIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import { type MessageKey, Messages } from "@/i18n";

type SidebarRoute = {
	titleKey: MessageKey;
	url: string;
	icon: LucideIcon;
	exact: boolean;
	permission?: Permission;
	anyPermissionGroups?: readonly (readonly Permission[])[];
};

export const sidebarRoutes: SidebarRoute[] = [
	{
		titleKey: Messages.navigation.home,
		url: "/dashboard",
		icon: HomeIcon,
		exact: true,
	},
	{
		titleKey: Messages.navigation.orders,
		url: "/dashboard/orders",
		icon: PackageIcon,
		exact: false,
		permission: Permission.ORDERS_READ,
	},
	{
		titleKey: Messages.navigation.programs,
		url: "/dashboard/programs",
		icon: CalendarIcon,
		exact: false,
		permission: Permission.PROGRAMS_READ,
	},
	{
		titleKey: Messages.navigation.tracking,
		url: "/dashboard/tracking",
		icon: MapPinIcon,
		exact: false,
		anyPermissionGroups: [[Permission.TRACKING_READ, Permission.ORDERS_READ]],
	},
	{
		titleKey: Messages.navigation.reports,
		url: "/dashboard/reports",
		icon: ChartNoAxesCombinedIcon,
		exact: false,
		permission: Permission.REPORTS_READ,
	},
	{
		titleKey: Messages.navigation.claims,
		url: "/dashboard/claims",
		icon: BadgeAlertIcon,
		exact: false,
		permission: Permission.CLAIMS_READ,
	},
	{
		titleKey: Messages.navigation.customers,
		url: "/dashboard/customers",
		icon: Building2Icon,
		exact: false,
		permission: Permission.CUSTOMERS_READ,
	},
	{
		titleKey: Messages.navigation.users,
		url: "/dashboard/users",
		icon: UsersIcon,
		exact: false,
		permission: Permission.USERS_READ,
	},
	{
		titleKey: Messages.navigation.roleProfiles,
		url: "/dashboard/roles",
		icon: ShieldCheckIcon,
		exact: false,
		permission: Permission.ROLES_MANAGE,
	},
	{
		titleKey: Messages.navigation.integrations,
		url: "/dashboard/integrations",
		icon: KeyRoundIcon,
		exact: false,
		permission: Permission.INTEGRATIONS_MANAGE,
	},
	{
		titleKey: Messages.navigation.referenceData,
		url: "/dashboard/catalog",
		icon: DatabaseIcon,
		exact: false,
		anyPermissionGroups: Object.values(CATALOG_MANAGEMENT_REQUIREMENTS),
	},
];

export function getVisibleSidebarRoutes(
	hasPermission: (permission: Permission) => boolean,
) {
	return sidebarRoutes.filter(
		(route) =>
			(!route.permission && !route.anyPermissionGroups) ||
			(route.permission ? hasPermission(route.permission) : false) ||
			(route.anyPermissionGroups?.some((group) => group.every(hasPermission)) ??
				false),
	);
}
