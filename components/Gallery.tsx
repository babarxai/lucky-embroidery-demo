import Image from "next/image";

interface ShowcaseItem {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: "Custom Embroidery",
    description: "Explore embroidered apparel and logo detailing.",
    imageSrc: "/images/gallery-embroidery.jpg",
    imageAlt: "Detailed close-up of custom 3D puff embroidery stitching",
  },
  {
    title: "Screen Printing",
    description: "Custom prints for apparel and branded clothing.",
    imageSrc: "/images/gallery-screen-printing.jpg",
    imageAlt: "Screen printing press process with squeegee and ink application",
  },
  {
    title: "Custom Apparel",
    description: "Apparel ideas for teams and businesses.",
    imageSrc: "/images/gallery-custom-apparel.jpg",
    imageAlt: "Custom branded hoodies displaying front and back logo placements",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="w-full scroll-mt-24 bg-[#FFFFFF] py-16 sm:py-20 lg:py-28 border-t border-[#1F2933]/5 overflow-x-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header (matching Figma composition) */}
        <div className="max-w-2xl mb-10 sm:mb-12 lg:mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3">
            PRODUCT SHOWCASE
          </p>
          <h2
            id="gallery-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2933] tracking-tight leading-[1.15] mb-3 sm:mb-4"
          >
            A Closer Look at Custom Apparel.
          </h2>
          <p className="text-base sm:text-lg text-[#626B73] leading-relaxed">
            Explore embroidery, printing and apparel examples to find inspiration
            for your next project.
          </p>
        </div>

        {/* 3 Showcase Cards: Horizontal row on desktop, vertically stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 xl:gap-10">
          {SHOWCASE_ITEMS.map((item) => (
            <article key={item.title} className="group flex flex-col">
              {/* Image Container with Consistent Dimensions and Rounded Corners */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F7F5] ring-1 ring-[#1F2933]/10">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 420px"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* Title and Description Below Image */}
              <div className="mt-4 sm:mt-5">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1F2933] mb-1.5 sm:mb-2 group-hover:text-[#496B80] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-[#626B73] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

