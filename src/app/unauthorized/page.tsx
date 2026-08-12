import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";

export default function UnauthorizedPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
			<div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl shadow-slate-950/40">
				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
					Acceso denegado
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight">
					No tienes permiso para entrar a esta sección.
				</h1>
				<p className="mt-4 text-sm leading-7 text-slate-300">
					Tu cuenta no tiene un trabajador activo con un rol autorizado. Solicita al
					administrador que revise el perfil y el acceso vinculado.
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/"
						className="inline-flex rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-slate-100"
					>
						Volver al inicio
					</Link>
					<form action={signOutAction}>
						<button
							type="submit"
							className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/15"
						>
							Cerrar sesión
						</button>
					</form>
				</div>
			</div>
		</main>
	);
}
