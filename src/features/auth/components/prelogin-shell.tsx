import type { ReactNode } from "react";

type PreloginShellProps = {
	eyebrow: string;
	title: string;
	description: string;
	primaryCta: ReactNode;
	secondaryContent?: ReactNode;
	children?: ReactNode;
};

export function PreloginShell({
	eyebrow,
	title,
	description,
	primaryCta,
	secondaryContent,
	children,
}: PreloginShellProps) {
	return (
		<main className="relative overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(47,179,20,0.08),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(13,79,46,0.06),transparent_24%),linear-gradient(180deg,rgba(247,250,244,0.9),rgba(255,255,255,0.98))]" />
			<div className="pointer-events-none absolute inset-x-[7%] top-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(13,79,46,0.14),transparent)] lg:block" />
			<section className="relative mx-auto min-h-[calc(100vh-32px)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.9)] shadow-[0_20px_80px_rgba(13,79,46,0.08)] backdrop-blur-sm lg:min-h-[calc(100vh-48px)] lg:rounded-[40px]">
				<div className="grid min-h-[inherit] lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
					<div className="relative flex flex-col gap-12 px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
						<div className="pointer-events-none absolute bottom-8 left-6 hidden h-[calc(100%-4rem)] w-px bg-[linear-gradient(180deg,transparent,rgba(13,79,46,0.16),transparent)] lg:block" />
						<div className="space-y-10 lg:pl-10">
							<div className="flex items-center gap-3">
								<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-deep)]">
									ET
								</span>
								<div className="space-y-1">
									<p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--brand-strong)]">
										{eyebrow}
									</p>
									<p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
										EcoTienda
									</p>
								</div>
							</div>

							<div className="max-w-xl space-y-5 sm:space-y-6">
								<h1 className="max-w-[14ch] text-[2.65rem] font-semibold tracking-[-0.08em] text-[var(--brand-deep)] text-balance sm:text-6xl lg:text-[5.15rem] lg:leading-[0.9]">
									{title}
								</h1>
								<p className="max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
									{description}
								</p>
							</div>

							<div className="space-y-4">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									{primaryCta}
								</div>
								{secondaryContent ? (
									<div className="max-w-sm text-sm leading-6 text-[var(--muted)]">
									{secondaryContent}
								</div>
							) : null}
						</div>
					</div>
					</div>

					<div className="relative px-6 py-8 sm:px-9 sm:py-10 lg:px-8 lg:py-12">
						<div className="pointer-events-none absolute left-0 top-10 hidden h-[calc(100%-5rem)] w-px bg-[linear-gradient(180deg,transparent,rgba(13,79,46,0.14),transparent)] lg:block" />
						<div className="flex h-full flex-col justify-between gap-8 lg:items-end">
							<div className="lg:mt-4 lg:w-full lg:max-w-[28rem]">{children}</div>
							<div className="hidden lg:block lg:h-px lg:w-24 lg:self-end bg-[linear-gradient(90deg,transparent,rgba(13,79,46,0.14),transparent)]" />
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
