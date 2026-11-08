import Image from "next/image";

interface Highlight {
  title: string;
  description: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    title: "10+ Years in Houston",
    description: "Serving Houston with custom embroidery and screen printing for over a decade.",
  },
  {
    title: "In-House Production",
    description: "All garment customization and production handled directly in-house.",
  },
  {
    title: "SWF Equipment",
    description: "Equipped with commercial SWF multi-needle embroidery machinery.",
  },
];

const SERVICE_TAGS = ["CUSTOM EMBROIDERY", "SCREEN PRINTING"];

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="w-full scroll-mt-24 bg-[#F7F7F5] py-16 sm:py-20 lg:py-28 border-t border-[#1F2933]/5 overflow-x-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column on Desktop / First on Mobile: Workshop Image */}
          <div className="lg:col-span-5 xl:col-span-5 w-full">
            <div className="relative w-full max-w-lg lg:max-w-none mx-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[#1F2933]/10 bg-[#FFFFFF]">
              <Image
                src="/images/about-workshop.jpg"
                alt="Industrial embroidery machinery and textile customization equipment"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
            {/* Subtle Illustrative Image Caption */}
            <p className="mt-3 text-xs text-[#626B73] text-center lg:text-left italic">
              Illustrative image
            </p>
          </div>

          {/* Right Column on Desktop / Second on Mobile: Text Content */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start justify-center">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3">
              ABOUT LUCKY EMBROIDERY
            </p>

            {/* Heading */}
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2933] tracking-tight leading-[1.15] mb-5"
            >
              Custom Embroidery &amp; Screen Printing in Houston.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#626B73] leading-relaxed mb-6">
              Lucky Embroidery provides embroidery and screen printing services for
              individuals, sports teams, small businesses and corporate customers.
            </p>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {SERVICE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#FFFFFF] text-[#496B80] border border-[#1F2933]/10 shadow-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Highlights */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#1F2933]/10 shadow-xs"
                >
                  <h3 className="text-base font-bold text-[#1F2933] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#626B73] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button linking to Contact */}
            <div>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded bg-[#496B80] text-[#FFFFFF] text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:bg-[#3d596b] shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2"
              >
                REQUEST A QUOTE
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

