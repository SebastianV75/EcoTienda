"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/session";
import { buildAuthFlowUrl } from "@/features/auth/invitation-rules";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";

export type AccountSettingsActionState = {
	error: string | null;
	success: boolean;
	emailConfirmationPending: boolean;
};

export type PasswordResetRequestState = {
	error: string | null;
	success: boolean;
};

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function validateAccountSettings(formData: FormData) {
	const username = getString(formData, "username");
	const fullName = getString(formData, "full_name");
	const email = getString(formData, "email").toLowerCase();
	const phone = getString(formData, "phone");
	const personalData = getString(formData, "personal_data");

	if (!username) {
		return { error: "El nombre de usuario es obligatorio.", values: null };
	}

	if (username.length > 80) {
		return { error: "El nombre de usuario no puede exceder 80 caracteres.", values: null };
	}

	if (!fullName) {
		return { error: "El nombre completo es obligatorio.", values: null };
	}

	if (fullName.length > 160) {
		return { error: "El nombre completo no puede exceder 160 caracteres.", values: null };
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { error: "Escribe un correo electrónico válido.", values: null };
	}

	if (phone.length > 40) {
		return { error: "El teléfono no puede exceder 40 caracteres.", values: null };
	}

	if (personalData.length > 1000) {
		return {
			error: "Los datos personales adicionales no pueden exceder 1000 caracteres.",
			values: null,
		};
	}

	return {
		error: null,
		values: { username, full_name: fullName, email, phone, personal_data: personalData },
	};
}

export async function updateAccountSettingsAction(
	_previousState: AccountSettingsActionState,
	formData: FormData,
): Promise<AccountSettingsActionState> {
	const currentUser = await requireUser();
	const { error, values } = validateAccountSettings(formData);

	if (error || !values) {
		return { error, success: false, emailConfirmationPending: false };
	}

	const supabase = await createSupabaseServerClient();
	const { data: authData, error: authLookupError } = await supabase.auth.getUser();
	const authUser = authData.user;

	if (authLookupError || !authUser || authUser.id !== currentUser.id) {
		return {
			error: "No se pudo verificar la sesión actual.",
			success: false,
			emailConfirmationPending: false,
		};
	}

	const admin = createSupabaseAdminClient();
	const { data: linkedWorkers, error: workerLookupError } = await admin
		.from("workers")
		.select("id, full_name, phone")
		.eq("auth_user_id", authUser.id)
		.limit(2);

	if (workerLookupError || (linkedWorkers?.length ?? 0) > 1) {
		return {
			error: "No se pudo localizar de forma segura el perfil vinculado.",
			success: false,
			emailConfirmationPending: false,
		};
	}

	const linkedWorker = linkedWorkers?.[0] ?? null;
	if (linkedWorker) {
		const { error: workerUpdateError } = await admin
			.from("workers")
			.update({ full_name: values.full_name, phone: values.phone || null })
			.eq("id", linkedWorker.id);

		if (workerUpdateError) {
			return {
				error: "No se pudo actualizar el perfil operativo.",
				success: false,
				emailConfirmationPending: false,
			};
		}
	}

	const nextMetadata = {
		...(authUser.user_metadata ?? {}),
		username: values.username,
		full_name: values.full_name,
		phone: values.phone,
		personal_data: values.personal_data,
	};
	const emailChanged = values.email !== (authUser.email ?? "").toLowerCase();
	const updatePayload: { data: Record<string, unknown>; email?: string } = {
		data: nextMetadata,
	};

	if (emailChanged) {
		updatePayload.email = values.email;
	}

	const { error: updateError } = await supabase.auth.updateUser(updatePayload);

	if (updateError) {
		if (linkedWorker) {
			await admin
				.from("workers")
				.update({
					full_name: linkedWorker.full_name,
					phone: linkedWorker.phone,
				})
				.eq("id", linkedWorker.id);
		}

		return {
			error: "No se pudieron guardar los datos de la cuenta.",
			success: false,
			emailConfirmationPending: false,
		};
	}

	revalidatePath("/admin/settings");
	revalidatePath("/admin/workers");

	return {
		error: null,
		success: true,
		emailConfirmationPending: emailChanged,
	};
}

export async function requestPasswordResetAction(
	_previousState: PasswordResetRequestState,
	_formData: FormData,
): Promise<PasswordResetRequestState> {
	void _previousState;
	void _formData;
	const currentUser = await requireUser();

	if (!currentUser.email) {
		return {
			error: "Tu cuenta no tiene un correo electrónico válido para enviar el enlace.",
			success: false,
		};
	}

	let redirectTo: string | null = null;
	try {
		redirectTo = buildAuthFlowUrl(getAppUrl(), "reset-password");
	} catch {
		return {
			error: "La recuperación de contraseña no está configurada en el servidor.",
			success: false,
		};
	}

	if (!redirectTo) {
		return {
			error: "La recuperación de contraseña no está configurada en el servidor.",
			success: false,
		};
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
		redirectTo,
	});

	if (error) {
		return {
			error: "No se pudo enviar el correo para restablecer la contraseña.",
			success: false,
		};
	}

	return { error: null, success: true };
}
