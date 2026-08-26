import { NextResponse, type NextRequest } from "next/server";

import { shouldRedirectLandingToSignIn } from "@/lib/landing-routing";
import { updateSession } from "@/lib/supabase/middleware";

function redirectWithSessionCookies(response: NextResponse, url: URL) {
	const redirectResponse = NextResponse.redirect(url);
	for (const cookie of response.cookies.getAll()) {
		redirectResponse.cookies.set(cookie);
	}
	return redirectResponse;
}

export async function middleware(request: NextRequest) {
	const response = await updateSession(request);

	if (request.nextUrl.pathname !== "/") {
		return response;
	}

	const wantsLanding = request.nextUrl.searchParams.get("landing") === "1";
	const landingSeen = request.cookies.get("ecotienda-landing-seen")?.value === "1";
	if (shouldRedirectLandingToSignIn({
		pathname: request.nextUrl.pathname,
		landingSeen,
		wantsLanding,
	})) {
		const signInUrl = request.nextUrl.clone();
		signInUrl.pathname = "/auth/sign-in";
		signInUrl.search = "";
		return redirectWithSessionCookies(response, signInUrl);
	}

	response.cookies.set("ecotienda-landing-seen", "1", {
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 365,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	return response;
}

export const config = {
	matcher: [
		"/",
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
