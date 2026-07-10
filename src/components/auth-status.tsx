import { signOutAction } from "@/features/auth/actions";

type AuthStatusProps = {
	email?: string | null;
};

export function AuthStatus({ email }: AuthStatusProps) {
	return (
		<div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
			<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
				Sesión
			</p>
			<p className="mt-2 text-sm text-slate-300">
				Conectado como{" "}
				<span className="font-medium text-white">
					{email ?? "Usuario desconocido"}
				</span>
			</p>
			<form action={signOutAction} className="mt-4">
				<button
					type="submit"
					className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
				>
					Cerrar sesión
				</button>
			</form>
		</div>
	);
}
