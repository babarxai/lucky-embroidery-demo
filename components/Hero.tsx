import Image from "next/image";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full bg-[#F7F7F5] overflow-x-hidden pt-8 pb-16 sm:py-16 md:py-20 lg:py-24"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start justify-center">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3 sm:mb-4">
              CUSTOM EMBROIDERY • SCREEN PRINTING
            </p>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] font-bold text-[#1F2933] tracking-tight leading-[1.12] mb-5 sm:mb-6"
            >
              Custom Embroidery &amp; Screen Printing for Your Brand.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl text-[#626B73] leading-relaxed max-w-xl mb-8 sm:mb-10">
              Custom embroidery and screen printing for businesses, teams and
              organizations. Share your project requirements and request a quote.
            </p>

            {/* CTA Button */}
            <div>
              <a
                href="#quote"
                className="inline-flex items-center justify-center px-8 py-4 rounded bg-[#496B80] text-[#FFFFFF] text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:bg-[#3d596b] shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2"
              >
                REQUEST A QUOTE
              </a>
            </div>
          </div>

          {/* Right Column (Desktop) / Below CTA (Mobile): Hero Product Photograph */}
          <div className="lg:col-span-6 xl:col-span-6 w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[580px] aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-xl ring-1 ring-[#1F2933]/10 bg-[#EFEFEA]">
              <Image
                src="/images/hero-embroidery.jpg"
                alt="Detailed custom embroidery showcase representing Lucky Embroidery precision craft"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 580px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
