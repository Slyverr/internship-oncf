import { Permission } from "@ecommand/shared";
import {
	BadgeAlertIcon,
	Building2Icon,
	CalendarIcon,
	HomeIcon,
	PackageIcon,
	UsersIcon,
} from "lucide-react";

export const sidebarRoutes = [
	{
		title: "Home",
		url: "/dashboard",
		icon: HomeIcon,
		exact: true,
	},
	{
		title: "Orders",
		url: "/dashboard/orders",
		icon: PackageIcon,
		exact: false,
		permission: Permission.ORDERS_READ,
	},
	{
		title: "Programs",
		url: "/dashboard/programs",
		icon: CalendarIcon,
		exact: false,
		permission: Permission.PROGRAMS_READ,
	},
	{
		title: "Claims",
		url: "/dashboard/claims",
		icon: BadgeAlertIcon,
		exact: false,
		permission: Permission.CLAIMS_READ,
	},
	{
		title: "Customers",
		url: "/dashboard/customers",
		icon: Building2Icon,
		exact: false,
		permission: Permission.CUSTOMERS_READ,
	},
	{
		title: "Users",
		url: "/dashboard/users",
		icon: UsersIcon,
		exact: false,
		permission: Permission.USERS_READ,
	},
];
