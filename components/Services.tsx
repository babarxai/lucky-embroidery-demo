import ServiceCard, { ServiceCardProps } from "./ServiceCard";

const SERVICES_DATA: ServiceCardProps[] = [
  {
    title: "Custom Embroidery",
    description:
      "Custom embroidered apparel for businesses, teams and organizations.",
    imageSrc: "/images/hero-embroidery.jpg",
    imageAlt: "Custom embroidered apparel for businesses, teams and organizations",
    objectPosition: "object-center",
  },
  {
    title: "Screen Printing",
    description:
      "Custom screen printing for apparel and branded clothing.",
    imageSrc: "/images/screen-printing.jpg",
    imageAlt: "Custom screen printing for apparel and branded clothing",
    objectPosition: "object-center",
  },
  {
    title: "Custom Apparel",
    description:
      "Apparel options for businesses, teams and organizations.",
    imageSrc: "/images/custom-apparel.png",
    imageAlt: "Apparel options for businesses, teams and organizations",
    objectPosition: "object-center",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="w-full scroll-mt-24 bg-[#FFFFFF] py-16 sm:py-20 lg:py-28 border-t border-[#1F2933]/5 overflow-x-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3">
            WHAT WE OFFER
          </p>
          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2933] tracking-tight leading-[1.15] mb-4"
          >
            Apparel Solutions for Every Need.
          </h2>
          <p className="text-base sm:text-lg text-[#626B73] leading-relaxed">
            Explore our custom embroidery, screen printing and apparel services.
          </p>
        </div>

        {/* Services Cards Grid: 3 equal-width cards in one row on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 items-stretch">
          {SERVICES_DATA.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
