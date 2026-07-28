import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

function Skeleton({ className = "" }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={`animate-pulse motion-reduce:animate-none rounded-none bg-[rgba(13,79,46,0.08)] ${className}`}
		/>
	);
}

function StageCardSkeleton({ children }: { children: ReactNode }) {
	return (
		<section className="rounded-card border border-[var(--border-soft)] bg-white p-5 shadow-card sm:p-6">
			<div className="flex items-center gap-3">
				<Skeleton className="h-4 w-28 rounded-[999px]" />
				<Skeleton className="h-6 w-16 rounded-full border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.9)]" />
			</div>
			<div className="mt-5">{children}</div>
		</section>
	);
}

function FieldRowSkeleton({ labelWidth = "w-20" }: { labelWidth?: string }) {
	return (
		<div className="space-y-2">
			<Skeleton className={`h-3 ${labelWidth} rounded-[999px]`} />
			<Skeleton className="h-4 w-full rounded-[999px]" />
		</div>
	);
}

export default function TrabajoDetailLoading() {
	return (
		<AppShell
			role="admin"
			title="Trabajo"
			description="Vista unificada del trabajo"
		>
			<div className="space-y-4">
				<section className="rounded-panel border border-[var(--border-soft)] bg-white p-5 shadow-panel sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<Skeleton className="h-7 w-[min(22rem,82%)] rounded-[999px]" />
							<Skeleton className="mt-3 h-4 w-[min(34rem,92%)] rounded-[999px]" />
						</div>
						<Skeleton className="h-10 w-40 rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(244,247,244,0.9)]" />
					</div>
				</section>

				<section className="rounded-card border border-[var(--border-soft)] bg-white p-5 shadow-card sm:p-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1 space-y-3">
							<Skeleton className="h-3 w-20 rounded-[999px]" />
							<div className="grid grid-cols-5 gap-2 sm:gap-3">
								{Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className="space-y-2 rounded-[18px] border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.55)] p-3"
									>
										<Skeleton className="mx-auto h-3 w-8 rounded-[999px]" />
										<Skeleton className="h-8 rounded-[999px]" />
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				<div className="space-y-4">
					<StageCardSkeleton>
						<div className="grid gap-4 md:grid-cols-2">
							<FieldRowSkeleton labelWidth="w-24" />
							<FieldRowSkeleton labelWidth="w-20" />
							<FieldRowSkeleton labelWidth="w-20" />
							<FieldRowSkeleton labelWidth="w-24" />
							<div className="space-y-2 md:col-span-2">
								<Skeleton className="h-3 w-16 rounded-[999px]" />
								<Skeleton className="h-16 rounded-[18px]" />
							</div>
						</div>
					</StageCardSkeleton>

					<StageCardSkeleton>
						<div className="grid gap-4 md:grid-cols-2">
							<FieldRowSkeleton labelWidth="w-24" />
							<FieldRowSkeleton labelWidth="w-24" />
							<FieldRowSkeleton labelWidth="w-20" />
							<FieldRowSkeleton labelWidth="w-28" />
							<div className="space-y-2 md:col-span-2">
								<Skeleton className="h-3 w-12 rounded-[999px]" />
								<Skeleton className="h-20 rounded-[18px]" />
							</div>
							<div className="grid gap-3 sm:grid-cols-3 md:col-span-2">
								{Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className="rounded-[18px] border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.55)] p-3"
									>
										<Skeleton className="h-3 w-16 rounded-[999px]" />
										<Skeleton className="mt-2 h-9 rounded-[999px]" />
									</div>
								))}
							</div>
						</div>
					</StageCardSkeleton>

					<StageCardSkeleton>
						<div className="grid gap-4 md:grid-cols-2">
							<FieldRowSkeleton labelWidth="w-20" />
							<FieldRowSkeleton labelWidth="w-20" />
							<FieldRowSkeleton labelWidth="w-24" />
							<FieldRowSkeleton labelWidth="w-24" />
							<div className="space-y-2 md:col-span-2">
								<Skeleton className="h-3 w-16 rounded-[999px]" />
								<Skeleton className="h-12 rounded-[18px]" />
							</div>
						</div>
					</StageCardSkeleton>

					<StageCardSkeleton>
						<div className="space-y-3">
							<Skeleton className="h-4 w-32 rounded-[999px]" />
							<Skeleton className="h-4 w-24 rounded-[999px]" />
							<Skeleton className="h-16 rounded-[18px]" />
						</div>
					</StageCardSkeleton>

					<StageCardSkeleton>
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-[16px] border border-[rgba(13,79,46,0.06)] bg-[rgba(244,247,244,0.55)] p-4"
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="min-w-0 flex-1 space-y-2">
											<Skeleton className="h-4 w-32 rounded-[999px]" />
											<Skeleton className="h-3 w-24 rounded-[999px]" />
										</div>
									</div>
									<Skeleton className="h-10 w-24 rounded-full border border-[rgba(13,79,46,0.08)] bg-[rgba(255,255,255,0.8)]" />
								</div>
							))}
						</div>
					</StageCardSkeleton>
				</div>
			</div>
		</AppShell>
	);
}
