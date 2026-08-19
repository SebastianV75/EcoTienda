import type { Metadata } from "next";
import Link from "next/link";

import { ActionButton } from "@/components/ui/action-button";
import { PreloginShell } from "@/features/auth/components/prelogin-shell";
import { confirmInvitationAction } from "@/features/auth/confirm-actions";
import { DefaultInviteCallback } from "@/features/auth/default-invite-callback";
import { parseInviteConfirmation } from "@/features/auth/invitation-rules";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
	robots: { index: false, follow: false, noarchive: true },
	referrer: "no-referrer",
};

export default async function ConfirmInvitationPage({
	searchParams,
}: {
	searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
	const params = await searchParams;
	const confirmation = parseInviteConfirmation({
		tokenHash: params.token_hash ?? null,
		type: params.type ?? null,
	});

	return (
		<PreloginShell
			eyebrow="Invitación de acceso"
			title={confirmation ? "Confirma tu invitación" : "Enlace no válido"}
			description={
				confirmation
					? "El acceso solo se activará cuando pulses el botón. Abrir este enlace no consume la invitación."
					: "El enlace está incompleto, vencido o no corresponde al formato de invitación."
			}
			primaryCta={
				<Link
					href="/auth/sign-in"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)]"
				>
					Ir al inicio de sesión
				</Link>
			}
			>
				<DefaultInviteCallback />
				<div className="rounded-[28px] border border-[var(--border-soft)] bg-white/95 p-6 shadow-[0_16px_50px_rgba(13,79,46,0.06)]">
				{confirmation ? (
					<form action={confirmInvitationAction} className="space-y-5">
						<input type="hidden" name="token_hash" value={confirmation.token_hash} />
						<input type="hidden" name="type" value="invite" />
						<p className="text-sm leading-7 text-[var(--muted)]">
							Este paso verificará el enlace con Supabase y abrirá el formulario para
							crear tu contraseña.
						</p>
						<ActionButton
							type="submit"
							pendingLabel="Confirmando..."
							className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-semibold text-white"
						>
							Confirmar invitación
						</ActionButton>
					</form>
				) : (
					<p className="text-sm leading-7 text-amber-900">
						Solicita al administrador una nueva invitación.
					</p>
				)}
			</div>
		</PreloginShell>
	);
}
