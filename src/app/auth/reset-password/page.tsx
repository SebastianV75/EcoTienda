import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { PreloginShell } from "@/features/auth/components/prelogin-shell";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
	robots: { index: false, follow: false, noarchive: true },
	referrer: "no-referrer",
};

export default async function ResetPasswordPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/link-error");
	}

	return (
		<PreloginShell
			eyebrow="Seguridad de la cuenta"
			title="Restablece tu contraseña"
			description="Define una nueva contraseña para volver a entrar a EcoTienda de forma segura."
			primaryCta={
				<Link
					href="/auth/sign-in"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)]"
				>
					Volver al inicio de sesión
				</Link>
			}
			secondaryContent={<p>La contraseña se actualiza directamente en Supabase Auth.</p>}
		>
			<div className="rounded-[28px] border border-[var(--border-soft)] bg-white/95 p-5 shadow-[0_16px_50px_rgba(13,79,46,0.06)] sm:p-6 lg:p-7">
				<h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
					Crea una contraseña nueva
				</h2>
				<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
					Usa entre 8 y 72 caracteres. Evita reutilizar una contraseña anterior.
				</p>
				<div className="mt-6">
					<ResetPasswordForm />
				</div>
			</div>
		</PreloginShell>
	);
}
