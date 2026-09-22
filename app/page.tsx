import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Levels from "@/components/Levels";
import TimelineSection from "@/components/TimelineSection";
import MentorsSection from "@/components/MentorsSection";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import SmoothScrolling from "@/components/SmoothScrolling";

export default function Home() {
  return (
    <SmoothScrolling>
      <main className="bg-(--color-off-white) min-h-screen relative">
        <Navbar />
        <Hero />
        <Levels />
        <TimelineSection />
        <MentorsSection />
        <FeaturesSection />
        <FAQSection />
        <Footer />
      </main>
    </SmoothScrolling>
  );
}




