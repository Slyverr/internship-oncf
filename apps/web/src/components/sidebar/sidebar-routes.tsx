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
	},
	{
		title: "Programs",
		url: "/dashboard/programs",
		icon: CalendarIcon,
		exact: false,
	},
	{
		title: "Claims",
		url: "/dashboard/claims",
		icon: BadgeAlertIcon,
		exact: false,
	},
	{
		title: "Customers",
		url: "/dashboard/customers",
		icon: Building2Icon,
		exact: false,
	},
	{
		title: "Users",
		url: "/dashboard/users",
		icon: UsersIcon,
		exact: false,
	},
];
