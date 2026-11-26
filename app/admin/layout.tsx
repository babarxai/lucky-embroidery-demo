import Link from "next/link";
import { validateAdminSession } from "@/lib/auth/session";
import { logoutAdminAction } from "./actions";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateAdminSession();

  // If user is on login page or not authenticated, render without the admin nav shell
  if (!session.authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#1F2933] text-white border-b border-[#323F4B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-widest uppercase text-white">
                  LUCKY EMBROIDERY
                </span>
                <span className="text-[10px] bg-[#496B80] text-white uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  Admin
                </span>
              </Link>
              <nav className="hidden md:flex space-x-6 text-xs uppercase font-semibold tracking-wider">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/enquiries"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Enquiries
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="text-[#9AA5B1] hover:text-white transition-colors"
                >
                  View Site &rarr;
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-300 hidden sm:inline-block">
                {session.user.email}
              </span>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="text-xs font-semibold uppercase tracking-wider bg-[#323F4B] hover:bg-[#496B80] text-white px-3 py-1.5 rounded transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
