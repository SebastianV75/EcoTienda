import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { PDFDocument } from "pdf-lib";

const source = readFileSync(new URL("../src/app/api/trabajos/[id]/cfe/route.ts", import.meta.url),"utf8")
	.replace('import { NextResponse } from "next/server";', 'class NextResponse extends Response { static json(data, init) { return new Response(JSON.stringify(data), {...init, headers:{"Content-Type":"application/json"}}); } }')
	.replace('import { requireRole } from "@/features/auth/session";', 'const requireRole = async roles => globalThis.__cfeRouteTest.roles=roles;')
	.replace('import { getTrabajoDocumentById } from "@/features/trabajos/data";', 'const getTrabajoDocumentById = async () => globalThis.__cfeRouteTest.trabajo;')
	.replace('import { getCompanySettings } from "@/features/settings/data";', 'const getCompanySettings = async () => ({settings:null});')
	.replaceAll('"@/features/documents/cfe-pdf"',JSON.stringify(new URL("../src/features/documents/cfe-pdf.ts",import.meta.url).href))
	.replaceAll('"@/features/documents/descargables-readiness"',JSON.stringify(new URL("../src/features/documents/descargables-readiness.ts",import.meta.url).href));
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { GET } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

function fixture(complete=true) {
	const trabajo = {
		intake_name:"Muestra ficticia",intake_phone:"6140000000",intake_address_text:"Ejemplo 123",intake_latitude:31.69,intake_longitude:-106.42,
		agenda:null,visita:null,cotizacion:null,venta:{confirmed_on:"2026-10-08"},document_overrides:[],
	};
	const fields = {application_date:"2026-10-08",email:"prueba@example.com",postal_code:"32000",municipality:"Juárez",state:"Chihuahua",...(complete?{operation_date:"2026-11-15"}:{})};
	trabajo.document_overrides=Object.entries(fields).map(([field_key,field_value])=>({template_key:"cfe",export_instance_key:"preview",field_key,field_value}));
	globalThis.__cfeRouteTest={trabajo,roles:null};
	return trabajo;
}

test("CFE GET bloquea PDF incompleto con mensaje accionable",async () => {
	fixture(false);
	const response = await GET(new Request("https://example.test/cfe"),{params:Promise.resolve({id:"test"})});
	assert.equal(response.status,422);
	assert.match((await response.json()).error,/operación normal.*Información para descargables/);
	assert.deepEqual(globalThis.__cfeRouteTest.roles,["admin","administrative"]);
});

test("CFE GET exporta PDF válido cuando los datos están completos",async () => {
	fixture();
	const response = await GET(new Request("https://example.test/cfe"),{params:Promise.resolve({id:"test"})});
	assert.equal(response.status,200);
	assert.equal(response.headers.get("Content-Type"),"application/pdf");
	assert.match(response.headers.get("Cache-Control"),/no-store/);
	const pdf=await PDFDocument.load(await response.arrayBuffer());
	assert.equal(pdf.getPageCount(),1);
});

test("CFE GET sigue exigiendo una venta confirmada",async () => {
	fixture().venta=null;
	const response=await GET(new Request("https://example.test/cfe"),{params:Promise.resolve({id:"test"})});
	assert.equal(response.status,404);
});
