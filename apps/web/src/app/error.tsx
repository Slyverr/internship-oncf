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
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import {
	isApiUnavailableError,
	isSerializedApiUnavailableError,
} from "@/lib/api-availability";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslate();
	const apiUnavailable =
		isSerializedApiUnavailableError(error) || isApiUnavailableError(error);
	useEffect(() => {
		console.error(error);
	}, [error]);

	useEffect(() => {
		if (!apiUnavailable) return;

		let probing = false;
		const recoverWhenApiReturns = async () => {
			if (probing || document.visibilityState === "hidden") return;
			probing = true;
			try {
				const response = await fetch("/api/proxy/health", {
					cache: "no-store",
					signal: AbortSignal.timeout(3_000),
				});
				if (response.ok) reset();
			} catch {
				// Keep the error page in place until the API becomes healthy.
			} finally {
				probing = false;
			}
		};

		const interval = window.setInterval(recoverWhenApiReturns, 5_000);
		window.addEventListener("online", recoverWhenApiReturns);
		document.addEventListener("visibilitychange", recoverWhenApiReturns);
		void recoverWhenApiReturns();

		return () => {
			window.clearInterval(interval);
			window.removeEventListener("online", recoverWhenApiReturns);
			document.removeEventListener("visibilitychange", recoverWhenApiReturns);
		};
	}, [apiUnavailable, reset]);

	return (
		<main className="grid min-h-svh place-items-center bg-background p-4 sm:p-6">
			<Card className="w-full max-w-xl">
				<CardHeader className="items-center text-center">
					<span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
						<CircleAlertIcon aria-hidden="true" className="size-6" />
					</span>
					<CardTitle className="text-xl">
						{t(Messages.errorPage.title)}
					</CardTitle>
					<CardDescription role="alert">
						{apiUnavailable
							? t(Messages.errorPage.apiUnavailableDetails)
							: t(Messages.errorPage.description)}
					</CardDescription>
				</CardHeader>
				<CardContent className="items-center">
					<p className="text-center text-sm text-muted-foreground">
						{apiUnavailable
							? t(Messages.transport.apiUnavailable)
							: t(Messages.errorPage.formSubmitted)}
					</p>
				</CardContent>
				<CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-center">
					{!apiUnavailable && (
						<Button
							nativeButton={false}
							type="button"
							variant="outline"
							render={<Link href="/login" />}
							className="w-full sm:w-auto"
						>
							{t(Messages.errorPage.signIn)}
						</Button>
					)}
					<Button type="button" onClick={reset} className="w-full sm:w-auto">
						<RefreshCwIcon aria-hidden="true" />
						{t(Messages.errorPage.retry)}
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
