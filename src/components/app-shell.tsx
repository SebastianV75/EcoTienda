import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthStatus } from "@/components/auth-status";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { MobileSignOut } from "@/components/mobile-sign-out";
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
		<div className="min-h-screen bg-[linear-gradient(180deg,rgba(247,249,246,0.98),rgba(240,245,240,0.94))] px-3 pb-[calc(88px+env(safe-area-inset-bottom))] pt-3 text-[var(--foreground)] sm:px-5 sm:pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-5 print:min-h-0 print:bg-white print:p-0">
			<div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-7xl gap-4 lg:grid-cols-[312px_minmax(0,1fr)] print:min-h-0 print:grid-cols-1 print:gap-0">
				<aside className="hidden overflow-hidden rounded-[32px] border border-[rgba(13,79,46,0.14)] bg-[linear-gradient(180deg,rgba(11,59,35,0.98),rgba(13,79,46,0.96))] text-white shadow-[0_28px_70px_rgba(10,44,21,0.18)] lg:flex lg:flex-col print:hidden">
					<div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(104,219,84,0.3),transparent_42%)] p-6">
						<div className="flex items-center gap-3">
							<div className="rounded-[22px] bg-white p-2.5 shadow-lg shadow-black/15">
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
								<h1 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.05em] text-white">
									Centro operativo
								</h1>
							</div>
						</div>

						<div className="mt-7 rounded-[26px] border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">
								Perfil activo
							</p>
							<p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
								{roleConfig[role].label}
							</p>
							<p className="mt-2 text-sm leading-6 text-emerald-50/80">
								{roleConfig[role].description}
							</p>
						</div>
					</div>

					<div className="flex flex-1 flex-col p-5">
						<div className="px-1 pb-3">
							<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/65">
								Navegación principal
							</p>
						</div>

						<nav className="flex flex-col gap-2.5">
							{navigation.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="group rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3.5 transition duration-200 ease-out hover:border-emerald-300/45 hover:bg-white/[0.10]"
								>
									<div className="flex items-center justify-between gap-3">
										<span className="text-sm font-medium text-white">
											{item.label}
										</span>
										<span className="text-[11px] text-emerald-100/60 transition group-hover:text-emerald-100/85">
											Abrir
										</span>
									</div>
								</Link>
							))}
						</nav>

						<div className="mt-auto pt-5">{email ? <AuthStatus email={email} /> : null}</div>
					</div>
				</aside>

				<main className="rounded-[32px] border border-[rgba(13,79,46,0.10)] bg-[rgba(255,255,255,0.84)] shadow-[0_28px_70px_rgba(10,44,21,0.08)] backdrop-blur-sm print:rounded-none print:border-0 print:bg-white print:shadow-none print:backdrop-blur-none">
					<div className="border-b border-[var(--border-soft)] px-4 py-4 lg:hidden print:hidden">
						<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							EcoTienda interno
						</p>
						<h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							{title}
						</h2>
					</div>

					<div className="hidden border-b border-[var(--border-soft)] px-6 py-6 sm:px-8 sm:py-7 lg:block print:hidden">
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

					<div className="px-4 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8 print:p-0">
						{children}
					</div>
				</main>
			</div>

			<MobileBottomNavigation signOutSlot={<MobileSignOut email={email} />} />
		</div>
	);
}
