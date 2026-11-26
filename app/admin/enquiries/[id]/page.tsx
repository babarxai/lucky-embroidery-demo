import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { getTrustedServerClient } from "@/lib/supabase/server";
import { updateEnquiryStatusAction, retryNotificationAction } from "../../actions";

export const instant = false;

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const supabase = getTrustedServerClient();

  // Fetch enquiry
  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !enquiry) {
    notFound();
  }

  // Fetch associated notifications
  const { data: notifications } = await supabase
    .from("enquiry_notifications")
    .select("*")
    .eq("enquiry_id", id)
    .order("created_at", { ascending: false });

  const statuses = ["new", "contacted", "in_progress", "completed", "archived"];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button and title */}
      <div>
        <Link
          href="/admin/enquiries"
          className="text-xs font-semibold uppercase tracking-wider text-[#496B80] hover:text-[#3d596b] inline-flex items-center gap-1 mb-2"
        >
          &larr; Back to Enquiries
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933]">
              {enquiry.full_name}
            </h1>
            <p className="text-xs text-[#626B73] mt-1">
              Enquiry ID: <span className="font-mono">{enquiry.id}</span> &bull; Submitted on{" "}
              {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>

          {/* Status Change Form */}
          <form
            action={async (formData) => {
              "use server";
              const newStatus = formData.get("status") as string;
              if (newStatus) {
                await updateEnquiryStatusAction(enquiry.id, newStatus);
              }
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="statusSelect" className="text-xs font-semibold uppercase text-[#626B73]">
              Status:
            </label>
            <select
              id="statusSelect"
              name="status"
              defaultValue={enquiry.status}
              className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#496B80]"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider bg-[#496B80] hover:bg-[#3d596b] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Update
            </button>
          </form>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client & Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#496B80]">
              Customer Contact Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#626B73] block uppercase font-medium">Email Address</span>
                <a
                  href={`mailto:${enquiry.email}`}
                  className="font-semibold text-[#1F2933] hover:text-[#496B80] underline"
                >
                  {enquiry.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-[#626B73] block uppercase font-medium">Phone Number</span>
                {enquiry.phone ? (
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="font-semibold text-[#1F2933] hover:text-[#496B80]"
                  >
                    {enquiry.phone}
                  </a>
                ) : (
                  <span className="text-[#9AA5B1]">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-xs text-[#626B73] block uppercase font-medium">Requested Service</span>
                <span className="font-semibold text-[#1F2933]">{enquiry.service || "General"}</span>
              </div>
              <div>
                <span className="text-xs text-[#626B73] block uppercase font-medium">Last Updated</span>
                <span className="text-xs text-[#626B73]">
                  {new Date(enquiry.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#496B80]">
              Project Specifications
            </h2>
            <div className="bg-[#F7F7F5] p-4 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2933] whitespace-pre-wrap leading-relaxed">
              {enquiry.project_details}
            </div>
          </div>
        </div>

        {/* Right Column: Notification Log & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#496B80]">
              Email Notifications
            </h2>

            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F7F5] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase tracking-wider text-[#1F2933]">
                        {notif.type === "admin_notification" ? "Admin Alert" : "Customer Ack"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          notif.status === "sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : notif.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {notif.status}
                      </span>
                    </div>
                    <div className="text-[#626B73] truncate">To: {notif.recipient}</div>
                    {notif.error_message && (
                      <div className="text-red-600 font-mono text-[11px]">
                        Error: {notif.error_message}
                      </div>
                    )}
                    {notif.status === "failed" && (
                      <form
                        action={async () => {
                          "use server";
                          await retryNotificationAction(notif.id, enquiry.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="mt-1 text-xs font-semibold text-[#496B80] hover:text-[#3d596b] underline cursor-pointer"
                        >
                          Retry Sending &rarr;
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#626B73]">No notifications logged for this enquiry.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
