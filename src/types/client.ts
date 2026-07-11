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
