"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function RecoveryCallback() {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function completeRecovery() {
			const hash = new URLSearchParams(window.location.hash.slice(1));
			const query = new URLSearchParams(window.location.search);
			const type = hash.get("type") ?? query.get("type");
			const accessToken = hash.get("access_token");
			const refreshToken = hash.get("refresh_token");
			const code = query.get("code");

			if (type !== "recovery" || (!code && (!accessToken || !refreshToken))) {
				setError("El enlace para restablecer la contraseña es inválido o está incompleto.");
				return;
			}

			const supabase = createSupabaseBrowserClient();
			const result = code
				? await supabase.auth.exchangeCodeForSession(code)
				: accessToken && refreshToken
					? await supabase.auth.setSession({
							access_token: accessToken,
							refresh_token: refreshToken,
						})
					: { error: new Error("Missing recovery tokens") };

			if (result.error) {
				if (!cancelled) {
					setError("El enlace venció o ya fue utilizado. Solicita otro correo.");
				}
				return;
			}

			window.history.replaceState(null, "", window.location.pathname);
			window.location.replace("/auth/reset-password");
		}

		void completeRecovery().catch(() => {
			if (!cancelled) {
				setError("No se pudo validar el enlace. Solicita otro correo para continuar.");
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="rounded-[28px] border border-[var(--border-soft)] bg-white/95 p-6 shadow-[0_16px_50px_rgba(13,79,46,0.06)]">
			{error ? (
				<p className="text-sm leading-7 text-rose-800">{error}</p>
			) : (
				<p className="text-sm leading-7 text-[var(--muted)]">
					Verificando el enlace para restablecer tu contraseña…
				</p>
			)}
		</div>
	);
}
