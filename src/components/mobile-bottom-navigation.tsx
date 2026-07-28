"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	useEffect,
	useId,
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
	Users,
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
	technician: [
		{ href: "/technician", label: "Visitas técnicas", icon: Location, exact: true },
	],
};

const secondaryMobileNavigationByRole: Record<AppRole, SecondaryItem[]> = {
	admin: [
		{ href: "/admin/sales", label: "Ventas", icon: Clipboard },
		{ href: "/admin/documents", label: "Documentos", icon: DocumentText },
		{ href: "/admin/clients", label: "Clientes", icon: Users },
		{ href: "/admin/workers", label: "Trabajadores", icon: Profile },
		{ href: "/admin/visits", label: "Visitas", icon: Location },
		{ href: "/admin/settings", label: "Configuración", icon: Settings },
	],
	technician: [],
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
};

export function MobileBottomNavigation({
	role,
	signOutSlot,
}: MobileBottomNavigationProps) {
	const primaryMobileNavigation = primaryMobileNavigationByRole[role];
	const secondaryMobileNavigation = secondaryMobileNavigationByRole[role];
	const pathname = usePathname() ?? "";
	const [isMoreOpen, setIsMoreOpen] = useState(false);
	const sheetTitleId = useId();

	const onSecondaryRoute = secondaryMobileNavigation.some(
		(item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
	);

	useEffect(() => {
		if (!isMoreOpen) {
			return;
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsMoreOpen(false);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isMoreOpen]);

	function onSheetPanelPointerDown(event: React.PointerEvent<HTMLDivElement>) {
		const target = event.currentTarget;
		target.dataset.pointerStartY = String(event.clientY);
	}

	function onSheetPanelPointerUp(event: React.PointerEvent<HTMLDivElement>) {
		const target = event.currentTarget;
		const startY = Number(target.dataset.pointerStartY);
		if (Number.isFinite(startY) && event.clientY - startY >= 48) {
			setIsMoreOpen(false);
		}
		target.dataset.pointerStartY = "";
	}

	return (
		<>
			<nav
				aria-label="Navegación principal"
				className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-white/95 shadow-[0_-12px_32px_rgba(10,44,21,0.10)] backdrop-blur-md lg:hidden print:hidden"
			>
				<div
					className="pb-[env(safe-area-inset-bottom)]"
					style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
				>
					<div
						className="grid h-16"
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
										"flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-[transform,color] duration-200 ease-out active:scale-[0.96] motion-reduce:transition-none " +
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
									<span>{item.label}</span>
								</Link>
							);
						})}
						<button
							type="button"
							aria-haspopup="dialog"
							aria-expanded={isMoreOpen}
							aria-controls={isMoreOpen ? sheetTitleId : undefined}
							onClick={() => setIsMoreOpen((open) => !open)}
							className={
								"flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-[transform,color] duration-200 ease-out active:scale-[0.96] motion-reduce:transition-none " +
								(onSecondaryRoute || isMoreOpen
									? "text-[var(--brand-deep)]"
									: "text-[var(--muted)] hover:text-[var(--brand-strong)]")
							}
						>
							<More
								size={20}
								weight="Outline"
								className={
									onSecondaryRoute || isMoreOpen
										? "text-[var(--brand-strong)]"
										: undefined
								}
							/>
							<span>Más</span>
						</button>
					</div>
				</div>
			</nav>

			{isMoreOpen ? (
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby={sheetTitleId}
					className="fixed inset-0 z-50 flex items-end lg:hidden print:hidden"
				>
					<button
						type="button"
						aria-label="Cerrar menú"
						onClick={() => setIsMoreOpen(false)}
						className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none"
					/>
					<div
						onPointerDown={onSheetPanelPointerDown}
						onPointerUp={onSheetPanelPointerUp}
						className="relative w-full rounded-t-[28px] bg-[rgba(255,255,255,0.98)] shadow-[0_-24px_60px_rgba(10,44,21,0.22)] transition-transform duration-200 ease-out motion-reduce:transition-none"
					>
						<div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[var(--border-soft)]" />
						<div className="flex items-center justify-between px-5 pt-4">
							<h2
								id={sheetTitleId}
								className="text-base font-semibold tracking-[-0.02em] text-[var(--brand-deep)]"
							>
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
							{secondaryMobileNavigation.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsMoreOpen(false)}
										className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color] duration-200 ease-out hover:border-[var(--brand-strong)]/40 hover:bg-[var(--surface-strong)] active:scale-[0.96] motion-reduce:transition-none"
									>
										<Icon
											size={20}
											weight="Outline"
											className="text-[var(--brand-strong)]"
										/>
										<span>{item.label}</span>
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
				</div>
			) : null}
		</>
	);
}
