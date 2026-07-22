import { AppShell } from "@/components/app-shell";
import { EditQuotationForm as QuotationForm } from "@/features/quotations/quotation-form";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";

export default async function NewQuotationPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;

	const clients = await getClients();

	return (
		<AppShell
			role="admin"
			title="Nueva cotización"
			description="Crea una nueva solicitud de cotización con datos del proveedor, productos y términos."
			email={user.email}
		>
			<QuotationForm clients={clients} initialData={{ quotation_number: null, trabajo_id: params?.trabajoId ?? null, supplier_name: "", project: null, status: null, terms_and_conditions: null, order_deadline: null, expected_delivery: null, items: [] }} />
		</AppShell>
	);
}
