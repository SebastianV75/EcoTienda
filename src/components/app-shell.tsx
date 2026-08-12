"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	useState,
	type ComponentType,
	type ReactNode,
	type SVGProps,
} from "react";

import {
	Briefcase,
	Calendar,
	ChevronLeft,
	Clipboard,
	DocumentText,
	Home,
	Location,
	Money,
	Profile,
	Settings,
} from "reicon-react";

import { AuthStatus } from "@/components/auth-status";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { MobileSignOut } from "@/components/mobile-sign-out";
import { ActionButton } from "@/components/ui/action-button";
import { signOutAction } from "@/features/auth/actions";
import { roleConfig } from "@/features/auth/roles";
import type { AppRole } from "@/types/auth";

type NavigationIcon = ComponentType<
	SVGProps<SVGSVGElement> & {
		size?: number | string;
		weight?: "Outline" | "Filled";
	}
>;

type NavigationItem = {
	href: string;
	label: string;
	roles: AppRole[];
	icon: NavigationIcon;
};

const workflowNavigation: NavigationItem[] = [
	{ href: "/admin", label: "Tablero", roles: ["admin"], icon: Home },
	{
		href: "/agenda",
		label: "Agenda",
		roles: ["admin", "administrative", "technician"],
		icon: Calendar,
	},
	{ href: "/admin/visits", label: "Visitas", roles: ["admin", "administrative"], icon: Location },
	{
		href: "/admin/trabajos",
		label: "Trabajos",
		roles: ["admin", "administrative"],
		icon: Briefcase,
	},
];

const supportNavigation: NavigationItem[] = [
	{
		href: "/admin/descargables",
		label: "Descargables",
		roles: ["admin", "administrative"],
		icon: DocumentText,
	},
	{
		href: "/technician/materiales-cliente",
		label: "Info para cliente",
		roles: ["admin", "administrative", "technician"],
		icon: DocumentText,
	},
	{
		href: "/admin/workers",
		label: "Trabajadores",
		roles: ["admin"],
		icon: Profile,
	},
	{
		href: "/admin/quotations",
		label: "Cotizaciones",
		roles: ["admin", "administrative"],
		icon: Clipboard,
	},
	{
		href: "/admin/sales",
		label: "Ventas",
		roles: ["admin", "administrative"],
		icon: Money,
	},
	{
		href: "/admin/settings",
		label: "Configuración",
		roles: ["admin"],
		icon: Settings,
	},
	{
		href: "/technician",
		label: "Área técnica",
		roles: ["technician"],
		icon: Profile,
	},
];

type AppShellProps = {
	children: ReactNode;
	role: AppRole;
	title: string;
	description: string;
	email?: string | null;
};

function isNavigationActive(pathname: string, href: string) {
	return href === "/admin"
		? pathname === href
		: pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
	children,
	role,
	title,
	description,
	email,
}: AppShellProps) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const pathname = usePathname() ?? "";
	const visibleWorkflowNavigation = workflowNavigation.filter((item) =>
		item.roles.includes(role),
	);
	const visibleSupportNavigation = supportNavigation.filter((item) =>
		item.roles.includes(role),
	);

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,rgba(247,249,246,0.98),rgba(240,245,240,0.94))] px-3 pb-[calc(88px+env(safe-area-inset-bottom))] pt-3 text-[var(--foreground)] sm:px-5 sm:pb-[calc(88px+env(safe-area-inset-bottom))] lg:px-0 lg:pt-0 lg:pb-0 print:min-h-0 print:bg-white print:p-0">
			<div
				className={`mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-7xl gap-4 transition-[grid-template-columns] duration-300 ease-out lg:max-w-none lg:min-h-screen lg:gap-0 ${isSidebarCollapsed ? "lg:grid-cols-[88px_minmax(0,1fr)]" : "lg:grid-cols-[272px_minmax(0,1fr)]"} print:min-h-0 print:grid-cols-1 print:gap-0`}
			>
				<aside
					className={`hidden border-r border-[rgba(13,79,46,0.10)] bg-[rgba(250,251,248,0.98)] transition-[border-radius] duration-300 ease-out lg:flex lg:min-h-screen lg:flex-col ${isSidebarCollapsed ? "lg:rounded-r-[22px]" : "lg:rounded-r-[28px]"} print:hidden`}
				>
					<div
						className={`relative border-b border-[rgba(13,79,46,0.08)] ${isSidebarCollapsed ? "px-3 py-3" : "px-4 py-4 pr-12"}`}
					>
						<div
							className={`flex ${isSidebarCollapsed ? "justify-center" : "items-start"}`}
						>
							<div
								className={`flex items-center overflow-hidden ${isSidebarCollapsed ? "gap-0" : "gap-4"}`}
							>
								<div className="rounded-[14px] border border-[rgba(13,79,46,0.08)] bg-white p-2">
									<Image
										src="/ecotienda-logo-temp.png"
										alt="Logo de EcoTienda"
										width={44}
										height={44}
										className="h-10 w-10 object-contain"
									/>
								</div>
								<div
									className={`min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out ${isSidebarCollapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[180px] translate-x-0 opacity-100"}`}
								>
									<p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
										EcoTienda
									</p>
									<h1 className="mt-1 whitespace-nowrap text-lg font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
										Centro operativo
									</h1>
									<span className="mt-2 inline-flex items-center rounded-full border border-[rgba(13,79,46,0.10)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
										{roleConfig[role].label}
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setIsSidebarCollapsed((value) => !value)}
								aria-label={
									isSidebarCollapsed
										? "Expandir navegación"
										: "Contraer navegación"
								}
								className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-[10px] border border-[rgba(13,79,46,0.08)] bg-white text-[var(--muted)] shadow-[0_4px_12px_rgba(10,44,21,0.06)] transition-[transform,background-color,color,box-shadow] duration-300 ease-out hover:bg-[rgba(13,79,46,0.05)] hover:text-[var(--brand-deep)] active:scale-[0.96]"
							>
								<span
									className={`transition-transform duration-300 ease-out ${isSidebarCollapsed ? "rotate-180" : "rotate-0"}`}
								>
									<ChevronLeft size={14} weight="Outline" />
								</span>
							</button>
						</div>
					</div>

					<div
						className={`flex flex-1 flex-col transition-[padding] duration-300 ease-out ${isSidebarCollapsed ? "px-2 py-4" : "px-4 py-4"}`}
					>
						<div className="space-y-5">
							<div>
								<p
									className={`px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition-[opacity,max-height] duration-200 ease-out ${isSidebarCollapsed ? "max-h-0 overflow-hidden pb-0 opacity-0" : "max-h-8 opacity-100"}`}
								>
									Operación
								</p>
								<nav className="flex flex-col gap-1.5">
									{visibleWorkflowNavigation.map((item) => {
										const Icon = item.icon;
										const active = isNavigationActive(pathname, item.href);

										return (
											<Link
												key={item.href}
												href={item.href}
												aria-current={active ? "page" : undefined}
												className={`grid min-h-[44px] items-center rounded-[14px] px-3 py-2.5 text-sm font-medium text-[var(--brand-deep)] shadow-[inset_0_0_0_1px_rgba(13,79,46,0)] transition-[transform,background-color,box-shadow,color,grid-template-columns,padding,column-gap] duration-200 ease-out ${isSidebarCollapsed ? "grid-cols-[18px] justify-center gap-x-0" : "grid-cols-[18px_minmax(0,1fr)] gap-x-4"} ${active ? "bg-[rgba(13,79,46,0.09)] shadow-[inset_0_0_0_1px_rgba(13,79,46,0.10)]" : "hover:-translate-y-0.5 hover:bg-[rgba(13,79,46,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(13,79,46,0.08),0_10px_20px_rgba(10,44,21,0.05)]"} active:translate-y-0 active:scale-[0.98]`}
												title={isSidebarCollapsed ? item.label : undefined}
											>
												<Icon
													size={18}
													weight="Outline"
													className="text-[var(--muted)] transition-colors duration-200 ease-out"
												/>
												<span
													className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out ${isSidebarCollapsed ? "max-w-0 translate-x-1 opacity-0" : "max-w-[120px] translate-x-0 opacity-100"}`}
												>
													{item.label}
												</span>
											</Link>
										);
									})}
								</nav>
							</div>

							<div>
								<p
									className={`px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition-[opacity,max-height] duration-200 ease-out ${isSidebarCollapsed ? "max-h-0 overflow-hidden pb-0 opacity-0" : "max-h-8 opacity-100"}`}
								>
									{role === "technician" ? "Recursos" : "Administración"}
								</p>
								<nav className="flex flex-col gap-1">
									{visibleSupportNavigation.map((item) => {
										const Icon = item.icon;
										const active = isNavigationActive(pathname, item.href);

										return (
											<Link
												key={item.href}
												href={item.href}
												aria-current={active ? "page" : undefined}
												className={`grid min-h-[44px] items-center rounded-[14px] px-3 py-2.5 text-sm font-medium transition-[transform,background-color,color,grid-template-columns,padding,column-gap,box-shadow] duration-200 ease-out ${isSidebarCollapsed ? "grid-cols-[18px] justify-center gap-x-0" : "grid-cols-[18px_minmax(0,1fr)] gap-x-4"} ${active ? "bg-[rgba(13,79,46,0.09)] text-[var(--brand-deep)] shadow-[inset_0_0_0_1px_rgba(13,79,46,0.10)]" : "text-[var(--muted)] hover:-translate-y-0.5 hover:bg-[rgba(13,79,46,0.05)] hover:text-[var(--brand-deep)] hover:shadow-[0_10px_20px_rgba(10,44,21,0.04)]"} active:translate-y-0 active:scale-[0.98]`}
												title={isSidebarCollapsed ? item.label : undefined}
											>
												<Icon
													size={18}
													weight="Outline"
													className="text-[var(--muted)] transition-colors duration-200 ease-out"
												/>
												<span
													className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out ${isSidebarCollapsed ? "max-w-0 translate-x-1 opacity-0" : "max-w-[140px] translate-x-0 opacity-100"}`}
												>
													{item.label}
												</span>
											</Link>
										);
									})}
								</nav>
							</div>
						</div>

						<div
							className={`mt-auto overflow-hidden pt-5 transition-[max-height,opacity,transform] duration-300 ease-out ${isSidebarCollapsed ? "max-h-0 translate-y-2 opacity-0" : "max-h-64 translate-y-0 opacity-100"}`}
						>
							{email ? <AuthStatus email={email} /> : null}
						</div>
					</div>
				</aside>

				<main className="rounded-[32px] border border-[rgba(13,79,46,0.10)] bg-[rgba(255,255,255,0.86)] shadow-[0_24px_64px_rgba(10,44,21,0.08)] backdrop-blur-sm lg:rounded-none lg:border-y-0 lg:border-r-0 lg:shadow-none print:rounded-none print:border-0 print:bg-white print:shadow-none print:backdrop-blur-none">
					<div className="border-b border-[var(--border-soft)] px-4 py-4 sm:hidden print:hidden">
						<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
							EcoTienda interno
						</p>
						<h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
							{title}
						</h2>
					</div>

					<div className="hidden border-b border-[var(--border-soft)] px-6 py-6 sm:block print:hidden">
						<div className="flex items-start justify-between gap-4">
							<div className="max-w-3xl">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
									EcoTienda interno
								</p>
								<h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-4xl">
									{title}
								</h2>
								<p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
									{description}
								</p>
							</div>
							{email ? (
								<form action={signOutAction} className="shrink-0">
									<ActionButton
										type="submit"
										pendingLabel="Cerrando…"
										className="ui-secondary-action"
									>
										Cerrar sesión
									</ActionButton>
								</form>
							) : null}
						</div>
					</div>

					<div className="px-4 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8 print:p-0">
						{children}
					</div>
				</main>
			</div>

			<MobileBottomNavigation
				role={role}
				signOutSlot={<MobileSignOut email={email} />}
			/>
		</div>
	);
}
