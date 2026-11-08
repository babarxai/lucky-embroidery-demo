interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

const STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Share Your Requirements",
    description:
      "Tell us what apparel you need, along with quantity and customization details.",
  },
  {
    number: "02",
    title: "Discuss Your Order",
    description:
      "Review product options, customization requirements and order details.",
  },
  {
    number: "03",
    title: "Approve the Details",
    description:
      "Confirm the agreed design and order specifications before production.",
  },
  {
    number: "04",
    title: "Production & Completion",
    description:
      "Your approved order moves through production towards completion.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full scroll-mt-24 bg-[#F7F7F5] py-16 sm:py-20 lg:py-28 border-t border-[#1F2933]/5 overflow-x-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header (matching Figma composition) */}
        <div className="max-w-2xl mb-10 sm:mb-12 lg:mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3">
            OUR PROCESS
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2933] tracking-tight leading-[1.15] mb-3 sm:mb-4"
          >
            Getting Started Is Simple.
          </h2>
          <p className="text-base sm:text-lg text-[#626B73] leading-relaxed">
            From your initial enquiry to your finished apparel, let&apos;s bring
            your ideas to life.
          </p>
        </div>

        {/* 4 Cards Grid: Horizontal row on desktop, vertically stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-6 xl:gap-8 items-stretch">
          {STEPS.map((step) => (
            <article
              key={step.number}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 lg:p-8 flex flex-col justify-start transition-all duration-200 hover:border-[#496B80]/40 hover:shadow-xs"
            >
              <span className="text-sm font-semibold text-[#496B80] tracking-wider mb-6 sm:mb-8 block">
                {step.number}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2933] tracking-tight mb-2 sm:mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[#626B73] leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

