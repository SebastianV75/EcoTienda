import { ActionButton } from "@/components/ui/action-button";
import { signOutAction } from "@/features/auth/actions";

type AuthStatusProps = {
	email?: string | null;
};

export function AuthStatus({ email }: AuthStatusProps) {
	return (
		<div className="mx-4 mb-4 rounded-[24px] border border-[var(--border-soft)] bg-white/85 p-4 text-[var(--foreground)] shadow-[0_12px_28px_rgba(10,44,21,0.05)] backdrop-blur-sm sm:mx-5 sm:mb-5">
			<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
				Sesión activa
			</p>
			<p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
				Conectado como
			</p>
			<p className="mt-1 break-words text-sm leading-5 text-[var(--foreground)]">
				{email ?? "Usuario desconocido"}
			</p>
			<form action={signOutAction} className="mt-4">
				<ActionButton
					type="submit"
					pendingLabel="Cerrando…"
					className="ui-secondary-action w-full"
				>
					Cerrar sesión
				</ActionButton>
			</form>
		</div>
	);
}
