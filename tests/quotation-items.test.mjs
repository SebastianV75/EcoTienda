import assert from "node:assert/strict";
import test from "node:test";

import {
	calculateQuotationTotals,
	normalizeQuotationItems,
	parseQuotationItems,
	toQuotationItemRows,
} from "../src/features/quotations/quotation-items.ts";

test("normaliza piezas enteras y calcula total sin impuestos", () => {
	const result = normalizeQuotationItems([
		{
			type: "product",
			product_name: "Panel solar",
			quantity: "2",
			unit: "pz",
			unit_price: "1500",
			amount: 9999,
			tax_rate: 16,
		},
	]);

	assert.equal(result.error, null);
	assert.deepEqual(result.items[0], {
		type: "product",
		product_name: "Panel solar",
		quantity: 2,
		unit: "pz",
		unit_price: 1500,
		amount: 3000,
		sort_order: 0,
	});
	assert.deepEqual(calculateQuotationTotals(result.items), {
		subtotal: 3000,
		total: 3000,
	});

	assert.deepEqual(toQuotationItemRows("quotation-1", result.items), [
		{
			quotation_id: "quotation-1",
			type: "product",
			product_name: "Panel solar",
			quantity: 2,
			unit: "pz",
			unit_price: 1500,
			tax_rate: 0,
			amount: 3000,
			sort_order: 0,
		},
	]);
});

test("los totales de lectura ignoran impuestos legacy y piezas históricas fraccionarias", () => {
	assert.deepEqual(
		calculateQuotationTotals([{ amount: 100, quantity: 1.5, tax_rate: 16 }]),
		{ subtotal: 100, total: 100 },
	);
});

test("rechaza piezas decimales o no positivas", () => {
	for (const quantity of [1.5, 0, -1, "1.5"]) {
		const result = normalizeQuotationItems([
			{
				product_name: "Producto",
				quantity,
				unit: "pz",
				unit_price: 100,
			},
		]);

		assert.match(result.error ?? "", /piezas.*enteros/i);
		assert.deepEqual(result.items, []);
	}
});

test("parsea una lista vacía y rechaza JSON inválido", () => {
	assert.deepEqual(parseQuotationItems(""), { items: [], error: null });
	assert.equal(parseQuotationItems("no es json").items.length, 0);
	assert.match(
		parseQuotationItems("no es json").error ?? "",
		/procesar los productos/i,
	);
});
