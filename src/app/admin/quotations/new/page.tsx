import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EditQuotationForm as QuotationForm } from "@/features/quotations/quotation-form";
import { requireRole } from "@/features/auth/session";

export default async function NewQuotationPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;

	// Establecer fecha actual como valor por defecto
	const today = new Date();
	const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	return (
		<AppShell
			role="admin"
			title="Nueva cotización"
			description="Crea una nueva solicitud de cotización con datos del proveedor, productos y términos."
			email={user.email}
		>
			<div className="space-y-4">
				<Link href="/admin/quotations" className="ui-secondary-action">
					← Volver a cotizaciones
				</Link>
				<QuotationForm
					initialData={{
						quotation_number: null,
						quotation_id: null,
						trabajo_id: params?.trabajoId ?? null,
						supplier_name: "",
						project: null,
						status: "draft",
						terms_and_conditions: null,
						order_deadline: todayString,
						expected_delivery: null,
						items: [],
					}}
				/>
			</div>
		</AppShell>
	);
}
