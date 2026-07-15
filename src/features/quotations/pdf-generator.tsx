import { renderToBuffer } from "@react-pdf/renderer";

import { QuotationPDF } from "./pdf/quotation-pdf";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
	Quotation,
	QuotationItem,
	CompanySettings,
} from "@/types/quotation";

async function getCompanySettings(): Promise<CompanySettings> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("company_settings")
		.select("*")
		.single();

	if (error || !data) {
		return {
			id: "",
			company_name: "EcoTienda",
			slogan: "Soluciones sustentables para tu hogar",
			address: "Av. Principal 123",
			city: "Guadalajara",
			state: "Jalisco",
			zip_code: "44100",
			phone: "(33) 1234-5678",
			fax: "",
			email: "contacto@ecotienda.com",
			contact_name: "Administrador EcoTienda",
			payment_terms_days: 30,
			updated_at: new Date().toISOString(),
		};
	}

	return data as CompanySettings;
}

async function getQuotationData(quotationId: string): Promise<{
	quotation: Quotation;
	items: QuotationItem[];
}> {
	const supabase = await createSupabaseServerClient();

	const { data: quotation, error: quotationError } = await supabase
		.from("quotations")
		.select("*")
		.eq("id", quotationId)
		.single();

	if (quotationError || !quotation) {
		throw new Error("No se pudo cargar la cotización.");
	}

	const { data: items, error: itemsError } = await supabase
		.from("quotation_items")
		.select("*")
		.eq("quotation_id", quotationId)
		.order("sort_order", { ascending: true });

	if (itemsError) {
		throw new Error("No se pudieron cargar los productos.");
	}

	return {
		quotation: quotation as Quotation,
		items: (items ?? []) as QuotationItem[],
	};
}

export async function generateQuotationPDF(
	quotationId: string,
): Promise<Buffer> {
	console.log('[PDF Generator] === Iniciando generación de PDF ===');
	console.log('[PDF Generator] Quotation ID:', quotationId);
	
	console.log('[PDF Generator] Paso 1: Obteniendo datos de cotización...');
	const { quotation, items } = await getQuotationData(quotationId);
	console.log('[PDF Generator] Datos obtenidos:', {
		quotationNumber: quotation.quotation_number,
		itemsCount: items.length
	});
	
	console.log('[PDF Generator] Paso 2: Obteniendo configuración de compañía...');
	const company = await getCompanySettings();
	console.log('[PDF Generator] Compañía:', company.company_name);
	
	console.log('[PDF Generator] Paso 3: Creando documento PDF...');
	const document = (
		<QuotationPDF
			quotation={quotation}
			items={items}
			company={company}
		/>
	);
	
	console.log('[PDF Generator] Paso 4: Renderizando PDF a buffer...');
	const buffer = await renderToBuffer(document);
	console.log('[PDF Generator] PDF generado exitosamente, tamaño:', buffer.length, 'bytes');
	
	return buffer;
}

export async function uploadPDFToStorage(
	buffer: Buffer,
	filename: string,
): Promise<string> {
	console.log('[PDF Generator] Paso 5: Subiendo PDF a Storage...');
	console.log('[PDF Generator] Filename:', filename);
	console.log('[PDF Generator] Buffer size:', buffer.length, 'bytes');
	
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase.storage
		.from("quotations")
		.upload(filename, buffer, {
			contentType: "application/pdf",
			upsert: true,
		});

	if (error) {
		console.error('[PDF Generator] Error en upload:', error.message);
		console.error('[PDF Generator] Error details:', error);
		throw new Error(`No se pudo subir el PDF: ${error.message}`);
	}

	console.log('[PDF Generator] PDF subido exitosamente, path:', data.path);

	const { data: urlData } = supabase.storage
		.from("quotations")
		.getPublicUrl(data.path);

	console.log('[PDF Generator] URL pública:', urlData.publicUrl);

	return urlData.publicUrl;
}

export async function generateAndSavePDF(quotationId: string): Promise<string> {
	console.log('[PDF Generator] === generateAndSavePDF ===');
	console.log('[PDF Generator] Quotation ID:', quotationId);
	
	const supabase = await createSupabaseServerClient();

	console.log('[PDF Generator] Obteniendo quotation_number...');
	const { data: quotation, error } = await supabase
		.from("quotations")
		.select("quotation_number")
		.eq("id", quotationId)
		.single();

	if (error) {
		console.error('[PDF Generator] Error obteniendo quotation:', error.message);
		throw new Error(`No se pudo obtener la cotización: ${error.message}`);
	}

	if (!quotation?.quotation_number) {
		console.error('[PDF Generator] quotation_number es null o undefined');
		throw new Error('quotation_number no encontrado');
	}

	console.log('[PDF Generator] Quotation number:', quotation.quotation_number);

	const filename = `${quotation.quotation_number}.pdf`;
	console.log('[PDF Generator] Generando PDF...');
	
	const buffer = await generateQuotationPDF(quotationId);
	
	console.log('[PDF Generator] Subiendo a Storage...');
	const pdfUrl = await uploadPDFToStorage(buffer, filename);

	console.log('[PDF Generator] Actualizando pdf_url en base de datos...');
	const { error: updateError } = await supabase
		.from("quotations")
		.update({ pdf_url: pdfUrl })
		.eq("id", quotationId);

	if (updateError) {
		console.error('[PDF Generator] Error actualizando pdf_url:', updateError.message);
		throw new Error(`No se pudo actualizar pdf_url: ${updateError.message}`);
	}

	console.log('[PDF Generator] === Proceso completado exitosamente ===');
	console.log('[PDF Generator] PDF URL:', pdfUrl);

	return pdfUrl;
}