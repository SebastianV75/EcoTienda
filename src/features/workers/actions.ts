"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/session";
import { normalizeWorkerRole } from "@/features/auth/role-rules";
import {
	appendCompensationFailures,
	buildRoleRollbackMetadata,
	getConfirmedInvitedAuthUserId,
	getAuthCleanupPolicy,
	getWorkerLinkIssue,
	getWorkerOperationError,
	hasWorkerVersionConflict,
	mergeWorkerRoleIntoAppMetadata,
	writeWorkerWithLegacyFallback,
	type WorkerWriteValues,
} from "@/features/workers/helpers";
import { buildAuthFlowUrl } from "@/features/auth/invitation-rules";
import { validateWorkerFields } from "@/features/workers/rules";
import { isMissingWorkerEmailColumnError } from "@/features/workers/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/env";

export type WorkerActionState = {
	error: string | null;
};

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

function getString(formData: FormData, key: string) {
	return formData.get(key)?.toString().trim() ?? "";
}

function validateWorkerInput(formData: FormData, requireAccessMode = false) {
	const fullName = getString(formData, "full_name");
	const email = getString(formData, "email");
	const phone = getString(formData, "phone");
	const role = getString(formData, "role");
	const accessMode = getString(formData, "access_mode");
	const active = formData.get("active") !== null;

	if (requireAccessMode && !accessMode) {
		return {
			error: "Selecciona una modalidad de acceso.",
			values: null,
		};
	}

	const validation = validateWorkerFields({
		fullName,
		email,
		phone,
		role,
		accessMode: accessMode || undefined,
	});

	if (validation.error || !validation.values) {
		return { error: validation.error, values: null };
	}

	return {
		error: null,
		values: {
			...validation.values,
			access_mode: accessMode || "profile",
			active,
		},
	};
}

function getAdminClient():
	| { admin: AdminClient; error: null }
	| { admin: null; error: string } {
	try {
		return { admin: createSupabaseAdminClient(), error: null };
	} catch (error) {
		return {
			admin: null,
			error: getWorkerOperationError(
				error,
				"La administración de usuarios no está disponible temporalmente.",
			),
		};
	}
}

async function insertWorker(
	admin: AdminClient,
	values: WorkerWriteValues,
) {
	return writeWorkerWithLegacyFallback<{ id: string }>(values, async (candidate) =>
		await admin.from("workers").insert(candidate).select("id").single(),
	);
}

async function updateWorker(
	admin: AdminClient,
	workerId: string,
	values: WorkerWriteValues,
	expectedUpdatedAt: string,
) {
	return writeWorkerWithLegacyFallback<{ id: string; updated_at: string }>(values, async (candidate) =>
		await admin
			.from("workers")
			.update(candidate)
			.eq("id", workerId)
			.eq("updated_at", expectedUpdatedAt)
			.select("id, updated_at")
			.maybeSingle(),
	);
}

async function authorizeAdmin(): Promise<WorkerActionState | null> {
	try {
		await requireRole(["admin"]);
		return null;
	} catch (error) {
		const configurationError = getWorkerOperationError(error, "");

		if (configurationError) {
			return { error: configurationError };
		}

		throw error;
	}
}

async function deleteWorker(admin: AdminClient, workerId: string) {
	try {
		const { data, error } = await admin
			.from("workers")
			.delete()
			.eq("id", workerId)
			.select("id")
			.maybeSingle();
		return !error && Boolean(data);
	} catch {
		return false;
	}
}

async function deleteAuthUser(admin: AdminClient, authUserId: string) {
	try {
		const { error } = await admin.auth.admin.deleteUser(authUserId);
		return !error;
	} catch {
		return false;
	}
}

async function restoreAuthRole(
	admin: AdminClient,
	authUserId: string,
	expectedRole: unknown,
	previousRole: unknown,
) {
	try {
		const { data, error: lookupError } =
			await admin.auth.admin.getUserById(authUserId);
		if (lookupError || !data.user) {
			return false;
		}
		if (data.user.app_metadata?.role === previousRole) {
			return true;
		}

		const metadata = buildRoleRollbackMetadata(
			data.user.app_metadata,
			expectedRole,
			previousRole,
		);
		if (!metadata) {
			return false;
		}

		const { error } = await admin.auth.admin.updateUserById(authUserId, {
			app_metadata: metadata,
		});
		return !error;
	} catch {
		return false;
	}
}

async function cleanupInvitation(
	admin: AdminClient,
	workerId: string,
	options?: {
		authUserId?: string;
		previousRole?: unknown;
		expectedRole?: unknown;
		metadataMayHaveChanged?: boolean;
	},
) {
	const failures: string[] = [];

	const workerDeleted = await deleteWorker(admin, workerId);
	if (!workerDeleted) {
		failures.push("perfil provisional");
	}

	if (!options?.authUserId) {
		return failures;
	}

	let linkedWorkerCount = 0;
	let linkLookupFailed = false;
	try {
		const { data, error } = await admin
			.from("workers")
			.select("id")
			.eq("auth_user_id", options.authUserId)
			.limit(1);
		linkLookupFailed = Boolean(error);
		linkedWorkerCount = data?.length ?? 0;
	} catch {
		linkLookupFailed = true;
	}

	const policy = getAuthCleanupPolicy({
		workerDeleted,
		linkLookupFailed,
		linkedWorkerCount,
	});

	if (!policy.deleteAuth) {
		if (policy.reason) failures.push(policy.reason);
	} else if (!(await deleteAuthUser(admin, options.authUserId))) {
		failures.push("usuario de acceso");
	} else {
		return failures;
	}

	if (
		options.metadataMayHaveChanged &&
		!(await restoreAuthRole(
			admin,
			options.authUserId,
			options.expectedRole,
			options.previousRole,
		))
	) {
		failures.push("rol previo del usuario de acceso");
	}

	return failures;
}

export async function createWorkerAction(
	_previousState: WorkerActionState,
	formData: FormData,
): Promise<WorkerActionState> {
	const authorizationError = await authorizeAdmin();
	if (authorizationError) {
		return authorizationError;
	}
	const { error, values } = validateWorkerInput(formData, true);

	if (error || !values) {
		return { error };
	}

	const adminResult = getAdminClient();
	if (!adminResult.admin) {
		return { error: adminResult.error };
	}

	const admin = adminResult.admin;
	const { access_mode: accessMode, ...workerValues } = values;
	let inviteRedirectTo: string | null = null;

	if (accessMode === "invite") {
		try {
			inviteRedirectTo = buildAuthFlowUrl(getAppUrl(), "confirm");
		} catch (configurationError) {
			return {
				error: getWorkerOperationError(
					configurationError,
					"Las invitaciones no están configuradas en el servidor.",
				),
			};
		}

		if (!inviteRedirectTo) {
			return { error: "Las invitaciones no están configuradas en el servidor." };
		}
	}

	let insertResult;

	try {
		insertResult = await insertWorker(admin, workerValues);
	} catch (writeError) {
		return {
			error: appendCompensationFailures(
				getWorkerOperationError(
					writeError,
					"No se pudo guardar el trabajador.",
				),
				["escritura del perfil con estado indeterminado"],
			),
		};
	}

	if (insertResult.error || !insertResult.data) {
		return {
			error: getWorkerOperationError(
				insertResult.error,
				"No se pudo guardar el trabajador.",
			),
		};
	}

	if (accessMode === "invite") {
		const workerId = insertResult.data.id;
		let inviteResult;

		try {
			inviteResult = await admin.auth.admin.inviteUserByEmail(
				workerValues.email ?? "",
				{
					data: { full_name: workerValues.full_name },
					redirectTo: inviteRedirectTo ?? undefined,
				},
			);
		} catch (inviteError) {
			const failures = await cleanupInvitation(admin, workerId);
			failures.push("invitación con estado indeterminado");
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						inviteError,
						"No se pudo enviar la invitación por correo.",
					),
					failures,
				),
			};
		}

		const { data: inviteData, error: inviteError } = inviteResult;
		const authUserId = getConfirmedInvitedAuthUserId(
			inviteError,
			inviteData.user?.id,
		);

		if (!authUserId || !inviteData.user) {
			// An error response can refer to a pre-existing user. Never delete Auth
			// unless inviteUserByEmail completed successfully and creation is confirmed.
			const failures = await cleanupInvitation(admin, workerId);
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						inviteError,
						"No se pudo enviar la invitación por correo.",
					),
					failures,
				),
			};
		}

		const previousRole = inviteData.user.app_metadata?.role;
		const appMetadata = mergeWorkerRoleIntoAppMetadata(
			inviteData.user.app_metadata,
			workerValues.role,
		);
		let metadataError;

		try {
			({ error: metadataError } = await admin.auth.admin.updateUserById(
					authUserId,
					{ app_metadata: appMetadata },
				));
		} catch (roleError) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						roleError,
						"No se pudo configurar el rol del usuario invitado.",
					),
					failures,
				),
			};
		}

		if (metadataError) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						metadataError,
						"No se pudo configurar el rol del usuario invitado.",
					),
					failures,
				),
			};
		}

		let linkLookupResult;
		try {
			linkLookupResult = await admin
				.from("workers")
				.select("id")
				.eq("auth_user_id", authUserId)
				.limit(2);
		} catch (linkLookupError) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						linkLookupError,
						"No se pudo verificar que el usuario de acceso esté disponible para vincularse.",
					),
					failures,
				),
			};
		}

		const { data: existingLinks, error: linkLookupError } = linkLookupResult;

		if (linkLookupError || (existingLinks?.length ?? 0) > 0) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						linkLookupError,
						"No se pudo verificar que el usuario de acceso esté disponible para vincularse.",
					),
					failures,
				),
			};
		}

		let linkResult;
		try {
			linkResult = await admin
				.from("workers")
				.update({ auth_user_id: authUserId })
				.eq("id", workerId)
				.is("auth_user_id", null)
				.select("id")
				.maybeSingle();
		} catch (linkError) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						linkError,
						"No se pudo vincular el usuario invitado con el trabajador.",
					),
					failures,
				),
			};
		}

		const { data: linkedWorker, error: linkError } = linkResult;

		if (linkError || !linkedWorker) {
			const failures = await cleanupInvitation(admin, workerId, {
				authUserId,
				previousRole,
				expectedRole: workerValues.role,
				metadataMayHaveChanged: true,
			});
			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						linkError,
						"No se pudo vincular el usuario invitado con el trabajador.",
					),
					failures,
				),
			};
		}
	}

	revalidatePath("/admin/workers");
	redirect("/admin/workers");
}

export async function updateWorkerAction(
	_previousState: WorkerActionState,
	formData: FormData,
): Promise<WorkerActionState> {
	const authorizationError = await authorizeAdmin();
	if (authorizationError) {
		return authorizationError;
	}
	const workerId = getString(formData, "id");
	const expectedUpdatedAt = getString(formData, "updated_at");
	const { error, values } = validateWorkerInput(formData);

	if (!workerId) {
		return { error: "Falta el identificador del trabajador." };
	}
	if (!expectedUpdatedAt) {
		return { error: "Falta la versión del trabajador. Recarga la página." };
	}

	if (error || !values) {
		return { error };
	}

	const adminResult = getAdminClient();
	if (!adminResult.admin) {
		return { error: adminResult.error };
	}

	const admin = adminResult.admin;
	let currentWorkerResult = await admin
		.from("workers")
		.select("full_name, email, phone, role, auth_user_id, active, updated_at")
		.eq("id", workerId)
		.maybeSingle();

	if (isMissingWorkerEmailColumnError(currentWorkerResult.error)) {
		currentWorkerResult = await admin
			.from("workers")
			.select("full_name, phone, role, auth_user_id, active, updated_at")
			.eq("id", workerId)
			.maybeSingle();
	}

	const { data: currentWorker, error: currentError } = currentWorkerResult;

	if (currentError || !currentWorker) {
		return {
			error: getWorkerOperationError(
				currentError,
				"No se encontró el trabajador.",
			),
		};
	}
	if (hasWorkerVersionConflict(expectedUpdatedAt, currentWorker.updated_at)) {
		return {
			error: "Otro cambio actualizó este trabajador. Recarga la página antes de guardar.",
		};
	}

	const nextValues = {
		full_name: values.full_name,
		email: values.email,
		phone: values.phone,
		role: values.role,
		active: values.active,
	};

	const previousValues: WorkerWriteValues = {
		full_name: currentWorker.full_name,
		phone: currentWorker.phone,
		role: currentWorker.role,
		active: currentWorker.active,
		...(Object.hasOwn(currentWorker, "email")
			? { email: currentWorker.email ?? null }
			: {}),
	};

	let previousAuthRole: unknown;
	if (currentWorker.auth_user_id) {
		const { data: linkedRows, error: linkedRowsError } = await admin
			.from("workers")
			.select("id")
			.eq("auth_user_id", currentWorker.auth_user_id)
			.limit(2);

		if (linkedRowsError) {
			return { error: "No se pudo verificar el vínculo del usuario de acceso." };
		}

		const linkIssue = getWorkerLinkIssue(linkedRows, workerId);
		if (linkIssue) {
			return { error: linkIssue };
		}

		const { data: authData, error: authLookupError } =
			await admin.auth.admin.getUserById(currentWorker.auth_user_id);
		const linkedUser = authData?.user;

		if (authLookupError || !linkedUser) {
			return {
				error: getWorkerOperationError(
					authLookupError,
					"No se pudo verificar el usuario de acceso vinculado.",
				),
			};
		}
		previousAuthRole = linkedUser.app_metadata?.role;
	}

	let updateResult;
	try {
		updateResult = await updateWorker(
			admin,
			workerId,
			nextValues,
			currentWorker.updated_at,
		);
	} catch (writeError) {
		return {
			error: appendCompensationFailures(
				getWorkerOperationError(
					writeError,
					"No se pudo actualizar el trabajador.",
				),
				["escritura del perfil con estado indeterminado"],
			),
		};
	}

	if (updateResult.error || !updateResult.data) {
		return {
			error: getWorkerOperationError(
				updateResult.error,
				"Otro cambio actualizó este trabajador. Recarga la página antes de guardar.",
			),
		};
	}

	const writtenUpdatedAt = updateResult.data.updated_at;
	async function rollbackWorker() {
		try {
			const result = await updateWorker(
				admin,
				workerId,
				previousValues,
				writtenUpdatedAt,
			);
			return !result.error && Boolean(result.data);
		} catch {
			return false;
		}
	}

	if (currentWorker.auth_user_id) {
		let metadataError: unknown;
		try {
			const { data: freshAuthData, error: freshLookupError } =
				await admin.auth.admin.getUserById(currentWorker.auth_user_id);
			if (freshLookupError || !freshAuthData.user) {
				metadataError = freshLookupError ?? new Error("Auth user unavailable");
			} else {
				const nextMetadata = mergeWorkerRoleIntoAppMetadata(
					freshAuthData.user.app_metadata,
					values.role,
				);
				({ error: metadataError } = await admin.auth.admin.updateUserById(
					currentWorker.auth_user_id,
					{ app_metadata: nextMetadata },
				));
			}
		} catch (roleError) {
			metadataError = roleError;
		}

		if (metadataError) {
			const failures: string[] = [];
			const workerRolledBack = await rollbackWorker();
			if (!workerRolledBack) {
				failures.push("perfil previo del trabajador");
				failures.push("rol Auth conservado por conflicto concurrente");
			} else if (
				!(await restoreAuthRole(
					admin,
					currentWorker.auth_user_id,
					values.role,
					previousAuthRole,
				))
			) {
				failures.push("rol previo del usuario de acceso");
			}

			return {
				error: appendCompensationFailures(
					getWorkerOperationError(
						metadataError,
						"No se pudo sincronizar el rol del usuario de acceso.",
					),
					failures,
				),
			};
		}

		const [finalWorkerResult, finalAuthResult] = await Promise.all([
			admin.from("workers").select("role").eq("id", workerId).maybeSingle(),
			admin.auth.admin.getUserById(currentWorker.auth_user_id),
		]);
		const synchronized =
			!finalWorkerResult.error &&
			!finalAuthResult.error &&
			normalizeWorkerRole(finalWorkerResult.data?.role) === values.role &&
			finalAuthResult.data.user?.app_metadata?.role === values.role;

		if (!synchronized) {
			const failures: string[] = [];
			const workerRolledBack = await rollbackWorker();
			if (!workerRolledBack) {
				failures.push("perfil previo del trabajador");
				failures.push("rol Auth conservado por conflicto concurrente");
			} else if (
				!(await restoreAuthRole(
					admin,
					currentWorker.auth_user_id,
					values.role,
					previousAuthRole,
				))
			) {
				failures.push("rol previo del usuario de acceso");
			}
			return {
				error: appendCompensationFailures(
					"No se pudo verificar la sincronización final del trabajador y su usuario de acceso.",
					failures,
				),
			};
		}
	}

	revalidatePath("/admin/workers");
	revalidatePath(`/admin/workers/${workerId}/edit`);
	redirect("/admin/workers");
}
