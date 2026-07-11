import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";

const templates = [
	{
		title: "Carta poder",
		description:
			"Autollenado con datos del cliente. Testigos y aceptación del poder se mantienen fijos por ahora.",
		href: "/admin/documents/carta-poder",
		status: "Activo",
	},
	{
		title: "Ubicación del cliente",
		description:
			"Vista previa con datos del cliente y mapa centrado en las coordenadas guardadas. Pendiente de integrar impresión y descarga.",
		href: "/admin/documents/ubicacion-cliente",
		status: "Activo",
	},
	{
		title: "Formato CFE",
		description:
			"Se integrará después con campos adicionales del trámite para replicar el formato lo más fiel posible.",
		href: "#",
		status: "Pendiente",
	},
];

export default async function DocumentsPage() {
	const user = await requireRole(["admin"]);
	const clients = await getClients();

	return (
		<AppShell
			role="admin"
			title="Descargables"
			description="Selecciona una plantilla, elige un cliente y genera documentos con datos ya registrados dentro del sistema."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-[28px] bg-[linear-gradient(135deg,#0d4f2e,#2fb314)] p-6 text-white shadow-[0_24px_60px_rgba(13,79,46,0.22)] sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
							Plantillas dinámicas
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-balance">
							Genera documentos con datos reales del cliente
						</h2>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
							Ya puedes trabajar Carta Poder y Ubicación del cliente con datos
							reales. El siguiente paso será sumar impresión, descarga y el
							formato CFE con más campos específicos.
						</p>
					</div>

					<div className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Clientes disponibles
						</p>
						<p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							{clients.length}
						</p>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Cada plantilla usa los datos del cliente como base para el
							autollenado.
						</p>
						<Link
							href="/admin/clients/new"
							className="mt-5 inline-flex rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Nuevo cliente
						</Link>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-3">
					{templates.map((template) => (
						<article
							key={template.title}
							className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
						>
							<div className="flex items-center justify-between gap-3">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Plantilla
								</p>
								<span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
									{template.status}
								</span>
							</div>
							<h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{template.title}
							</h3>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								{template.description}
							</p>
							{template.status === "Activo" ? (
								<Link
									href={template.href}
									className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
								>
									Abrir plantilla
								</Link>
							) : (
								<span className="mt-5 inline-flex rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-medium text-[var(--muted)]">
									Próximamente
								</span>
							)}
						</article>
					))}
				</section>
			</div>
		</AppShell>
	);
}
