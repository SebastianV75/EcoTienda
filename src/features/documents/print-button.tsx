"use client";

export function PrintButton() {
	return (
		<button
			type="button"
			onClick={() => window.print()}
			className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
		>
			Guardar como PDF
		</button>
	);
}
