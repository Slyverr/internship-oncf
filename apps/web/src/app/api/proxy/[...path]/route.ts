import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token")?.value;

	const url = `${process.env.BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;
	const body =
		req.method !== "GET" && req.method !== "DELETE"
			? await req.text()
			: undefined;

	const res = await fetch(url, {
		method: req.method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body,
	});

	const data = await res.text();
	return new NextResponse(data, {
		status: res.status,
		headers: { "Content-Type": "application/json" },
	});
}

export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as PATCH,
	handler as DELETE,
};
