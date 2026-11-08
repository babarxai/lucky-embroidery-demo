import ConceptNotice from "@/components/ConceptNotice";

interface FooterLink {
  name: string;
  href: string;
}

const QUICK_LINKS: FooterLink[] = [
  { name: "Home", href: "#" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#1F2933] text-[#FFFFFF] pt-14 pb-12 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Top Section: Business Information & Navigation */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 sm:gap-10 lg:gap-16 pb-12 sm:pb-14">
          {/* Left: Business Info */}
          <div className="max-w-md">
            <a
              href="#"
              className="text-xl sm:text-2xl font-bold tracking-[0.08em] text-[#FFFFFF] uppercase inline-block transition-colors hover:text-[#D6DEE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded py-0.5"
              aria-label="Lucky Embroidery Home"
            >
              LUCKY EMBROIDERY
            </a>
            <p className="mt-2 text-sm sm:text-base text-[#D6DEE5]">
              Custom Embroidery &amp; Screen Printing
            </p>
          </div>

          {/* Right: Quick Links */}
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#D6DEE5] mb-4 sm:mb-5">
              QUICK LINKS
            </p>
            <nav aria-label="Footer Navigation">
              <ul className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3.5 sm:gap-6 lg:gap-8">
                {QUICK_LINKS.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-[#D6DEE5] hover:text-[#FFFFFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded py-0.5"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#53606D]" />

        {/* Concept Disclosure */}
        <div className="pt-6 sm:pt-7">
          <ConceptNotice variant="footer" />
        </div>

        {/* Bottom Section: Copyright & Location */}
        <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-[#D6DEE5] text-center sm:text-left">
          <p>© Lucky Embroidery. All rights reserved.</p>
          <p>Houston, Texas</p>
        </div>
      </div>
    </footer>
  );
}

