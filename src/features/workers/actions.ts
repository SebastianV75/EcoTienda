"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkerRole } from "@/types/worker";

export type WorkerActionState = {
	error: string | null;
};

const workerRoles: WorkerRole[] = ["admin", "technician", "staff"];

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function isWorkerRole(value: string): value is WorkerRole {
	return workerRoles.includes(value as WorkerRole);
}

function validateWorkerInput(formData: FormData) {
	const fullName = getString(formData, "full_name");
	const phone = getString(formData, "phone");
	const role = getString(formData, "role");
	const authUserId = getString(formData, "auth_user_id");
	const active = formData.get("active") !== null;

	if (!fullName || !isWorkerRole(role)) {
		return {
			error: "Completa nombre y rol del trabajador.",
			values: null,
		};
	}

	return {
		error: null,
		values: {
			full_name: fullName,
			phone: phone || null,
			role,
			auth_user_id: authUserId || null,
			active,
		},
	};
}

export async function createWorkerAction(
	_previousState: WorkerActionState,
	formData: FormData,
): Promise<WorkerActionState> {
	const { error, values } = validateWorkerInput(formData);

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const { data, error: insertError } = await supabase
		.from("workers")
		.insert(values)
		.select("id")
		.single();

	if (insertError || !data) {
		return { error: "No se pudo guardar el trabajador." };
	}

	revalidatePath("/admin/workers");
	redirect("/admin/workers");
}

export async function updateWorkerAction(
	_previousState: WorkerActionState,
	formData: FormData,
): Promise<WorkerActionState> {
	const workerId = getString(formData, "id");
	const { error, values } = validateWorkerInput(formData);

	if (!workerId) {
		return { error: "Falta el identificador del trabajador." };
	}

	if (error || !values) {
		return { error };
	}

	const supabase = await createSupabaseServerClient();
	const { error: updateError } = await supabase
		.from("workers")
		.update(values)
		.eq("id", workerId);

	if (updateError) {
		return { error: "No se pudo actualizar el trabajador." };
	}

	revalidatePath("/admin/workers");
	revalidatePath(`/admin/workers/${workerId}/edit`);
	redirect("/admin/workers");
}
