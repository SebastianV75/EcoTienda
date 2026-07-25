import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser, requireRole } from "@/features/auth/session";
import { getTrabajosForList } from "@/features/trabajos/data";
import { getWorkerByAuthUserId } from "@/features/workers/data";
import { hasSupabaseEnv } from "@/lib/env";
import { trabajoStageLabels } from "@/types/trabajo";

function formatAppointment(dateString: string | null) {
	if (!dateString) {
		return null;
	}

	return new Intl.DateTimeFormat("es-MX", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(new Date(dateString));
}

function getUtcDayStamp(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getTechnicianBucket(dateString: string | null) {
	if (!dateString) {
		return "later" as const;
	}

	const appointment = new Date(dateString);
	const today = new Date();
	const appointmentStamp = getUtcDayStamp(appointment);
	const todayStamp = getUtcDayStamp(today);
	const diffDays = Math.round(
		(appointmentStamp - todayStamp) / (24 * 60 * 60 * 1000),
	);

	if (diffDays <= 0) {
		return "today" as const;
	}

	if (diffDays <= 3) {
		return "next" as const;
	}

	return "later" as const;
}

export default async function TechnicianPage() {
	const user = hasSupabaseEnv()
		? await requireRole(["admin", "technician"])
		: await getCurrentUser();

	if (!user) {
		redirect("/auth/sign-in");
	}

	const worker = await getWorkerByAuthUserId(user.id);

	if (!worker) {
		return (
			<AppShell
				role="technician"
				title="No encontramos tu vínculo de técnico"
				description="Tu sesión entró con permiso de técnico, pero no hay un trabajador activo enlazado a esta cuenta."
				email={user.email}
			>
				<section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
					<p className="font-medium">
						La sesión llegó con rol técnico, pero no hay un trabajador activo
						enlazado a esta cuenta.
					</p>
					<p className="mt-2 break-all">
						Cuenta detectada: <strong>{user.email ?? "sin correo"}</strong>
					</p>
					<p className="break-all">
						UID de Auth: <strong>{user.id}</strong>
					</p>
					<p className="mt-2">
						Revisá que exista un worker activo con ese mismo{" "}
						<code>auth_user_id</code>.
					</p>
				</section>
			</AppShell>
		);
	}

	if (!worker.active || worker.role !== "technician") {
		return (
			<AppShell
				role="technician"
				title="La cuenta está vinculada, pero todavía no está habilitada"
				description="Encontramos el trabajador, pero su estado o rol todavía no habilita la vista técnica."
				email={user.email}
			>
				<section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
					<p>
						Trabajador detectado: <strong>{worker.full_name}</strong>
					</p>
					<p>
						Rol actual: <strong>{worker.role}</strong>
					</p>
					<p>
						Activo: <strong>{worker.active ? "sí" : "no"}</strong>
					</p>
					<p className="mt-2">
						Para entrar acá, el worker debe estar activo y con rol{" "}
						<code>technician</code>.
					</p>
				</section>
			</AppShell>
		);
	}

	const trabajos = await getTrabajosForList({
		assignee_worker_id: worker.id,
	});
	const debugCounts = {
		totalAssigned: trabajos.length,
		ready: trabajos.filter(
			(trabajo) =>
				trabajo.current_stage === "agenda" ||
				trabajo.current_stage === "visita",
		).length,
	};
	const groupedTrabajos = {
		today: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "today",
		),
		next: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "next",
		),
		later: trabajos.filter(
			(trabajo) => getTechnicianBucket(trabajo.appointment_at) === "later",
		),
	};
	const readyCount = trabajos.filter(
		(trabajo) =>
			trabajo.current_stage === "agenda" || trabajo.current_stage === "visita",
	).length;
	const adminFollowUpCount = trabajos.length - readyCount;
	const sections = [
		{
			key: "today",
			title: "Hoy",
			description: "Lo que ya toca resolver o ya quedó corriendo hoy.",
			items: groupedTrabajos.today,
		},
		{
			key: "next",
			title: "Próximo",
			description:
				"Lo que se viene en los siguientes días y conviene tener presente.",
			items: groupedTrabajos.next,
		},
		{
			key: "later",
			title: "Después",
			description:
				"Lo que todavía no te pide acción inmediata o sigue en espera administrativa.",
			items: groupedTrabajos.later,
		},
	] as const;

	return (
		<AppShell
			role="technician"
			title="Mis trabajos"
			description="Acá ves todo lo que te asignaron. Abrí los trabajos listos para visita y dejá ubicados los que siguen en administración."
			email={user.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
						Trabajo asignado
					</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
						{worker.full_name}
					</h1>
					<p className="mt-3 text-sm leading-6 text-[var(--muted)]">
						Acá ves los trabajos que ya te tocaron. Abrí los que están listos
						para visita; los demás quedan en seguimiento administrativo.
					</p>
					<div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
						<span>{trabajos.length} trabajos asignados</span>
						<span>{debugCounts.ready} listos para visita</span>
						<span>Filtrado por tu asignación</span>
					</div>
				</section>

				{trabajos.length > 0 ? (
					<section className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
								Hoy
							</p>
							<p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{groupedTrabajos.today.length}
							</p>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Trabajos que ya te piden foco inmediato.
							</p>
						</div>
						<div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
								Próximo
							</p>
							<p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{groupedTrabajos.next.length}
							</p>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Trabajos que vienen enseguida.
							</p>
						</div>
						<div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
								Pendiente admin
							</p>
							<p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
								{adminFollowUpCount}
							</p>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Trabajos que todavía no te piden acción técnica.
							</p>
						</div>
					</section>
				) : null}

				{trabajos.length > 0 ? (
					<div className="space-y-4">
						{sections.map((section) =>
							section.items.length > 0 ? (
								<section
									key={section.key}
									className="rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.72)] p-4 shadow-sm"
								>
									<div className="flex flex-col gap-1 border-b border-[var(--border-soft)] pb-3 sm:flex-row sm:items-end sm:justify-between">
										<div>
											<p className="text-sm font-semibold text-[var(--brand-deep)]">
												{section.title}
											</p>
											<p className="mt-1 text-sm text-[var(--muted)]">
												{section.description}
											</p>
										</div>
										<span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
											{section.items.length} trabajo
											{section.items.length === 1 ? "" : "s"}
										</span>
									</div>
									<div className="mt-3 grid gap-2.5">
										{section.items.map((trabajo) => {
											const appointmentLabel = formatAppointment(
												trabajo.appointment_at,
											);
											const isVisitReady =
												trabajo.current_stage === "agenda" ||
												trabajo.current_stage === "visita";
											const statusLabel = isVisitReady
												? "Listo para visita"
												: "Pendiente de administración";

											return (
												<article
													key={trabajo.id}
													className="rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm"
												>
													<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
														<div className="min-w-0 flex-1">
															<div className="flex flex-wrap items-center gap-2">
																<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
																	{trabajoStageLabels[trabajo.current_stage]}
																</p>
																<span
																	className={
																		isVisitReady
																			? "inline-flex items-center rounded-full border border-[rgba(13,79,46,0.16)] bg-[rgba(239,246,239,0.92)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-deep)]"
																			: "inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]"
																	}
																>
																	{statusLabel}
																</span>
															</div>
															<h2 className="mt-2 text-base font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-lg">
																{trabajo.client_name ?? trabajo.intake_name}
															</h2>
															{appointmentLabel ? (
																<p className="mt-2 text-sm font-semibold text-[var(--brand-deep)]">
																	Cita: {appointmentLabel}
																</p>
															) : (
																<p className="mt-2 text-sm text-[var(--muted)]">
																	Sin cita capturada todavía.
																</p>
															)}
															<p className="mt-1 text-sm leading-6 text-[var(--muted)]">
																{trabajo.intake_address_text}
															</p>
															<p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
																{isVisitReady
																	? "Acción disponible: abrí la visita técnica"
																	: "Sin acción técnica: queda en seguimiento administrativo"}
															</p>
														</div>

														{isVisitReady ? (
															<Link
																href={`/admin/visits/${trabajo.id}`}
																className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] active:scale-[0.96] lg:min-w-[180px]"
															>
																Abrir visita técnica
															</Link>
														) : (
															<span className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] lg:min-w-[180px]">
																Pendiente de administración
															</span>
														)}
													</div>
												</article>
											);
										})}
									</div>
								</section>
							) : null,
						)}
					</div>
				) : (
					<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-sm">
						<p className="text-sm font-medium text-[var(--brand-deep)]">
							No tenés trabajos abiertos asignados ahora.
						</p>
						<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
							Cuando te asignen uno, va a aparecer acá con la acción lista para
							abrir la visita.
						</p>
					</section>
				)}
			</div>
		</AppShell>
	);
}
