import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/types/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthUser = {
	id: string;
	email: string | null;
	role: AppRole;
};

const DEFAULT_ROLE: AppRole = "technician";

export function getUserRole(
	user: Pick<User, "app_metadata" | "user_metadata"> | null,
): AppRole {
	const appRole = user?.app_metadata?.role;
	const userRole = user?.user_metadata?.role;

	if (appRole === "admin" || appRole === "technician") {
		return appRole;
	}

	if (userRole === "admin" || userRole === "technician") {
		return userRole;
	}

	return DEFAULT_ROLE;
}

async function getWorkerLinkedRole(userId: string): Promise<AppRole | null> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase
		.from("workers")
		.select("role, active")
		.eq("auth_user_id", userId)
		.eq("active", true)
		.maybeSingle();

	if (error || !data) {
		return null;
	}

	if (data.role === "admin" || data.role === "technician") {
		return data.role;
	}

	return null;
}

export async function resolveUserRole(
	user: Pick<User, "id" | "app_metadata" | "user_metadata"> | null,
): Promise<AppRole> {
	if (!user) {
		return DEFAULT_ROLE;
	}

	const metadataRole = getUserRole(user);
	if (metadataRole === "admin") {
		return metadataRole;
	}

	const workerRole = await getWorkerLinkedRole(user.id);
	return workerRole ?? metadataRole;
}

export function getDefaultRouteForRole(role: AppRole) {
	return role === "admin" ? "/admin" : "/technician";
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

	return {
		id: user.id,
		email: user.email ?? null,
		role: await resolveUserRole(user),
	};
});

export async function requireUser() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/sign-in");
	}

	return user;
}

export async function requireRole(allowedRoles: AppRole[]) {
	const user = await requireUser();

	if (!allowedRoles.includes(user.role)) {
		redirect("/unauthorized");
	}

	return user;
}
