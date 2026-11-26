import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getTrustedServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const supabase = getTrustedServerClient();

  // 1. Fetch metrics
  const { count: totalCount } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true });

  const { count: newCount } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const { count: inProgressCount } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "in_progress");

  const { count: completedCount } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: failedNotifCount } = await supabase
    .from("enquiry_notifications")
    .select("id", { count: "exact", head: true })
    .eq("status", "failed");

  // 2. Fetch 5 most recent enquiries
  const { data: recentEnquiries } = await supabase
    .from("enquiries")
    .select("id, full_name, email, service, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933]">Overview</h1>
        <p className="text-sm text-[#626B73] mt-1">
          Real-time enquiry metrics and recent submissions from Lucky Embroidery.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#626B73]">Total Enquiries</p>
          <p className="text-2xl font-bold text-[#1F2933] mt-2">{totalCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">New</p>
          <p className="text-2xl font-bold text-[#1F2933] mt-2">{newCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">In Progress</p>
          <p className="text-2xl font-bold text-[#1F2933] mt-2">{inProgressCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
          <p className="text-2xl font-bold text-[#1F2933] mt-2">{completedCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Failed Alerts</p>
          <p className="text-2xl font-bold text-[#1F2933] mt-2">{failedNotifCount || 0}</p>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1F2933]">Recent Enquiries</h2>
          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold uppercase tracking-wider text-[#496B80] hover:text-[#3d596b]"
          >
            View All &rarr;
          </Link>
        </div>

        {recentEnquiries && recentEnquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1F2933]">
              <thead className="bg-[#F7F7F5] text-xs uppercase font-semibold text-[#626B73] tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Service</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-medium">
                      <div>{e.full_name}</div>
                      <div className="text-xs text-[#626B73]">{e.email}</div>
                    </td>
                    <td className="py-4 px-6 text-[#626B73]">{e.service || "General"}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          e.status === "new"
                            ? "bg-blue-100 text-blue-800"
                            : e.status === "contacted"
                            ? "bg-purple-100 text-purple-800"
                            : e.status === "in_progress"
                            ? "bg-amber-100 text-amber-800"
                            : e.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#626B73]">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/enquiries/${e.id}`}
                        className="text-xs font-semibold text-[#496B80] hover:text-[#3d596b]"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#626B73]">
            No enquiries received yet. Form submissions will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
