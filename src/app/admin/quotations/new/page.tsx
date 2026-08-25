import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EditQuotationForm as QuotationForm } from "@/features/quotations/quotation-form";
import { getQuotationByTrabajoId } from "@/features/quotations/data";
import { requireRole } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewQuotationPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const params = searchParams ? await searchParams : undefined;
	const linkedTrabajoId = params?.trabajoId?.trim() || null;
	let linkedTrabajo: {
		id: string;
		current_stage: string;
		status: string;
		visita_completed_at: string | null;
	} | null = null;
	let linkedQuotation = null;

	if (linkedTrabajoId) {
		const supabase = await createSupabaseServerClient();
		const [{ data: trabajo }, quotation] = await Promise.all([
			supabase
				.from("trabajos")
				.select("id, current_stage, status, visita_completed_at")
				.eq("id", linkedTrabajoId)
				.maybeSingle(),
			getQuotationByTrabajoId(linkedTrabajoId),
		]);
		linkedTrabajo = trabajo;
		linkedQuotation = quotation;
	}

	const linkedTrabajoCanCreate =
		!linkedTrabajoId ||
		(Boolean(linkedTrabajo) &&
			linkedTrabajo?.status !== "archived" &&
			linkedTrabajo?.current_stage === "cotizacion" &&
			Boolean(linkedTrabajo.visita_completed_at) &&
			!linkedQuotation);

	// Establecer fecha actual como valor por defecto
	const today = new Date();
	const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	return (
		<AppShell
			role={user.role}
			title="Nueva cotización"
			description="Crea una nueva solicitud de cotización con datos del proveedor, productos y términos."
			email={user.email}
		>
			<div className="space-y-4">
				<Link href="/admin/quotations" className="ui-secondary-action">
					← Volver a cotizaciones
				</Link>
				{linkedTrabajoId && !linkedTrabajo ? (
					<section className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
						<p className="font-semibold text-rose-900">Trabajo no encontrado</p>
						<p className="mt-1">
							Regresa al listado y abre un trabajo válido para crear la
							cotización.
						</p>
					</section>
				) : linkedQuotation ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
						<p className="font-semibold text-amber-900">
							El trabajo ya tiene cotización
						</p>
						<p className="mt-1">
							Edita la cotización existente para no crear un registro duplicado.
						</p>
						<Link
							href={`/admin/quotations/${linkedQuotation.id}/edit`}
							className="mt-3 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 font-medium text-white"
						>
							Editar cotización existente
						</Link>
					</section>
				) : linkedTrabajoId && !linkedTrabajoCanCreate ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
						<p className="font-semibold text-amber-900">
							La visita aún no está lista
						</p>
						<p className="mt-1">
							Completa la visita técnica antes de crear una cotización
							vinculada.
						</p>
					</section>
				) : (
					<QuotationForm
						initialData={{
							quotation_number: null,
							quotation_id: null,
							trabajo_id: linkedTrabajoId,
							supplier_name: "",
							project: null,
							status: "draft",
							terms_and_conditions: null,
							order_deadline: todayString,
							expected_delivery: null,
							items: [],
						}}
					/>
				)}
			</div>
		</AppShell>
	);
}
