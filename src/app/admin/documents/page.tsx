import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";

export default async function DocumentsPage() {
	await requireRole(["admin", "administrative"]);
	redirect("/admin/descargables");
}
