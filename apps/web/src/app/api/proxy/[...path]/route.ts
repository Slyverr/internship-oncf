import { API_TRANSPORT_ERROR_CODES } from "@ecommand/shared";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type NodeRequestInit = RequestInit & {
	duplex?: "half";
};

async function handler(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const token = (await cookies()).get("access_token")?.value;
	const contentType = req.headers.get("content-type");
	const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

	let res: Response;
	try {
		res = await fetch(`${backendUrl}/${path.join("/")}${req.nextUrl.search}`, {
			method: req.method,
			headers: {
				...(contentType && { "content-type": contentType }),
				...(token && { authorization: `Bearer ${token}` }),
			},
			body:
				req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
			duplex: "half",
		} as NodeRequestInit);
	} catch {
		return NextResponse.json(
			{
				code: API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE,
				statusCode: 503,
			},
			{ status: 503 },
		);
	}

	const responseContentType = res.headers.get("content-type");
	const contentDisposition = res.headers.get("content-disposition");

	return new NextResponse(res.body, {
		status: res.status,
		headers: {
			...(responseContentType && {
				"content-type": responseContentType,
			}),
			...(responseContentType?.includes("text/event-stream") && {
				"cache-control": "no-cache, no-transform",
				"x-accel-buffering": "no",
			}),
			...(contentDisposition && {
				"content-disposition": contentDisposition,
			}),
		},
	});
}

export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as PATCH,
	handler as DELETE,
};
