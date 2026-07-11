"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";

type PrimaryItem = {
	href: string;
	label: string;
	icon: (props: { className?: string }) => ReactNode;
	exact?: boolean;
};

type SecondaryItem = {
	href: string;
	label: string;
	icon: (props: { className?: string }) => ReactNode;
};

function HomeIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M3 11.5 12 4l9 7.5" />
			<path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
		</svg>
	);
}

function UsersIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="9" cy="8" r="3.5" />
			<path d="M2.5 19c.7-3 3.3-4.5 6.5-4.5s5.8 1.5 6.5 4.5" />
			<circle cx="17" cy="9" r="2.5" />
			<path d="M16 14.5c2.4.1 4.4 1.4 5 3.5" />
		</svg>
	);
}

function DownloadIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M12 4v12" />
			<path d="m7 11 5 5 5-5" />
			<path d="M5 20h14" />
		</svg>
	);
}

function QuoteIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
			<path d="M15 3v4h4" />
			<path d="M9 12h6" />
			<path d="M9 16h6" />
		</svg>
	);
}

function MoreIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
			<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
			<circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
		</svg>
	);
}

function VisitsIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
			<circle cx="12" cy="10" r="2.5" />
		</svg>
	);
}

function SettingsIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
		</svg>
	);
}

function CloseIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M6 6 18 18" />
			<path d="M18 6 6 18" />
		</svg>
	);
}

const primaryMobileNavigation: PrimaryItem[] = [
	{ href: "/admin", label: "Inicio", icon: HomeIcon, exact: true },
	{ href: "/admin/clients", label: "Clientes", icon: UsersIcon },
	{ href: "/admin/documents", label: "Descargables", icon: DownloadIcon },
	{ href: "/admin/quotations", label: "Cotizaciones", icon: QuoteIcon },
];

const secondaryMobileNavigation: SecondaryItem[] = [
	{ href: "/admin/visits", label: "Visitas técnicas", icon: VisitsIcon },
	{ href: "/admin/settings", label: "Configuración", icon: SettingsIcon },
];

function isActive(pathname: string, item: PrimaryItem) {
	if (item.exact) {
		return pathname === item.href;
	}
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type MobileBottomNavigationProps = {
	signOutSlot: ReactNode;
};

export function MobileBottomNavigation({
	signOutSlot,
}: MobileBottomNavigationProps) {
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
					<div className="grid h-16 grid-cols-5">
						{primaryMobileNavigation.map((item) => {
							const Icon = item.icon;
							const active = isActive(pathname, item);
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? "page" : undefined}
									className={
										"flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none " +
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
								"flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none " +
								(onSecondaryRoute || isMoreOpen
									? "text-[var(--brand-deep)]"
									: "text-[var(--muted)] hover:text-[var(--brand-strong)]")
							}
						>
							<MoreIcon
								className={
									"h-5 w-5 " +
									(onSecondaryRoute || isMoreOpen
										? "text-[var(--brand-strong)]"
										: "")
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
								className="rounded-full border border-[var(--border-soft)] bg-white p-2 text-[var(--muted)] transition duration-200 ease-out hover:text-[var(--brand-deep)] active:scale-[0.97] motion-reduce:transition-none"
							>
								<CloseIcon className="h-4 w-4" />
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
										className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-[var(--brand-strong)]/40 hover:bg-[var(--surface-strong)] active:scale-[0.99] motion-reduce:transition-none"
									>
										<Icon className="h-5 w-5 text-[var(--brand-strong)]" />
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
