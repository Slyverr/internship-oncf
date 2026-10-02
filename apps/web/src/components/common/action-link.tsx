import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ActionLinkProps = {
	href: ComponentProps<typeof Link>["href"];
	children: ReactNode;
	className?: string;
	"aria-label"?: string;
};

export function ActionLink({
	href,
	children,
	className,
	"aria-label": ariaLabel,
}: ActionLinkProps) {
	return (
		<Button
			variant="link"
			className={className}
			aria-label={ariaLabel}
			nativeButton={false}
			render={<Link href={href} />}
		>
			{children}
		</Button>
	);
}
