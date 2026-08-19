"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HelpCircle, ChevronDown, MessageSquare, ArrowRight, Sparkles, Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "I'm a complete beginner. Is this too advanced for me?",
    answer: "Not at all! Journey to Mastery is designed specifically to take you from a beginner to a builder. You'll learn by actually building something, and our mentors are here to help you every step of the way. If you know the basics of coding, you're ready."
  },
  {
    question: "What exactly will we be doing for 4 weeks?",
    answer: "You'll be building a real, working software project from scratch! Week 1 is just planning and ideas. Week 2 is building the core features. Week 3 is polishing and fixing bugs, and Week 4 is showing it off to everyone. Think of it as a 28-day guided hackathon."
  },
  {
    question: "Do I need a team, or can I work alone?",
    answer: "Both are totally fine! You can fly solo as a lone warrior, or team up with up to 3 other friends. If you don't have a team but want one, you can easily find teammates in our Discord during the first week."
  },
  {
    question: "I don't have any project ideas right now. Is that okay?",
    answer: "Absolutely! The entire first week (Foundation) is dedicated exactly to this. You'll brainstorm, look at real-world problems, and chat with mentors to figure out a cool, achievable idea before writing any code."
  },
  {
    question: "Do I have to pay anything to join?",
    answer: "Nope! Journey to Mastery is 100% free. It's hosted by the Developer Community (DC KGEC) to help students and builders learn how to ship real products without any financial barriers."
  },
  {
    question: "How much time do I need to commit every week?",
    answer: "It's flexible, but we recommend around 10-15 hours a week. The most important thing is that every Sunday at midnight, you'll need to submit whatever milestone was set for that week to level up."
  },
  {
    question: "What happens if I get stuck on a coding bug?",
    answer: "You won't be stuck for long! You'll have access to our Discord community where you can ask questions anytime. Plus, you can book 1-on-1 office hours with our experienced mentors if you need deeper technical help."
  },
  {
    question: "What are these 'Levels' (Ronin, Kenshi, etc.)?",
    answer: "It's a fun ranking system based on Japanese martial arts! Everyone starts as a 'Ronin' (Level 1). As you complete your weekly submissions, you rank up to Kenshi, Samurai, and finally Shogun when you finish your project."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !leftColRef.current) return;

    gsap.fromTo(
      leftColRef.current,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );

    gsap.fromTo(
      rightColRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="faq" ref={containerRef} className="py-20 md:py-28 bg-[var(--color-off-white)] border-b border-[var(--color-borders)] relative overflow-hidden">
      {/* Background Image Blend */}
      <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>
      
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Split 2-Column FAQ Layout (faq-section-2 style) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16 items-start">
          
          {/* Left Column: Heading & Support Box */}
          <div ref={leftColRef} className="xl:col-span-5 flex flex-col items-start xl:sticky xl:top-32">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            
            <h2 className="font-heading text-3xl md:text-5xl text-[var(--color-primary-text)] tracking-widest uppercase mb-4 leading-tight">
              EVERYTHING YOU <span className="text-(--color-japan-red) font-onari font-normal tracking-normal">NEED TO KNOW</span>
            </h2>

            <p className="text-sm text-[var(--color-secondary-text)] leading-relaxed mb-8 max-w-md">
              Have questions about the timeline, team eligibility, mentor sessions, or demo day? Find answers to commonly asked questions below.
            </p>

            {/* Support Card Box */}
            <div className="w-full p-6 rounded-lg bg-[var(--color-card-bg)] border border-[var(--color-borders)] flex flex-col gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-japan-red)]/10 text-[var(--color-japan-red)] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-base tracking-wider text-[var(--color-primary-text)]">
                    Still have questions?
                  </h4>
                  <p className="text-xs text-[var(--color-secondary-text)]">
                    Our community senseis are here to help.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://dc.kgec.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[var(--color-japan-red)] text-white text-xs font-bold tracking-wider hover:bg-[var(--color-dark-red)] transition-colors shadow-xs"
                >
                  <span>Join Discord</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href="mailto:support@kgec.tech"
                  className="inline-flex items-center justify-center p-2.5 rounded-sm border border-[var(--color-borders)] bg-white text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] hover:border-[var(--color-japan-red)] transition-colors"
                  aria-label="Email Support"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion List */}
          <div ref={rightColRef} className="xl:col-span-7 flex flex-col gap-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-lg bg-[var(--color-card-bg)] border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-[var(--color-japan-red)] shadow-xs" 
                      : "border-[var(--color-borders)] hover:border-[var(--color-japan-red)]/40"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`text-xs font-heading font-bold tracking-wider ${isOpen ? "text-[var(--color-japan-red)]" : "text-[var(--color-secondary-text)]"}`}>
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-base md:text-lg tracking-wide text-[var(--color-primary-text)]">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[var(--color-japan-red)]/10 text-[var(--color-japan-red)]" : "bg-[var(--color-secondary-bg)] text-[var(--color-secondary-text)]"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 border-t border-[var(--color-borders)]/40 text-xs md:text-sm text-[var(--color-secondary-text)] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="mt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
