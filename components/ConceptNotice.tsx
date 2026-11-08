interface ConceptNoticeProps {
  variant?: "banner" | "footer";
}

export default function ConceptNotice({
  variant = "banner",
}: ConceptNoticeProps) {
  if (variant === "footer") {
    return (
      <p className="text-xs sm:text-sm text-[#D6DEE5] leading-relaxed text-center sm:text-left">
        <span className="font-semibold text-[#FFFFFF]">
          Unofficial Website Redesign Concept
        </span>
        {" — Independently created and not affiliated with Lucky Embroidery."}
      </p>
    );
  }

  return (
    <div
      role="note"
      aria-label="Website disclosure"
      className="w-full bg-[#EFEFEA] border-b border-[#1F2933]/10"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 py-2.5 sm:py-3">
        <p className="text-center text-xs sm:text-sm leading-relaxed text-[#626B73]">
          <span className="font-semibold text-[#496B80]">
            Unofficial Website Redesign Concept
          </span>
          {" — Independently created and not affiliated with Lucky Embroidery."}
        </p>
      </div>
    </div>
  );
}
