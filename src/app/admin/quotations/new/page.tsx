import { AppShell } from "@/components/app-shell";
import { EditQuotationForm as QuotationForm } from "@/features/quotations/quotation-form";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";

export default async function NewQuotationPage() {
	const user = await requireRole(["admin"]);

	const clients = await getClients();

	return (
		<AppShell
			role="admin"
			title="Nueva cotización"
			description="Crea una nueva solicitud de cotización con datos del proveedor, productos y términos."
			email={user.email}
		>
			<QuotationForm clients={clients} />
		</AppShell>
	);
}
