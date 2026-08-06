export type Supplier = {
	id: string;
	name: string;
	nif: string | null;
	email: string | null;
	phone: string | null;
	reference: string | null;
	created_at: string;
	updated_at: string;
};

export type QuotationItem = {
	id?: string;
	quotation_id?: string;
	type?: "product" | "section" | "note";
	product_name: string;
	quantity: number;
	unit: string;
	unit_price: number;
	amount: number;
	sort_order: number;
};

export type Quotation = {
	id?: string;
	quotation_number?: string;
	trabajo_id?: string | null;
	supplier_id: string | null;
	supplier_name: string;
	supplier_reference: string | null;
	order_deadline: string | null;
	expected_delivery: string | null;
	require_confirmation: boolean;
	deliver_to: string;
	project: string | null;
	terms_and_conditions: string | null;
	subtotal: number;
	total: number;
	status: "draft" | "sent" | "accepted" | "rejected";
	items: QuotationItem[];
	pdf_url?: string | null;
	created_at?: string;
	updated_at?: string;
	created_by?: string;
};

export type QuotationFormValues = {
	supplier_id: string;
	supplier_name: string;
	supplier_reference: string;
	order_deadline: string;
	expected_delivery: string;
	require_confirmation: boolean;
	deliver_to: string;
	project: string;
	terms_and_conditions: string;
};

export type CompanySettings = {
	id: string;
	company_name: string;
	slogan: string;
	address: string;
	city: string;
	state: string;
	zip_code: string;
	phone: string;
	fax: string;
	email: string;
	contact_name: string;
	payment_terms_days: number;
	logo_url?: string | null;
	updated_at: string;
};
