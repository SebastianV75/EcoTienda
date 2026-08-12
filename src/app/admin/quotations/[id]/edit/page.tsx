import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EditQuotationForm } from "@/features/quotations/quotation-form";
import { requireRole } from "@/features/auth/session";
import { getQuotationById } from "@/features/quotations/data";

export default async function EditQuotationPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const { id } = await params;

	const quotation = await getQuotationById(id);

	const initialData = {
		quotation_number: quotation.quotation_number,
		quotation_id: quotation.id,
		trabajo_id: quotation.trabajo_id ?? null,
		supplier_name: quotation.supplier_name,
		project: quotation.project,
		status: quotation.status,
		terms_and_conditions: quotation.terms_and_conditions,
		order_deadline: quotation.order_deadline,
		expected_delivery: quotation.expected_delivery,
		items: quotation.items,
	};

	return (
		<AppShell
			role={user.role}
			title={`Editar cotización ${quotation.quotation_number ?? ""}`}
			description="Modifica los datos de la cotización, productos y términos."
			email={user.email}
		>
			<div className="space-y-4">
				<Link href="/admin/quotations" className="ui-secondary-action">
					← Volver a cotizaciones
				</Link>
				<EditQuotationForm initialData={initialData} />
			</div>
		</AppShell>
	);
}
