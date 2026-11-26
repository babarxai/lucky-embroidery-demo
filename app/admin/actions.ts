"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/ssr-server";
import { getTrustedServerClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth/session";
import { retryNotificationRecord } from "@/lib/email/service";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function loginAdminAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify admin role
    const session = await validateAdminSession();
    if (!session.authenticated) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "This account is not authorized to access the admin dashboard.",
      };
    }
  } catch {
    return { success: false, error: "Authentication service error. Please try again." };
  }

  redirect("/admin/dashboard");
}

export async function logoutAdminAction(): Promise<void> {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error
  }
  redirect("/admin/login");
}

export async function updateEnquiryStatusAction(
  enquiryId: string,
  newStatus: string
): Promise<ActionResult> {
  const session = await validateAdminSession();
  if (!session.authenticated) {
    return { success: false, error: "Unauthorized." };
  }

  const validStatuses = ["new", "contacted", "in_progress", "completed", "archived"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Invalid status value." };
  }

  try {
    const supabase = getTrustedServerClient();
    const { error } = await supabase
      .from("enquiries")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiryId);

    if (error) {
      return { success: false, error: "Failed to update status." };
    }

    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${enquiryId}`);
    revalidatePath("/admin/dashboard");

    return { success: true, message: `Status updated to ${newStatus}.` };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function retryNotificationAction(
  notificationId: string,
  enquiryId?: string
): Promise<ActionResult> {
  const session = await validateAdminSession();
  if (!session.authenticated) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const res = await retryNotificationRecord(notificationId);
    if (!res.success) {
      return { success: false, error: res.error || "Retry failed." };
    }

    if (enquiryId) {
      revalidatePath(`/admin/enquiries/${enquiryId}`);
    }
    revalidatePath("/admin/dashboard");

    return { success: true, message: "Notification resent successfully." };
  } catch {
    return { success: false, error: "Failed to retry notification." };
  }
}
