import { signOutAction } from "@/features/auth/actions";

type AuthStatusProps = {
	email?: string | null;
};

export function AuthStatus({ email }: AuthStatusProps) {
	return (
		<div className="mx-4 mb-4 rounded-[24px] border border-white/10 bg-white/8 p-4 text-white backdrop-blur-sm sm:mx-5 sm:mb-5">
			<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/70">
				Sesión
			</p>
			<p className="mt-2 text-sm leading-6 text-emerald-50/90">
				Conectado como
			</p>
			<p className="mt-1 break-all text-sm font-medium text-white">{email ?? "Usuario desconocido"}</p>
			<form action={signOutAction} className="mt-4">
				<button
					type="submit"
					className="w-full rounded-full border border-white/15 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition duration-200 ease-out hover:border-emerald-300/40 hover:bg-white/10"
				>
					Cerrar sesión
				</button>
			</form>
		</div>
	);
}
