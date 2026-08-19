"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/overlay";
import {
	useState,
	type ComponentType,
	type ReactNode,
	type SVGProps,
} from "react";

import {
	Add,
	Briefcase,
	Calendar,
	Clipboard,
	DocumentText,
	Home,
	Location,
	More,
	Profile,
	Settings,
} from "reicon-react";

import type { AppRole } from "@/types/auth";

type NavigationIcon = ComponentType<
	SVGProps<SVGSVGElement> & {
		size?: number | string;
		weight?: "Outline" | "Filled";
	}
>;

type PrimaryItem = {
	href: string;
	label: string;
	icon: NavigationIcon;
	exact?: boolean;
};

type SecondaryItem = {
	href: string;
	label: string;
	icon: NavigationIcon;
};

const primaryMobileNavigationByRole: Record<AppRole, PrimaryItem[]> = {
	admin: [
		{ href: "/admin", label: "Tablero", icon: Home, exact: true },
		{ href: "/admin/trabajos", label: "Trabajos", icon: Briefcase },
		{ href: "/agenda", label: "Agenda", icon: Calendar },
		{ href: "/admin/quotations", label: "Cotización", icon: Clipboard },
	],
	administrative: [
		{ href: "/agenda", label: "Agenda", icon: Calendar, exact: true },
		{ href: "/admin/trabajos", label: "Trabajos", icon: Briefcase },
		{ href: "/admin/quotations", label: "Cotización", icon: Clipboard },
	],
	technician: [
		{
			href: "/technician",
			label: "Visitas técnicas",
			icon: Location,
			exact: true,
		},
	],
};

const secondaryMobileNavigationByRole: Record<AppRole, SecondaryItem[]> = {
	admin: [
		{ href: "/admin/sales", label: "Ventas", icon: Clipboard },
		{ href: "/admin/descargables", label: "Descargables", icon: DocumentText },
		{
			href: "/technician/materiales-cliente",
			label: "Info para cliente",
			icon: DocumentText,
		},
		{ href: "/admin/workers", label: "Trabajadores", icon: Profile },
		{ href: "/admin/visits", label: "Visitas", icon: Location },
		{ href: "/admin/settings", label: "Configuración", icon: Settings },
	],
	administrative: [
		{ href: "/admin/sales", label: "Ventas", icon: Clipboard },
		{ href: "/admin/descargables", label: "Descargables", icon: DocumentText },
		{
			href: "/technician/materiales-cliente",
			label: "Info para cliente",
			icon: DocumentText,
		},
		{ href: "/admin/visits", label: "Visitas", icon: Location },
		{ href: "/admin/settings", label: "Configuración", icon: Settings },
	],
	technician: [
		{
			href: "/technician/materiales-cliente",
			label: "Info para cliente",
			icon: DocumentText,
		},
		{ href: "/admin/settings", label: "Configuración", icon: Settings },
	],
};

function isActive(pathname: string, item: PrimaryItem) {
	if (item.exact) {
		return pathname === item.href;
	}
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type MobileBottomNavigationProps = {
	role: AppRole;
	signOutSlot: ReactNode;
	isLoading?: boolean;
};

export function MobileBottomNavigation({
	role,
	signOutSlot,
	isLoading = false,
}: MobileBottomNavigationProps) {
	const primaryMobileNavigation = primaryMobileNavigationByRole[role];
	const secondaryMobileNavigation = secondaryMobileNavigationByRole[role];
	const pathname = usePathname() ?? "";
	const [isMoreOpen, setIsMoreOpen] = useState(false);

	const onSecondaryRoute = secondaryMobileNavigation.some(
		(item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
	);

	return (
		<>
			{isLoading ? (
				<div
					aria-hidden="true"
					className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-[var(--border-soft)] bg-white/95 shadow-[0_-12px_32px_rgba(10,44,21,0.10)] backdrop-blur-md lg:hidden print:hidden"
				/>
			) : null}
			<nav
				aria-label="Navegación principal"
				className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-white/95 shadow-[0_-12px_32px_rgba(10,44,21,0.10)] backdrop-blur-md lg:hidden print:hidden ${isLoading ? "invisible" : "visible"}`}
			>
				<div
					className="pb-[env(safe-area-inset-bottom)]"
					style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
				>
					<div
						className="grid h-16 min-w-0"
						style={{
							gridTemplateColumns: `repeat(${primaryMobileNavigation.length + 1}, minmax(0, 1fr))`,
						}}
					>
						{primaryMobileNavigation.map((item) => {
							const Icon = item.icon;
							const active = isActive(pathname, item);
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? "page" : undefined}
									className={
									"flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium transition-[transform,color] duration-200 ease-out active:scale-[0.96] motion-reduce:transition-none " +
										(active
											? "text-[var(--brand-deep)]"
											: "text-[var(--muted)] hover:text-[var(--brand-strong)]")
									}
								>
									<Icon
										className={
											"h-5 w-5 " + (active ? "text-[var(--brand-strong)]" : "")
										}
									/>
									<span className="max-w-full truncate">{item.label}</span>
								</Link>
							);
						})}
						<button
							type="button"
							aria-haspopup="dialog"
							aria-expanded={isMoreOpen}
							onClick={() => setIsMoreOpen((open) => !open)}
							className={
								"flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium transition-[transform,color] duration-200 ease-out active:scale-[0.96] motion-reduce:transition-none " +
								(onSecondaryRoute || isMoreOpen
									? "text-[var(--brand-deep)]"
									: "text-[var(--muted)] hover:text-[var(--brand-strong)]")
							}
						>
							<More
									size={20}
									weight="Outline"
									className={
										`transition-transform duration-200 ease-out ${onSecondaryRoute || isMoreOpen ? "text-[var(--brand-strong)]" : ""} ${isMoreOpen ? "rotate-90" : "rotate-0"}`
									}
								/>
							<span className="max-w-full truncate">Más</span>
						</button>
					</div>
				</div>
			</nav>

			<Drawer
				open={isMoreOpen}
				onCloseAction={() => setIsMoreOpen(false)}
				title="Más opciones"
			>
				<div className="relative w-full bg-[rgba(255,255,255,0.98)] lg:hidden print:hidden">
					<div className="flex items-center justify-between px-5 pt-4">
						<h2 className="text-base font-semibold tracking-[-0.02em] text-[var(--brand-deep)]">
							Más opciones
						</h2>
						<button
							type="button"
							onClick={() => setIsMoreOpen(false)}
							aria-label="Cerrar"
							className="rounded-full border border-[var(--border-soft)] bg-white p-2 text-[var(--muted)] transition duration-200 ease-out hover:text-[var(--brand-deep)] motion-reduce:transition-none"
						>
							<Add size={16} weight="Outline" className="rotate-45" />
						</button>
					</div>

					<nav
						aria-label="Secciones secundarias"
						className="flex flex-col gap-2 px-5 pt-4"
					>
						{secondaryMobileNavigation.map((item, index) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMoreOpen(false)}
									className="flex min-h-[44px] min-w-0 items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color] duration-200 ease-out hover:border-[var(--brand-strong)]/40 hover:bg-[var(--surface-strong)] active:scale-[0.96] motion-safe:animate-[drawer-item-in_220ms_ease-out_both] motion-reduce:animate-none"
									style={{ animationDelay: `${index * 28}ms` }}
								>
									<Icon
										size={20}
										weight="Outline"
										className="text-[var(--brand-strong)]"
									/>
									<span className="min-w-0 truncate">{item.label}</span>
								</Link>
							);
						})}
					</nav>

					<div
						className="mx-5 mt-4 rounded-[24px] border border-[var(--border-soft)] bg-white p-4"
						style={{
							paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
						}}
					>
						{signOutSlot}
					</div>
				</div>
			</Drawer>
		</>
	);
}
