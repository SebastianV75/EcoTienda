import Link from "next/link";

export default function HomePage() {
	return (
		<main className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(47,179,20,0.16),transparent_22%),radial-gradient(circle_at_86%_14%,rgba(166,124,57,0.14),transparent_18%),linear-gradient(180deg,rgba(247,242,231,0.95),rgba(255,255,255,0.72))]" />
			<div className="pointer-events-none absolute inset-x-[12%] top-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(13,79,46,0.16),transparent)] lg:block" />
			<div className="pointer-events-none absolute left-[16%] top-0 hidden h-full w-px bg-[linear-gradient(180deg,transparent,rgba(13,79,46,0.12),transparent)] lg:block" />
			<div className="pointer-events-none absolute right-[7%] top-[14%] hidden h-64 w-64 rounded-full border border-[var(--border-soft)] bg-white/30 blur-3xl lg:block" />

			<section className="relative mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-7xl flex-col justify-between gap-10 sm:min-h-[calc(100vh-48px)] lg:gap-16">
				<header className="flex items-start justify-between gap-6 pt-1 sm:pt-2 lg:pt-4">
					<div className="space-y-2">
						<p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[var(--brand-strong)]">
							EcoTienda
						</p>
						<p className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]/72">
							Entrada
						</p>
					</div>

					<span className="inline-flex shrink-0 items-center rounded-full border border-[var(--border-soft)] bg-white/65 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]/80 shadow-[0_12px_32px_rgba(10,44,21,0.06)] backdrop-blur-sm">
						Reservado
					</span>
				</header>

				<div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-14">
					<section className="flex flex-col justify-between pt-8 sm:pt-12 lg:pt-20">
						<div>
							<h1 className="mt-5 max-w-[8ch] text-[clamp(4.4rem,14vw,8rem)] font-semibold tracking-[-0.1em] leading-[0.84] text-[var(--brand-deep)] text-balance">
								EcoTienda
							</h1>
							<p className="mt-5 max-w-[22rem] text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
								Entrá a una operación más clara, sobria y directa desde el primer paso.
							</p>
						</div>

						<div className="mt-10 space-y-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<Link
									href="/auth/sign-in"
									className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-deep)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(13,79,46,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] sm:w-auto"
								>
									Iniciar sesión
								</Link>
								<div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]/72 sm:pl-1">
									<span className="hidden h-px w-8 bg-[var(--border-soft)] sm:block" />
									<Link
										href="/admin"
										className="font-medium text-[var(--brand-deep)] underline decoration-[var(--brand-strong)]/20 underline-offset-4 transition hover:decoration-[var(--brand-strong)]"
									>
										Admin
									</Link>
								</div>
							</div>
						</div>
					</section>

					<aside className="relative min-h-[14rem] overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,240,227,0.92))] p-6 shadow-[0_28px_78px_rgba(10,44,21,0.08)] sm:min-h-[18rem] sm:p-7 lg:min-h-[38rem] lg:p-8">
						<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(13,79,46,0.16),transparent)]" />
						<div className="pointer-events-none absolute inset-y-8 right-8 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(13,79,46,0.12),transparent)] lg:block" />

						<div className="flex h-full flex-col justify-between gap-8">
							<div className="space-y-6">
								<p className="max-w-[10ch] text-[clamp(2.8rem,9vw,5rem)] font-semibold tracking-[-0.08em] leading-[0.9] text-[var(--brand-deep)] text-balance">
									Operación con presencia.
								</p>
								<p className="max-w-[20rem] text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
									Una entrada pensada para llegar al sistema sin fricción, con el acceso al frente y todo lo demás en su lugar.
								</p>
								<div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]/72">
									<span className="h-px w-10 bg-[var(--border-soft)]" />
									<span>Acceso interno</span>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</section>
		</main>
	);
}
