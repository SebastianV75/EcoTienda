"use client";

import { useRouter } from "next/navigation";

export function UnauthorizedBackButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => {
				if (window.history.length > 1) {
					router.back();
					return;
				}

				router.push("/");
			}}
			className="inline-flex min-h-12 items-center justify-center gap-3 bg-[var(--brand-deep)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(13,79,46,0.2)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_22px_40px_rgba(13,79,46,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
		>
			Volver a la página anterior
		</button>
	);
}
