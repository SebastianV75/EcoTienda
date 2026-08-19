import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";
import { UnauthorizedBackButton } from "./back-button";

export default function UnauthorizedPage() {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f0e7] px-4 py-6 text-[var(--foreground)] sm:px-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(47,179,20,0.13),transparent_23%),radial-gradient(circle_at_92%_8%,rgba(224,178,71,0.15),transparent_19%)]" />
			<section className="relative w-full max-w-2xl border border-[rgba(13,79,46,0.14)] bg-[rgba(255,253,247,0.78)] px-6 py-7 shadow-[0_28px_90px_rgba(10,44,21,0.09)] backdrop-blur-[2px] sm:px-10 sm:py-10">
				<header className="flex items-center gap-3 border-b border-[rgba(13,79,46,0.12)] pb-6">
					<Link
						href="/"
						className="group flex items-center gap-3"
						aria-label="EcoTienda, inicio"
					>
						<span className="grid h-10 w-10 place-items-center border border-[var(--brand-deep)] bg-[var(--brand-deep)] text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-transform duration-200 ease-out group-hover:-rotate-3">
							ET
						</span>
						<span>
							<span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--brand-deep)]">
								EcoTienda
							</span>
							<span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
								Centro operativo
							</span>
						</span>
					</Link>
				</header>

				<div className="max-w-xl py-12 sm:py-16">
					<div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						<span className="h-px w-8 bg-[var(--brand-strong)]" />
						Acceso limitado
					</div>
					<h1 className="max-w-[16ch] text-5xl font-semibold leading-[0.92] tracking-[-0.075em] text-[var(--brand-deep)] sm:text-6xl">
						Esta página no está disponible para tu cuenta.
					</h1>
					<p className="mt-7 max-w-lg text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
						No tienes el permiso necesario para esta sección. Tu sesión sigue activa:
						puedes volver a la pantalla anterior y continuar donde estabas.
					</p>

					<div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
						<UnauthorizedBackButton />
						<Link
							href="/"
							className="inline-flex min-h-12 items-center justify-center border-b border-[rgba(13,79,46,0.28)] px-1 text-sm font-semibold text-[var(--brand-deep)] transition-[border-color,color] duration-200 ease-out hover:border-[var(--brand)] hover:text-[var(--brand-strong)]"
						>
							Ir al inicio
						</Link>
						<form action={signOutAction}>
							<button
								type="submit"
								className="inline-flex min-h-12 items-center justify-center px-1 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
							>
								Cerrar sesión
							</button>
						</form>
					</div>
				</div>

				<footer className="border-t border-[rgba(13,79,46,0.12)] pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
					Si necesitas acceso, solicita al administrador que revise tu perfil.
				</footer>
			</section>
		</main>
	);
}
