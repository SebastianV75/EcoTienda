import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";

const clientMaterials = [
	{
		title: "Información para el cliente",
		description:
			"Puntos importantes que el cliente debe conocer antes de instalar paneles solares.",
		href: "/materiales-cliente/para-el-cliente.pdf",
		pages: "6 páginas",
	},
	{
		title: "Información de paneles solares",
		description:
			"Explicación general del sistema fotovoltaico, su funcionamiento y consideraciones de instalación.",
		href: "/materiales-cliente/informacion-paneles-solares.pdf",
		pages: "6 páginas",
	},
	{
		title: "Información de minisplits",
		description:
			"Material de apoyo para explicar al cliente cómo funciona un minisplit y sus componentes.",
		href: "/materiales-cliente/informacion-minisplits.pdf",
		pages: "5 páginas",
	},
	{
		title: "Contrato de prestación de servicios",
		description:
			"Documento para revisar con el cliente antes de completar la firma y formalizar el servicio.",
		href: "/materiales-cliente/contrato-prestacion-servicios.pdf",
		pages: "4 páginas",
	},
] as const;

export default async function ClientMaterialsPage() {
	const user = await requireRole(["admin", "technician"]);

	return (
		<AppShell
			role={user.role}
			title="Información para clientes"
			description="Material de apoyo para mostrar o compartir rápidamente durante la visita."
			email={user.email}
		>
			<div className="space-y-5">
				<section className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
						Material de apoyo
					</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						Muéstrale la información al cliente desde aquí
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-950/75">
						Abre cualquier PDF en una pestaña nueva para explicarlo durante la
						visita, o descárgalo si necesitas compartirlo después.
					</p>
				</section>

				<section className="grid gap-4 md:grid-cols-2">
					{clientMaterials.map((material) => (
						<Card key={material.href} className="flex h-full flex-col p-5">
							<div className="flex-1">
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-lg font-semibold text-[var(--brand-deep)]">
										{material.title}
									</h3>
									<span className="shrink-0 rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
										{material.pages}
									</span>
								</div>
								<p className="mt-3 text-sm leading-6 text-[var(--muted)]">
									{material.description}
								</p>
							</div>
							<div className="mt-5 flex flex-wrap gap-2">
								<Link
									href={material.href}
									target="_blank"
									rel="noopener noreferrer"
									className="ui-primary-action"
								>
									Abrir para mostrar
								</Link>
								<Link
									href={material.href}
									download
									className="ui-secondary-action"
								>
									Descargar
								</Link>
							</div>
						</Card>
					))}
				</section>
			</div>
		</AppShell>
	);
}
