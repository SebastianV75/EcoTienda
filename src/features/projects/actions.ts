"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
	postSaleSteps,
	projectStages,
	type PostSaleStep,
	type ProjectStage,
} from "@/types/project";

export type ProjectActionState = {
	error: string | null;
};

function isProjectStage(value: string): value is ProjectStage {
	return projectStages.includes(value as ProjectStage);
}

export async function createProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.from("projects").insert({
		stage: "agenda",
	});

	if (error) {
		return { error: "No se pudo crear el trabajo." };
	}

	revalidatePath("/admin");
	return { error: null };
}

export async function updateProjectStageAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const projectId = formData.get("project_id")?.toString().trim() ?? "";
	const stage = formData.get("stage")?.toString().trim() ?? "";

	if (!projectId) {
		return { error: "Falta el identificador del trabajo." };
	}

	if (!isProjectStage(stage)) {
		return { error: "La etapa seleccionada no es válida." };
	}

	const nowIso = new Date().toISOString();
	const updates: Record<string, string | null> = {
		stage,
		stage_entered_at: nowIso,
	};

	if (stage === "venta") {
		updates.sold_at = nowIso;
	}

	if (stage === "post_venta") {
		updates.post_sale_step = "sistema_220v";
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase
		.from("projects")
		.update(updates)
		.eq("id", projectId);

	if (error) {
		return { error: "No se pudo actualizar la etapa del trabajo." };
	}

	revalidatePath("/admin");
	return { error: null };
}

export async function advancePostSaleStepAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const projectId = formData.get("project_id")?.toString().trim() ?? "";

	if (!projectId) {
		return { error: "Falta el identificador del trabajo." };
	}

	const supabase = await createSupabaseServerClient();
	const { data: project, error: loadError } = await supabase
		.from("projects")
		.select("id, stage, post_sale_step")
		.eq("id", projectId)
		.maybeSingle();

	if (loadError || !project) {
		return { error: "No se pudo cargar el trabajo." };
	}

	if (project.stage !== "post_venta") {
		return { error: "El trabajo todavía no está en post-venta." };
	}

	const currentStep = (project.post_sale_step ?? "sistema_220v") as PostSaleStep;
	const currentIndex = postSaleSteps.indexOf(currentStep);
	const nextStep = postSaleSteps[currentIndex + 1];

	if (!nextStep) {
		return { error: "El trabajo ya completó todos los pasos post-venta." };
	}

	const updates: Record<string, string | null> = {
		post_sale_step: nextStep,
	};

	if (nextStep === "activacion") {
		updates.activated_at = new Date().toISOString();
	}

	const { error } = await supabase
		.from("projects")
		.update(updates)
		.eq("id", projectId);

	if (error) {
		return { error: "No se pudo avanzar el paso post-venta." };
	}

	revalidatePath("/admin");
	return { error: null };
}

export async function restoreProjectAction(
	_previousState: ProjectActionState,
	formData: FormData,
): Promise<ProjectActionState> {
	if (hasSupabaseEnv()) {
		await requireRole(["admin"]);
	}

	const projectId = formData.get("project_id")?.toString().trim() ?? "";

	if (!projectId) {
		return { error: "Falta el identificador del trabajo." };
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase
		.from("projects")
		.update({ activated_at: null })
		.eq("id", projectId);

	if (error) {
		return { error: "No se pudo restaurar el trabajo." };
	}

	revalidatePath("/admin");
	revalidatePath("/admin/projects/archived");
	return { error: null };
}
