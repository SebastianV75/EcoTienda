"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TrabajoDetailRealtimeListenerProps = {
	trabajoId: string;
};

export function TrabajoDetailRealtimeListener({
	trabajoId,
}: TrabajoDetailRealtimeListenerProps) {
	const router = useRouter();

	useEffect(() => {
		const supabase = createSupabaseBrowserClient();

		const channel = supabase
			.channel(`trabajo-detail-${trabajoId}`)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "trabajos",
					filter: `id=eq.${trabajoId}`,
				},
				() => {
					// Este trabajo fue eliminado por otro usuario; volver a la lista
					router.replace("/admin/trabajos");
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "trabajos",
					filter: `id=eq.${trabajoId}`,
				},
				() => {
					// Refrescar el detalle si el trabajo cambió
					router.refresh();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [router, trabajoId]);

	return null;
}
