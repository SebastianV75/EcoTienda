import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";

export default async function UbicacionClienteTemplatePage() {
	const user = await requireRole(["admin", "administrative"]);

	return (
		<AppShell
		role={user.role}
			title="Ubicación del cliente"
			description="Elige un trabajo para revisar la ubicación guardada y el mapa centrado en sus coordenadas."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin/descargables"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a descargables
					</Link>
				</div>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-sm leading-7 text-[var(--muted)]">
						La vista previa se abre desde el trabajo para mantener alineados los
						datos de contacto, dirección y coordenadas.
					</p>
					<Link
						href="/admin/documents/trabajos?template=ubicacion-cliente"
						className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Elegir trabajo
					</Link>
				</section>
			</div>
		</AppShell>
	);
}
