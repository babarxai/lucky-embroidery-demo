import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { getTrustedServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;

  const searchQuery = params.q?.trim() || "";
  const statusFilter = params.status?.trim() || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 15;
  const offset = (page - 1) * pageSize;

  const supabase = getTrustedServerClient();

  let query = supabase
    .from("enquiries")
    .select("id, full_name, email, phone, service, status, created_at", {
      count: "exact",
    });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.or(
      `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,project_details.ilike.%${searchQuery}%`
    );
  }

  const { data: enquiries, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalPages = Math.ceil((count || 0) / pageSize);

  const statuses = [
    { label: "All", value: "all" },
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2933]">Customer Enquiries</h1>
          <p className="text-sm text-[#626B73]">
            {count || 0} total enquiries recorded
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {statuses.map((s) => {
            const isActive =
              (!statusFilter && s.value === "all") || statusFilter === s.value;
            return (
              <Link
                key={s.value}
                href={`/admin/enquiries?status=${s.value}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-[#1F2933] text-white"
                    : "bg-[#F7F7F5] text-[#626B73] hover:bg-gray-200"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" className="w-full md:w-72">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search enquiries..."
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E5E7EB] text-[#1F2933] placeholder:text-[#9AA5B1] focus:outline-none focus:ring-2 focus:ring-[#496B80]/20 focus:border-[#496B80]"
          />
        </form>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {enquiries && enquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1F2933]">
              <thead className="bg-[#F7F7F5] text-xs uppercase font-semibold text-[#626B73] tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6">Service</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-medium">
                      <div>{e.full_name}</div>
                      <div className="text-xs text-[#626B73]">{e.email}</div>
                    </td>
                    <td className="py-4 px-6 text-[#626B73]">{e.phone || "—"}</td>
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
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#626B73]">
            No matching enquiries found.
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#626B73]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/enquiries?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="px-3 py-1.5 rounded border border-[#E5E7EB] hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/enquiries?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="px-3 py-1.5 rounded border border-[#E5E7EB] hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
