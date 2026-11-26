import "server-only";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/ssr-server";
import { getTrustedServerClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Validates whether the current request comes from an authenticated administrator.
 * Checks both auth.users session and admin authorization in admin_profiles or ADMIN_EMAILS.
 */
export async function validateAdminSession(): Promise<
  | { authenticated: true; user: AdminUser }
  | { authenticated: false; user: null }
> {
  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return { authenticated: false, user: null };
    }

    // Check admin authorization
    // 1. Check ADMIN_EMAILS environment variable list
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_NOTIFICATION_EMAIL || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.includes(user.email.toLowerCase())) {
      return {
        authenticated: true,
        user: { id: user.id, email: user.email, role: "admin" },
      };
    }

    // 2. Check public.admin_profiles table via trusted server client
    const trustedClient = getTrustedServerClient();
    const { data: profile } = await trustedClient
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
      return {
        authenticated: true,
        user: { id: user.id, email: user.email, role: profile.role },
      };
    }

    // Fallback: If no admin_profiles or ADMIN_EMAILS configured yet, bootstrap the first authenticated user
    const { count } = await trustedClient
      .from("admin_profiles")
      .select("id", { count: "exact", head: true });

    if (count === 0 && (!process.env.ADMIN_EMAILS || process.env.ADMIN_EMAILS.length === 0)) {
      // Auto-provision bootstrap admin profile
      await trustedClient.from("admin_profiles").insert({
        id: user.id,
        email: user.email,
        role: "admin",
      });
      return {
        authenticated: true,
        user: { id: user.id, email: user.email, role: "admin" },
      };
    }

    return { authenticated: false, user: null };
  } catch {
    return { authenticated: false, user: null };
  }
}

/**
 * Enforces admin session on Server Components; redirects to /admin/login if unauthenticated.
 */
export async function requireAdminSession(): Promise<AdminUser> {
  const session = await validateAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }
  return session.user;
}
