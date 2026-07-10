import Link from "next/link";

export function SetupNotice() {
	return (
		<section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-50 shadow-lg shadow-amber-950/20">
			<p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
				Configuración pendiente
			</p>
			<h2 className="mt-2 text-2xl font-semibold text-white">
				Conecta Supabase antes de habilitar los flujos protegidos
			</h2>
			<p className="mt-3 max-w-2xl leading-7 text-amber-50/90">
				Agrega las claves del proyecto en{" "}
				<code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code>{" "}
				y después configura los usuarios iniciales en Supabase Auth. Cuando el
				entorno esté completo, los guardas del servidor comenzarán a validar la
				sesión.
			</p>
			<div className="mt-4 flex flex-wrap gap-3">
				<Link
					href="/auth/sign-in"
					className="rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-amber-100"
				>
					Revisar acceso
				</Link>
				<Link
					href="/"
					className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:border-white/40"
				>
					Volver al inicio
				</Link>
			</div>
		</section>
	);
}
