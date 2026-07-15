export type ClientRecord = {
	id: string;
	full_name: string;
	phone: string;
	address: string;
	neighborhood: string;
	rfc: string;
	rpu: string;
	latitude: number;
	longitude: number;
	panel_count: string | null;
	panel_power: string | null;
	inverter: string | null;
	installed_capacity: string | null;
	estimated_monthly_generation: string | null;
	created_at: string;
	updated_at: string;
};

export type ClientFormValues = {
	full_name: string;
	phone: string;
	address: string;
	neighborhood: string;
	rfc: string;
	rpu: string;
	latitude: string;
	longitude: string;
};
