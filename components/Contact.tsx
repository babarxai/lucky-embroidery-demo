"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  projectDetails: string;
  faxNumber: string; // Honeypot field
}

interface FormErrors {
  fullName?: string;
  email?: string;
  projectDetails?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    projectDetails: "",
    faxNumber: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formLoadTimeRef = useRef<number>(0);

  useEffect(() => {
    formLoadTimeRef.current = Date.now();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.projectDetails.trim()) {
      newErrors.projectDetails = "Please describe your project or requirements.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          projectDetails: formData.projectDetails,
          honeypot: formData.faxNumber,
          clientTimestamp: formLoadTimeRef.current || Date.now(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 201) {
        setIsSubmitted(true);
      } else if (response.status === 400 && data?.errors) {
        setErrors(data.errors);
        setSubmitError(data.message || "Please fix the highlighted errors.");
      } else if (response.status === 429) {
        setSubmitError(
          "You have submitted multiple enquiries recently. Please wait a while or call us directly at (832) 940-2320."
        );
      } else {
        setSubmitError(
          data?.message ||
            "Unable to submit your enquiry right now. Please try again or call us at (832) 940-2320."
        );
      }
    } catch {
      setSubmitError(
        "A network error occurred while submitting your enquiry. Please check your connection or call us at (832) 940-2320."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      service: "",
      projectDetails: "",
      faxNumber: "",
    });
    setErrors({});
    setSubmitError(null);
    setIsSubmitted(false);
    formLoadTimeRef.current = Date.now();
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="w-full scroll-mt-24 bg-[#F7F7F5] py-16 sm:py-20 lg:py-28 border-t border-[#1F2933]/5 overflow-x-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-20 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#496B80] mb-3">
              GET IN TOUCH
            </p>

            {/* Heading */}
            <h2
              id="contact-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2933] tracking-tight leading-[1.15] mb-4 sm:mb-5"
            >
              Let&apos;s Discuss Your Project.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#626B73] leading-relaxed mb-8 sm:mb-10">
              Tell us what you&apos;re looking for. Share your apparel
              requirements and get in touch to discuss your project.
            </p>

            {/* Contact Details List */}
            <div className="space-y-6 sm:space-y-8">
              {/* Phone */}
              <div>
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#496B80] block mb-2">
                  PHONE
                </span>
                <a
                  href="tel:+18329402320"
                  className="text-base sm:text-lg text-[#1F2933] font-medium hover:text-[#496B80] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] rounded py-0.5 inline-block"
                >
                  (832) 940-2320
                </a>
              </div>

              {/* Business Hours */}
              <div>
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#496B80] block mb-2">
                  BUSINESS HOURS
                </span>
                <div className="text-base text-[#1F2933] font-normal space-y-1">
                  <p>Mon–Fri: 9 AM – 6 PM</p>
                  <p>Saturday: 9 AM – 5 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              {/* Address / Visit Us */}
              <div>
                <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#496B80] block mb-2">
                  VISIT US
                </span>
                <div className="text-base text-[#1F2933] font-normal leading-relaxed">
                  <p>10822 S Gessner Rd.</p>
                  <p>Houston, TX 77071</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Request a Quote Form Card */}
          <div
            id="quote"
            className="lg:col-span-7 scroll-mt-24 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs"
          >
            <div className="mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
                Request a Quote
              </h3>
              <p className="text-sm sm:text-base text-[#626B73] mt-2">
                Share your project details and we&apos;ll be happy to discuss your
                requirements.
              </p>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
              >
                <svg
                  className="w-5 h-5 shrink-0 text-red-500 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {isSubmitted ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl bg-[#F7F7F5] border border-[#1F2933]/10 p-6 sm:p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#496B80]/15 text-[#496B80] flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-[#1F2933] mb-2">
                  Thank You for Your Enquiry!
                </h4>
                <p className="text-sm text-[#626B73] leading-relaxed mb-4 max-w-md mx-auto">
                  We have received your project details. Our team will review your specifications and get in touch with a customized quote shortly.
                </p>
                <p className="text-sm text-[#1F2933] font-medium mb-6">
                  Need immediate assistance? Call us directly at{" "}
                  <a
                    href="tel:+18329402320"
                    className="text-[#496B80] underline hover:text-[#3d596b]"
                  >
                    (832) 940-2320
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded bg-[#496B80] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#3d596b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2 cursor-pointer"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 w-full">
                {/* Honeypot field for bot trapping (invisible to real users) */}
                <div aria-hidden="true" style={{ display: "none" }}>
                  <label htmlFor="faxNumber">Fax Number</label>
                  <input
                    type="text"
                    id="faxNumber"
                    name="faxNumber"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.faxNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* 2 Columns on Desktop for Name & Email; Stacked on Mobile (<640px) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Full Name */}
                  <div className="w-full">
                    <label
                      htmlFor="fullName"
                      className="text-xs font-semibold tracking-wider uppercase text-[#1F2933] mb-2 block"
                    >
                      FULL NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Your full name"
                      aria-invalid={errors.fullName ? "true" : "false"}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.fullName
                          ? "border-red-500 focus:ring-red-400"
                          : "border-[#E5E7EB] focus:ring-[#496B80]"
                      } bg-white text-[#1F2933] placeholder:text-[#626B73]/60 focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-60`}
                    />
                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        className="text-xs text-red-600 mt-1.5"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="w-full">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold tracking-wider uppercase text-[#1F2933] mb-2 block"
                    >
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="name@example.com"
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.email
                          ? "border-red-500 focus:ring-red-400"
                          : "border-[#E5E7EB] focus:ring-[#496B80]"
                      } bg-white text-[#1F2933] placeholder:text-[#626B73]/60 focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-60`}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-xs text-red-600 mt-1.5"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2 Columns on Desktop for Phone & Service; Stacked on Mobile (<640px) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Phone Number */}
                  <div className="w-full">
                    <label
                      htmlFor="phone"
                      className="text-xs font-semibold tracking-wider uppercase text-[#1F2933] mb-2 block"
                    >
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Your phone number"
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] placeholder:text-[#626B73]/60 focus:outline-none focus:ring-2 focus:ring-[#496B80] transition-all text-sm disabled:opacity-60"
                    />
                  </div>

                  {/* Service / Product */}
                  <div className="w-full">
                    <label
                      htmlFor="service"
                      className="text-xs font-semibold tracking-wider uppercase text-[#1F2933] mb-2 block"
                    >
                      SERVICE / PRODUCT
                    </label>
                    <div className="relative w-full">
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#496B80] transition-all text-sm appearance-none cursor-pointer pr-10 disabled:opacity-60"
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        <option value="Custom Embroidery">Custom Embroidery</option>
                        <option value="Screen Printing">Screen Printing</option>
                        <option value="Custom Apparel">Custom Apparel</option>
                        <option value="Multiple / Other Services">
                          Multiple / Other Services
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#626B73]">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="w-full">
                  <label
                    htmlFor="projectDetails"
                    className="text-xs font-semibold tracking-wider uppercase text-[#1F2933] mb-2 block"
                  >
                    PROJECT DETAILS <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="projectDetails"
                    name="projectDetails"
                    rows={4}
                    value={formData.projectDetails}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Tell us about your project, quantity and requirements..."
                    aria-invalid={errors.projectDetails ? "true" : "false"}
                    aria-describedby={
                      errors.projectDetails ? "projectDetails-error" : undefined
                    }
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.projectDetails
                        ? "border-red-500 focus:ring-red-400"
                        : "border-[#E5E7EB] focus:ring-[#496B80]"
                    } bg-white text-[#1F2933] placeholder:text-[#626B73]/60 focus:outline-none focus:ring-2 transition-all text-sm resize-none disabled:opacity-60`}
                  />
                  {errors.projectDetails && (
                    <p
                      id="projectDetails-error"
                      className="text-xs text-red-600 mt-1.5"
                    >
                      {errors.projectDetails}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="w-full">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded bg-[#496B80] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[#3d596b] transition-all shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#496B80] focus-visible:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>SUBMITTING...</span>
                      </>
                    ) : (
                      "SUBMIT ENQUIRY"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
