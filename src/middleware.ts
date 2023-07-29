import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
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

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/groups/:path*", "/join-group"],
};
