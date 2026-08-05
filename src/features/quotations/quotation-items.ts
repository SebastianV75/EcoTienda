import type { QuotationItem } from "@/types/quotation";

export const INVALID_QUOTATION_ITEMS_ERROR =
	"Las piezas deben ser números enteros mayores que cero y el importe unitario debe ser un número no negativo.";

type RawQuotationItem = Record<string, unknown>;

export type QuotationItemsResult = {
	items: QuotationItem[];
	error: string | null;
};

function isRecord(value: unknown): value is RawQuotationItem {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

export function normalizeQuotationItems(
	rawItems: unknown,
): QuotationItemsResult {
	if (!Array.isArray(rawItems)) {
		return { items: [], error: "Error al procesar los productos." };
	}

	const items: QuotationItem[] = [];

	for (const [index, rawItem] of rawItems.entries()) {
		if (!isRecord(rawItem)) {
			return { items: [], error: "Error al procesar los productos." };
		}

		const type =
			rawItem.type === "section" || rawItem.type === "note"
				? rawItem.type
				: "product";
		const productName =
			typeof rawItem.product_name === "string" ? rawItem.product_name : "";
		const unit = typeof rawItem.unit === "string" ? rawItem.unit : "pz";

		if (type !== "product") {
			items.push({
				type,
				product_name: productName,
				quantity: 1,
				unit,
				unit_price: 0,
				amount: 0,
				sort_order: index,
			});
			continue;
		}

		const quantity = toFiniteNumber(rawItem.quantity);
		const unitPrice = toFiniteNumber(rawItem.unit_price);

		if (
			quantity === null ||
			!Number.isSafeInteger(quantity) ||
			quantity < 1 ||
			unitPrice === null ||
			unitPrice < 0
		) {
			return { items: [], error: INVALID_QUOTATION_ITEMS_ERROR };
		}

		items.push({
			type,
			product_name: productName,
			quantity,
			unit,
			unit_price: unitPrice,
			amount: quantity * unitPrice,
			sort_order: index,
		});
	}

	return { items, error: null };
}

export function parseQuotationItems(itemsJson: string): QuotationItemsResult {
	if (!itemsJson) {
		return { items: [], error: null };
	}

	try {
		return normalizeQuotationItems(JSON.parse(itemsJson));
	} catch {
		return { items: [], error: "Error al procesar los productos." };
	}
}

export function calculateQuotationTotals(
	items: Array<Pick<QuotationItem, "amount">>,
	fallbackSubtotal = 0,
): { subtotal: number; total: number } {
	const subtotal =
		items.length > 0
			? items.reduce((sum, item) => sum + item.amount, 0)
			: fallbackSubtotal;
	return { subtotal, total: subtotal };
}

export function toQuotationItemRows(
	quotationId: string,
	items: QuotationItem[],
) {
	return items.map((item, index) => ({
		quotation_id: quotationId,
		type: item.type || "product",
		product_name: item.product_name,
		quantity: item.quantity,
		unit: item.unit,
		unit_price: item.unit_price,
		// Compatibilidad con bases existentes donde esta columna sigue siendo NOT NULL.
		tax_rate: 0,
		amount: item.amount,
		sort_order: index,
	}));
}
