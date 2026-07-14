import { signOutAction } from "@/features/auth/actions";

type MobileSignOutProps = {
	email?: string | null;
};

export function MobileSignOut({ email }: MobileSignOutProps) {
	return (
		<div>
			<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
				Sesión
			</p>
			<p className="mt-2 text-xs text-[var(--muted)]">Conectado como</p>
			<p className="mt-1 break-all text-sm font-medium text-[var(--brand-deep)]">
				{email ?? "Usuario desconocido"}
			</p>
			<form action={signOutAction} className="mt-3">
				<button
					type="submit"
					className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)]/40 hover:bg-white active:scale-[0.97] motion-reduce:transition-none"
				>
					Cerrar sesión
				</button>
			</form>
		</div>
	);
}
