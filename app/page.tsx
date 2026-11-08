import ConceptNotice from "@/components/ConceptNotice";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#1F2933]">
      <ConceptNotice />
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <HowItWorks />
        <Gallery />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
