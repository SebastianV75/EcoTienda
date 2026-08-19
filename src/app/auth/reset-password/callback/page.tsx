import type { Metadata } from "next";
import Link from "next/link";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";
import { RecoveryCallback } from "@/features/auth/recovery-callback";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
	robots: { index: false, follow: false, noarchive: true },
	referrer: "no-referrer",
};

export default function ResetPasswordCallbackPage() {
	return (
		<PreloginShell
			eyebrow="Seguridad de la cuenta"
			 title="Validando el enlace"
			description="Estamos preparando el formulario para que puedas crear una nueva contraseña."
			primaryCta={
				<Link
					href="/auth/sign-in"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)]"
				>
					Volver al inicio de sesión
				</Link>
			}
		>
			<RecoveryCallback />
		</PreloginShell>
	);
}
