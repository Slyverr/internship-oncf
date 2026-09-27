"use client";

import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="grid min-h-svh place-items-center bg-background p-4 sm:p-6">
			<Card className="w-full max-w-xl">
				<CardHeader className="items-center text-center">
					<span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
						<CircleAlertIcon aria-hidden="true" className="size-6" />
					</span>
					<CardTitle className="text-xl">
						This page ran into a problem
					</CardTitle>
					<CardDescription role="alert">
						Try loading it again. If the problem continues, sign in again or
						come back in a moment.
					</CardDescription>
				</CardHeader>
				<CardContent className="items-center">
					<p className="text-center text-sm text-muted-foreground">
						If you were submitting a form, check whether it completed before
						trying again.
					</p>
				</CardContent>
				<CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-center">
					<Button
						type="button"
						variant="outline"
						render={<Link href="/login" />}
						className="w-full sm:w-auto"
					>
						Go to sign in
					</Button>
					<Button type="button" onClick={reset} className="w-full sm:w-auto">
						<RefreshCwIcon aria-hidden="true" />
						Try again
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
