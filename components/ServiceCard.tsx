import Image from "next/image";

export interface ServiceCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  objectPosition?: string;
}

export default function ServiceCard({
  title,
  description,
  imageSrc,
  imageAlt,
  objectPosition = "object-center",
}: ServiceCardProps) {
  return (
    <article className="group flex flex-col bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#1F2933]/10 transition-all duration-300 hover:shadow-lg hover:border-[#496B80]/40">
      {/* Top Image: Fixed aspect ratio for consistent dimensions across all cards */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F7F7F5] border-b border-[#1F2933]/5">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 420px"
          className={`object-cover ${objectPosition} transition-transform duration-500 ease-out group-hover:scale-105`}
        />
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <h3 className="text-xl sm:text-2xl font-bold text-[#1F2933] mb-3 group-hover:text-[#496B80] transition-colors">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-[#626B73] leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
