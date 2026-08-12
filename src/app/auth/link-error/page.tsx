import Link from "next/link";
import type { Metadata } from "next";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";

export const metadata: Metadata = {
	robots: { index: false, follow: false, noarchive: true },
	referrer: "no-referrer",
};

export default function AuthLinkErrorPage() {
	return (
		<PreloginShell
			eyebrow="Enlace no válido"
			title="No pudimos confirmar la invitación"
			description="El enlace puede haber vencido, haberse usado antes o no corresponder a una invitación válida."
			primaryCta={
				<Link
					href="/auth/sign-in"
					className="inline-flex items-center justify-center rounded-full bg-[var(--brand-deep)] px-5 py-3 text-sm font-semibold text-white"
				>
					Ir al inicio de sesión
				</Link>
			}
			secondaryContent={
				<p>Solicita al administrador una nueva invitación si aún no activaste tu cuenta.</p>
			}
		>
			<div className="rounded-[28px] border border-amber-200 bg-amber-50/95 p-6 text-sm leading-7 text-amber-950">
				Por seguridad, EcoTienda no muestra detalles técnicos del token ni permite
				redirecciones proporcionadas por el enlace.
			</div>
		</PreloginShell>
	);
}
