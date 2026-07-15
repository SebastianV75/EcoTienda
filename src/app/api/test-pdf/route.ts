import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import React from "react";
import { TestDocument } from "./test-document";

export async function GET() {
	try {
		console.log("[Test PDF] Generando PDF de prueba...");

		const doc = React.createElement(TestDocument);
		const buffer = await renderToBuffer(doc);

		console.log(
			"[Test PDF] PDF generado exitosamente, tamaño:",
			buffer.length,
			"bytes",
		);

		return new NextResponse(Buffer.from(buffer), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename=test.pdf",
			},
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Error desconocido";
		const errorStack =
			error instanceof Error ? error.stack : "No stack available";

		console.error("[Test PDF] Error generando PDF:", errorMessage);
		console.error("[Test PDF] Stack trace:", errorStack);
		console.error("[Test PDF] Error completo:", error);

		return NextResponse.json(
			{
				error: errorMessage,
				stack: errorStack,
				fullError: String(error),
			},
			{ status: 500 },
		);
	}
}
