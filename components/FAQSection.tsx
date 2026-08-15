"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HelpCircle, ChevronDown, MessageSquare, ArrowRight, Sparkles, Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "What is Journey to Mastery (J2M)?",
    answer: "Journey to Mastery is an intensive 4-week coding quest designed for developers, builders, and designers to transform a single idea into a live, scalable product with real users, supported by expert mentorship and structured weekly milestones."
  },
  {
    question: "Who can participate in this quest?",
    answer: "Anyone with a passion for building! Whether you are a college student, a self-taught beginner, or an experienced developer, you are welcome. The program is structured into 4 progressive levels (Ronin, Kenshi, Samurai, Shogun) that guide you from foundation to deployment."
  },
  {
    question: "Can I participate individually or do I need a team?",
    answer: "You can participate either as a solo warrior or in squads of up to 4 members. If you join solo, you can also find teammates during Week 1 (Foundation) through our community Discord and team formation channels."
  },
  {
    question: "Is there any registration or participation fee?",
    answer: "No, Journey to Mastery is 100% free of cost. Our goal is to empower builders with real-world shipping experience, mentorship, and platform recognition without any financial barrier."
  },
  {
    question: "What happens if I don't have an idea before the program starts?",
    answer: "That is completely fine! Week 1 (Foundation) is dedicated to problem discovery, brainstorming, and validating concept feasibility with our mentors before writing a single line of production code."
  },
  {
    question: "How does the weekly progression and leveling work?",
    answer: "Every week corresponds to an exact 7-day stage with specific deliverables due on Sunday midnight. Once your milestone submission is reviewed by judges and mentors, your rank advances to the next warrior level."
  },
  {
    question: "What kind of mentorship and support will I receive?",
    answer: "You will have access to 1-on-1 scheduled office hours with industry veterans, asynchronous Discord code reviews, pre-demo pitch deck audits, and technical workshops throughout the 28 days."
  },
  {
    question: "How are the final winners evaluated on Demo Day?",
    answer: "Projects are judged on technical execution, innovation, UI/UX polish, problem-solution fit, and the live pitch demonstration during the final Shogun stage."
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Support Box */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-32">
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
          <div ref={rightColRef} className="lg:col-span-7 flex flex-col gap-3.5">
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
