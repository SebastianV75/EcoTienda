import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/types/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAppRole, normalizeWorkerRole } from "@/features/auth/role-rules";

export type AuthUser = {
	id: string;
	email: string | null;
	role: AppRole | null;
};

export type AuthorizedUser = AuthUser & { role: AppRole };

export function getUserRole(
	user: Pick<User, "app_metadata" | "user_metadata"> | null,
): AppRole | null {
	const appRole = user?.app_metadata?.role;
	return isAppRole(appRole) ? appRole : null;
}

async function getWorkerLinkedRole(userId: string) {
	const supabase = createSupabaseAdminClient();
	const { data, error } = await supabase
		.from("workers")
		.select("role, active")
		.eq("auth_user_id", userId)
		.maybeSingle();

	return {
		exists: Boolean(data),
		active: data?.active === true,
		role: normalizeWorkerRole(data?.role),
		error: Boolean(error),
	};
}

export async function resolveUserRole(
	user: Pick<User, "id" | "app_metadata" | "user_metadata"> | null,
): Promise<AppRole | null> {
	if (!user) {
		return null;
	}

	const metadataRole = getUserRole(user);
	const worker = await getWorkerLinkedRole(user.id);

	if (worker.error || (worker.exists && !worker.active)) {
		return null;
	}

	if (!worker.exists) {
		return null;
	}

	return worker.role && worker.role === metadataRole ? worker.role : null;
}

export function getDefaultRouteForRole(role: AppRole | null) {
	if (role === "admin") {
		return "/admin";
	}

	if (role === "administrative") {
		return "/agenda";
	}

	return role === "technician" ? "/technician" : "/unauthorized";
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
	if (!hasSupabaseEnv()) {
		return null;
	}

	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const role = await resolveUserRole(user);

	return {
		id: user.id,
		email: user.email ?? null,
		role,
	};
});

export async function requireUser(): Promise<AuthorizedUser> {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/sign-in");
	}

	if (!user.role) {
		redirect("/unauthorized");
	}

	return user as AuthorizedUser;
}

export async function requireRole(
	allowedRoles: AppRole[],
): Promise<AuthorizedUser> {
	const user = await requireUser();

	if (!allowedRoles.includes(user.role)) {
		redirect("/unauthorized");
	}

	return user;
}
