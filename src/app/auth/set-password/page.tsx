import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";
import { SetPasswordForm } from "@/features/auth/set-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	invitationSessionCookie,
	verifyInvitationSessionProof,
} from "@/features/auth/invitation-session";
import { getSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
	robots: { index: false, follow: false, noarchive: true },
	referrer: "no-referrer",
};

export default async function SetPasswordPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/link-error");
	}

	const cookieStore = await cookies();
	const { serviceRoleKey } = getSupabaseAdminEnv();
	if (
		!verifyInvitationSessionProof(
			cookieStore.get(invitationSessionCookie.name)?.value,
			user.id,
			serviceRoleKey,
		)
	) {
		redirect("/auth/link-error");
	}

	return (
		<PreloginShell
			eyebrow="Activación de cuenta"
			title="Crea tu contraseña"
			description="Tu invitación ya fue confirmada. Define una contraseña para completar el acceso a EcoTienda."
			primaryCta={
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)]"
				>
					Volver al inicio
				</Link>
			}
			secondaryContent={<p>La contraseña se guarda directamente en Supabase Auth.</p>}
		>
			<div className="rounded-[28px] border border-[var(--border-soft)] bg-white/95 p-5 shadow-[0_16px_50px_rgba(13,79,46,0.06)] sm:p-6 lg:p-7">
				<h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
					Finaliza tu acceso
				</h2>
				<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
					Usa entre 8 y 72 caracteres. Supabase puede exigir una política más
					estricta según la configuración del proyecto.
				</p>
				<div className="mt-6">
					<SetPasswordForm />
				</div>
			</div>
		</PreloginShell>
	);
}
