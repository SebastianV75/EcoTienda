import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/trabajos/document-info-actions.ts", import.meta.url), "utf8")
	.replace('import { revalidatePath } from "next/cache";', 'const revalidatePath = () => {};')
	.replace('import { requireRole } from "@/features/auth/session";', 'const requireRole = async roles => globalThis.__documentInfoTest.roles = roles;')
	.replace('import { createSupabaseServerClient } from "@/lib/supabase/server";', 'const createSupabaseServerClient = async () => globalThis.__documentInfoTest.client;')
	.replace('"@/features/documents/cfe-fields"', JSON.stringify(new URL("../src/features/documents/cfe-fields.ts", import.meta.url).href));
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { saveTrabajoDocumentInfoAction } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

function fixture(stage = "venta", changes = {}) {
	const context = { rows: null, roles: null, queries: 0 };
	context.client = {
		from(table) {
			context.queries++;
			if (table === "trabajos") return {select: () => ({eq: () => ({maybeSingle: async () => ({data: {current_stage: stage}, error: null})})})};
			assert.equal(table,"trabajo_document_overrides");
			return {upsert: async (rows, options) => {
				context.rows = rows;
				assert.equal(options.onConflict,"trabajo_id,template_key,export_instance_key,field_key");
				return {error:null};
			}};
		},
	};
	globalThis.__documentInfoTest = context;
	const form = new FormData();
	for (const [key,value] of Object.entries({trabajo_id:"trabajo-test",full_name:"Persona prueba",phone:"6140000000",address:"Ejemplo 12",neighborhood:"Centro",rfc:"PRUEBA",rpu:"123456789012",latitude:"31.69",longitude:"-106.42",panel_count:"8",panel_power:"550 W",inverter:"5 kW",installed_capacity:"4.4",estimated_monthly_generation:"650",email:"prueba@example.com",postal_code:"32000",municipality:"Juárez",state:"Chihuahua",application_date:"2026-10-08",operation_date:"2026-11-15",...changes})) form.set(key,value);
	return {context,form};
}

test("document info persiste las fechas y ubicación CFE en Venta y Descargables", async () => {
	for (const stage of ["venta","descargables"]) {
		const {context,form} = fixture(stage);
		const result = await saveTrabajoDocumentInfoAction({},form);
		assert.equal(result.error,null);
		assert.deepEqual(context.roles,["admin","administrative"]);
		const cfe = Object.fromEntries(context.rows.filter(row => row.template_key==="cfe").map(row => [row.field_key,row.field_value]));
		assert.equal(cfe.application_date,"2026-10-08");
		assert.equal(cfe.operation_date,"2026-11-15");
		assert.equal(cfe.latitude,31.69);
		assert.equal(cfe.longitude,-106.42);
	}
});

test("document info permite guardar legacy sin inventar operación", async () => {
	const {context,form} = fixture("descargables",{operation_date:""});
	assert.equal((await saveTrabajoDocumentInfoAction({},form)).error,null);
	assert.equal(context.rows.find(row => row.field_key==="operation_date").field_value,"");
});

test("document info rechaza fecha imposible y coordenadas vacías o fuera de rango antes de escribir", async () => {
	for (const changes of [{application_date:"2026-02-30"},{operation_date:"2026-04-31"},{latitude:""},{longitude:""},{latitude:"90"},{longitude:"181"}]) {
		const {context,form} = fixture("venta",changes);
		assert.ok((await saveTrabajoDocumentInfoAction({},form)).error);
		assert.equal(context.queries,0);
		assert.equal(context.rows,null);
	}
});

test("document info conserva la restricción de etapa", async () => {
	const {context,form} = fixture("cotizacion");
	assert.match((await saveTrabajoDocumentInfoAction({},form)).error,/Venta o Descargables/);
	assert.equal(context.rows,null);
});
