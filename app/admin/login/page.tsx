"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAdminAction } from "../actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    if (result && !result.success && result.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-block text-center w-full mb-4">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#496B80]">
            LUCKY EMBROIDERY
          </span>
        </Link>
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2933]">
          Admin Portal Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-[#626B73]">
          Protected administration dashboard. Authorized team members only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-[#E5E7EB] sm:px-10">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1F2933]"
              >
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@luckyembroidery.com"
                  className="block w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2933] placeholder:text-[#9AA5B1] focus:border-[#496B80] focus:outline-none focus:ring-2 focus:ring-[#496B80]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#1F2933]"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#1F2933] placeholder:text-[#9AA5B1] focus:border-[#496B80] focus:outline-none focus:ring-2 focus:ring-[#496B80]/20"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold uppercase tracking-wider text-white bg-[#496B80] hover:bg-[#3d596b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#496B80] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Signing in..." : "Sign In to Dashboard"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-[#E5E7EB] pt-4 text-center">
            <p className="text-xs text-[#9AA5B1]">
              Need access? Administrator accounts are provisioned directly in the Supabase control panel. Public registration is disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
