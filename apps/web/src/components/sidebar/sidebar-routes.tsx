import { HomeIcon, PackageIcon } from "lucide-react";

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
];
