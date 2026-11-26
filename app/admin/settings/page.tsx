import { requireAdminSession } from "@/lib/auth/session";

export const instant = false;

export default async function AdminSettingsPage() {
  const adminUser = await requireAdminSession();

  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY)
  );
  const secretKeyConfigured = Boolean(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const turnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);
  const upstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  const enquiriesEnabled = process.env.ENQUIRIES_ENABLED !== "false";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933]">System Configuration &amp; Status</h1>
        <p className="text-sm text-[#626B73] mt-1">
          Review backend services, security protections, and active administrator session.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#496B80]">
          Active Administrator Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-[#626B73] block uppercase font-medium">Logged in Email</span>
            <span className="font-semibold text-[#1F2933]">{adminUser.email}</span>
          </div>
          <div>
            <span className="text-xs text-[#626B73] block uppercase font-medium">Role</span>
            <span className="font-semibold text-[#1F2933] uppercase">{adminUser.role}</span>
          </div>
          <div>
            <span className="text-xs text-[#626B73] block uppercase font-medium">Session ID</span>
            <span className="font-mono text-xs text-[#626B73]">{adminUser.id}</span>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#496B80]">
          Integrated Services Status
        </h2>

        <div className="divide-y divide-[#E5E7EB]">
          {/* Supabase */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Supabase Database &amp; Auth</p>
              <p className="text-xs text-[#626B73]">
                Core database storage, Row-Level Security, and session management.
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                supabaseConfigured ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {supabaseConfigured ? "Active" : "Missing Config"}
            </span>
          </div>

          {/* Trusted Secret Key */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Server-Side Secret Key</p>
              <p className="text-xs text-[#626B73]">
                Trusted server insertion credential separate from anonymous browser traffic.
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                secretKeyConfigured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {secretKeyConfigured ? "Configured" : "Publishable Fallback"}
            </span>
          </div>

          {/* Resend */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Transactional Email (Resend)</p>
              <p className="text-xs text-[#626B73]">
                Admin alert notifications and customer acknowledgements.
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                resendConfigured ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
              }`}
            >
              {resendConfigured ? "Connected" : "Not Configured (Logs Pending)"}
            </span>
          </div>

          {/* Rate Limiting */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Serverless Rate Limiter</p>
              <p className="text-xs text-[#626B73]">
                {upstashConfigured
                  ? "Upstash Redis distributed rate limiting."
                  : "Durable Supabase IP hash database-backed rate limiting."}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          {/* Cloudflare Turnstile */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Anti-Bot &amp; CAPTCHA</p>
              <p className="text-xs text-[#626B73]">
                {turnstileConfigured
                  ? "Cloudflare Turnstile token validation active."
                  : "Built-in Honeypot & time-analysis anti-bot verification active."}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          {/* Production Enquiry Switch */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1F2933]">Enquiry Storage Switch</p>
              <p className="text-xs text-[#626B73]">
                Controls whether validated enquiries are stored in Supabase.
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                enquiriesEnabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {enquiriesEnabled ? "Enabled" : "Disabled (Demo Mode)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
