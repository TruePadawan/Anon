import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Prevent unsigned client from accessing /groups/* and /join-group route
export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
		raw: true,
	});

	if (!token) {
		// redirect unsigned client to no-access route
		return NextResponse.redirect(new URL("/no-access", request.url));
	}
}

export const config = {
	matcher: ["/groups/:path*", "/join-group"],
};
