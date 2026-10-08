import { CATALOG_MANAGEMENT_REQUIREMENTS, Permission } from "@ecommand/shared";
import type { LucideIcon } from "lucide-react";
import {
	ActivityIcon,
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
	navigationGroup?: "integrations";
};

type SidebarRouteGroup = {
	kind: "group";
	id: "integrations";
	url: string;
	titleKey: MessageKey;
	icon: LucideIcon;
	children: SidebarRoute[];
};

export type SidebarNavigationItem = SidebarRoute | SidebarRouteGroup;

export function isSidebarRouteActive(
	route: Pick<SidebarRoute, "url" | "exact">,
	pathname: string | null,
) {
	return route.exact
		? pathname === route.url
		: pathname === route.url || pathname?.startsWith(`${route.url}/`) === true;
}

export function isSidebarNavigationItemActive(
	item: SidebarNavigationItem,
	pathname: string | null,
) {
	return "kind" in item
		? item.children.some((route) => isSidebarRouteActive(route, pathname))
		: isSidebarRouteActive(item, pathname);
}

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
		titleKey: Messages.navigation.integrationOverview,
		url: "/dashboard/integrations",
		icon: Building2Icon,
		exact: true,
		permission: Permission.INTEGRATIONS_MANAGE,
		navigationGroup: "integrations",
	},
	{
		titleKey: Messages.navigation.integrationCredentials,
		url: "/dashboard/integrations/credentials",
		icon: KeyRoundIcon,
		exact: false,
		permission: Permission.INTEGRATIONS_MANAGE,
		navigationGroup: "integrations",
	},
	{
		titleKey: Messages.navigation.dtmActivity,
		url: "/dashboard/integrations/dtm",
		icon: ActivityIcon,
		exact: false,
		permission: Permission.INTEGRATIONS_MANAGE,
		navigationGroup: "integrations",
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

export function getVisibleSidebarNavigation(
	hasPermission: (permission: Permission) => boolean,
): SidebarNavigationItem[] {
	const visibleRoutes = getVisibleSidebarRoutes(hasPermission);
	const integrationRoutes = visibleRoutes.filter(
		(route) => route.navigationGroup === "integrations",
	);
	const integrationOverview = integrationRoutes.find(
		(route) => route.url === "/dashboard/integrations",
	);
	if (!integrationOverview) {
		return visibleRoutes.filter(
			(route) => route.navigationGroup !== "integrations",
		);
	}
	let groupAdded = false;

	return visibleRoutes.flatMap<SidebarNavigationItem>((route) => {
		if (route.navigationGroup !== "integrations") return [route];
		if (groupAdded) return [];
		groupAdded = true;
		return [
			{
				kind: "group",
				id: "integrations",
				url: integrationOverview.url,
				titleKey: Messages.navigation.integrations,
				icon: KeyRoundIcon,
				children: integrationRoutes,
			},
		];
	});
}
