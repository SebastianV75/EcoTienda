export function shouldRedirectLandingToSignIn({
	pathname,
	landingSeen,
	wantsLanding,
}: {
	pathname: string;
	landingSeen: boolean;
	wantsLanding: boolean;
}) {
	return pathname === "/" && landingSeen && !wantsLanding;
}
