import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { getClientActivitySummary } from "@/features/clients/data";
import { hasSupabaseEnv } from "@/lib/env";

const quickActions = [
	{
		title: "Clientes",
		description:
			"Registro base para datos de contacto, RPU y ubicación reutilizable en plantillas.",
		href: "/admin/clients",
		cta: "Abrir clientes",
	},
	{
		title: "Descargables",
		description:
			"Plantillas y documentos internos listos para completar y descargar.",
		href: "/admin/documents",
		cta: "Abrir módulo",
	},
	{
		title: "Cotizaciones",
		description:
			"Preparación de propuestas con productos, precios y salida en PDF.",
		href: "/admin/quotations",
		cta: "Ver cotizaciones",
	},
	{
		title: "Visitas técnicas",
		description:
			"Seguimiento a servicios, agenda operativa y captura de trabajo en campo.",
		href: "/admin/visits",
		cta: "Revisar agenda",
	},
];

const supportCards = [
	{
		title: "Configuración",
		description:
			"Administra accesos, datos generales y parámetros del sistema.",
	},
	{
		title: "Operación centralizada",
		description:
			"Mantén documentos, cotizaciones y seguimiento técnico dentro del mismo entorno.",
	},
];

const emptyActivitySummary = { totalClients: 0, recentClients: 0 };

export default async function AdminPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin"])
		: await getCurrentUser();

	const activitySummary = hasSupabaseEnv()
		? await getClientActivitySummary()
		: emptyActivitySummary;

	return (
		<AppShell
			role="admin"
			title="Panel administrativo"
			description="Accede a los módulos principales y organiza la operación interna desde un solo lugar."
			email={user?.email}
		>
			<div className="space-y-4">
				{!hasSupabaseEnv() ? <SetupNotice /> : null}

				<section
					aria-label="Resumen de actividad"
					className="grid gap-4 rounded-[24px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5"
				>
					<div className="flex flex-col gap-1">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Total de clientes
						</p>
						<p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-3xl">
							{activitySummary.totalClients}
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Clientes recientes
						</p>
						<p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-3xl">
							{activitySummary.recentClients}
						</p>
						<p className="text-xs leading-5 text-[var(--muted)]">
							Últimos 7 días
						</p>
					</div>
				</section>

				<section className="hidden gap-4 md:grid xl:grid-cols-[1.15fr_0.85fr]">
					<div className="rounded-[28px] bg-[linear-gradient(135deg,#0d4f2e,#2fb314)] p-6 text-white shadow-[0_24px_60px_rgba(13,79,46,0.22)] sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
							Vista principal
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-balance">
							Gestiona la operación diaria con una vista clara y centralizada
						</h2>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
							Desde aquí puedes entrar a los módulos principales del sistema y
							mantener bajo control documentos, ventas y trabajo técnico.
						</p>
					</div>

					<div className="grid gap-4">
						{supportCards.map((item) => (
							<article
								key={item.title}
								className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									{item.title}
								</p>
								<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
									{item.description}
								</p>
							</article>
						))}
					</div>
				</section>

				<section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
					{quickActions.map((item) => (
						<article
							key={item.title}
							className="flex h-full flex-col rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)] sm:rounded-[26px] sm:p-6"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								Módulo
							</p>
							<h3 className="mt-3 text-lg font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:mt-4 sm:text-2xl">
								{item.title}
							</h3>
							<p className="mt-2 hidden text-sm leading-7 text-[var(--muted)] sm:mt-3 sm:block">
								{item.description}
							</p>
							<Link
								href={item.href}
								className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100 sm:mt-5"
							>
								{item.cta}
							</Link>
						</article>
					))}
				</section>
			</div>
		</AppShell>
	);
}
