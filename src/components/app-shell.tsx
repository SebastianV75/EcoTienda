import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthStatus } from "@/components/auth-status";
import { roleConfig } from "@/features/auth/roles";
import type { AppRole } from "@/types/auth";

const navigation = [
	{ href: "/admin", label: "Panel" },
	{ href: "/admin/clients", label: "Clientes" },
	{ href: "/admin/documents", label: "Descargables" },
	{ href: "/admin/quotations", label: "Cotizaciones" },
	{ href: "/admin/visits", label: "Visitas técnicas" },
	{ href: "/admin/settings", label: "Configuración" },
];

type AppShellProps = {
	children: ReactNode;
	role: AppRole;
	title: string;
	description: string;
	email?: string | null;
};

export function AppShell({
	children,
	role,
	title,
	description,
	email,
}: AppShellProps) {
	return (
		<div className="min-h-screen px-3 py-3 text-[var(--foreground)] sm:px-5 sm:py-5">
			<div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-7xl gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[rgba(13,79,46,0.95)] text-white shadow-[var(--shadow)]">
					<div className="border-b border-white/10 bg-gradient-to-br from-[rgba(47,179,20,0.28)] via-transparent to-transparent p-5 sm:p-6">
						<div className="flex items-center gap-3">
							<div className="rounded-2xl bg-white p-2 shadow-lg shadow-black/15">
								<Image
									src="/ecotienda-logo-temp.png"
									alt="Logo de EcoTienda"
									width={54}
									height={54}
									className="h-12 w-12 object-contain"
								/>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/90">
									EcoTienda
								</p>
								<h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
									Centro operativo
								</h1>
							</div>
						</div>

						<div className="mt-6 rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">
								Perfil activo
							</p>
							<p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
								{roleConfig[role].label}
							</p>
							<p className="mt-2 text-sm leading-6 text-emerald-50/80">
								{roleConfig[role].description}
							</p>
						</div>
					</div>

					<nav className="flex flex-col gap-2 p-4 sm:p-5">
						{navigation.map((item, index) => (
							<Link
								key={item.href}
								href={item.href}
								className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-4 py-3 transition duration-200 ease-out hover:border-emerald-300/45 hover:bg-white/10"
							>
								<div className="absolute inset-y-0 left-0 w-1 rounded-full bg-emerald-300/85 opacity-60 transition group-hover:opacity-100" />
								<div className="flex items-center justify-between gap-3">
									<span className="text-sm font-medium text-white">
										{item.label}
									</span>
									<span className="text-[11px] text-emerald-100/70">
										0{index + 1}
									</span>
								</div>
							</Link>
						))}
					</nav>

					{email ? <AuthStatus email={email} /> : null}
				</aside>

				<main className="rounded-[32px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.82)] shadow-[var(--shadow)] backdrop-blur-sm">
					<div className="border-b border-[var(--border-soft)] px-5 py-5 sm:px-8 sm:py-7">
						<div className="max-w-3xl">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
								EcoTienda interno
							</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-4xl">
								{title}
							</h2>
							<p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
								{description}
							</p>
						</div>
					</div>

					<div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
