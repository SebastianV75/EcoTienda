import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";

const templates = [
	{
		title: "Documentos de trabajo",
		description:
			"Prellenado desde el trabajo para mantener el flujo operativo y las correcciones aisladas por plantilla.",
		href: "/admin/documents/trabajos",
		status: "Activo",
	},
	{
		title: "Carta poder",
		description:
			"Autollenado desde un trabajo en curso. Testigos y aceptación del poder se mantienen fijos por ahora.",
		href: "/admin/documents/carta-poder",
		status: "Activo",
	},
	{
		title: "Ubicación del cliente",
		description:
			"Vista previa con datos del trabajo y mapa centrado en las coordenadas guardadas. Pendiente de integrar impresión y descarga.",
		href: "/admin/documents/ubicacion-cliente",
		status: "Activo",
	},
	{
		title: "Diagrama unifilar",
		description:
			"Panel de datos del trabajo y del equipo de generación solar. La vista previa actual muestra los datos que acompañarán al diagrama eléctrico.",
		href: "/admin/documents/diagrama-unifilar",
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

	return (
		<AppShell
			role="admin"
			title="Documentos"
			description="Selecciona una plantilla y elige un trabajo para generar documentos con datos ya registrados dentro del sistema."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-[28px] bg-[linear-gradient(135deg,#0d4f2e,#2fb314)] p-6 text-white shadow-[0_24px_60px_rgba(13,79,46,0.22)] sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
							Plantillas dinámicas
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-balance">
							Genera documentos con datos reales del trabajo
						</h2>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
							Ya puedes trabajar Carta Poder, Ubicación del cliente y el panel de
							trabajo con datos reales. El siguiente paso será sumar impresión,
							descarga y el formato CFE con más campos específicos.
						</p>
					</div>

					<div className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Flujo activo
						</p>
						<p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
							Trabajos
						</p>
						<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
							Las plantillas se abren desde el trabajo en curso para mantener el
							autollenado alineado con Agenda, Visita y Descargables.
						</p>
						<Link
							href="/admin/documents/trabajos"
							className="mt-5 inline-flex rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
						>
							Elegir trabajo
						</Link>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{templates.map((template) => (
						<Card key={template.title} className="p-6">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Plantilla
								</p>
								<Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
									{template.status}
								</Badge>
							</div>
							<h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{template.title}
							</h3>
							<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
								{template.description}
							</p>
							<Link
								href={template.href}
								className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
							>
								Abrir plantilla
							</Link>
						</Card>
					))}
				</section>
			</div>
		</AppShell>
	);
}
