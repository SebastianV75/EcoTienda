import Link from "next/link";
import type { ReactNode } from "react";

import { AuthStatus } from "@/components/auth-status";
import { roleConfig } from "@/features/auth/roles";
import type { AppRole } from "@/types/auth";

const navigation = [
	{ href: "/admin", label: "Dashboard" },
	{ href: "/admin/documents", label: "Documents" },
	{ href: "/admin/quotations", label: "Quotations" },
	{ href: "/admin/visits", label: "Technical visits" },
	{ href: "/admin/settings", label: "Settings" },
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
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
				<aside className="border-b border-white/10 bg-slate-900/80 px-4 py-5 lg:w-72 lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
							EcoTienda
						</p>
						<h1 className="text-2xl font-semibold">Operations platform</h1>
						<p className="text-sm text-slate-300">
							{roleConfig[role].description}
						</p>
					</div>

					<nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col">
						{navigation.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400 hover:text-white lg:rounded-xl"
							>
								{item.label}
							</Link>
						))}
					</nav>

					{email ? <AuthStatus email={email} /> : null}
				</aside>

				<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
					<header className="mb-8 space-y-2">
						<p className="text-sm font-medium text-emerald-300">
							{roleConfig[role].label} area
						</p>
						<h2 className="text-3xl font-semibold tracking-tight text-white">
							{title}
						</h2>
						<p className="max-w-2xl text-sm text-slate-300 sm:text-base">
							{description}
						</p>
					</header>

					{children}
				</main>
			</div>
		</div>
	);
}
