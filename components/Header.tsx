"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Contact", href: "#contact" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F7F5]/95 backdrop-blur-sm border-b border-[#1F2933]/10">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-[0.08em] text-[#1F2933] uppercase transition-colors hover:text-[#496B80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded py-1"
          >
            LUCKY EMBROIDERY
          </Link>

          {/* Desktop & Tablet Navigation + CTA Container */}
          <div className="hidden md:flex items-center md:gap-6 lg:gap-8 xl:gap-10">
            <nav
              aria-label="Main Navigation"
            >
              <ul className="flex items-center md:gap-5 lg:gap-8 xl:gap-10">
                {NAV_ITEMS.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-[#626B73] hover:text-[#1F2933] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded py-1 px-1 whitespace-nowrap"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop & Tablet CTA */}
            <a
              href="#quote"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded bg-[#496B80] text-[#FFFFFF] text-xs font-semibold tracking-wider uppercase transition-colors hover:bg-[#3d596b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
            >
              REQUEST A QUOTE
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-[#1F2933] hover:text-[#496B80] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Panel */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-[#F7F7F5] border-t border-[#1F2933]/10 z-40 overflow-y-auto px-6 py-8"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col h-full justify-between pb-8">
            <ul className="flex flex-col space-y-5">
              {NAV_ITEMS.map((item) => (
                <li key={item.name} className="border-b border-[#1F2933]/5 pb-3">
                  <a
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-[#1F2933] hover:text-[#496B80] transition-colors block"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-8">
              <a
                href="#quote"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded bg-[#496B80] text-[#FFFFFF] text-sm font-semibold tracking-wider uppercase transition-colors hover:bg-[#3d596b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2"
              >
                REQUEST A QUOTE
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
