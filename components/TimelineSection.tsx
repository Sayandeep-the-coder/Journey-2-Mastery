"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Swords, Scroll, Trophy, Calendar, Clock, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const timelineStages = [
  {
    week: "WEEK I",
    dates: "SEP 01 – SEP 07",
    kanji: "始", // Begin
    title: "FOUNDATION",
    subtitle: "Ideation & Architecture",
    deliverables: [
      "Project Blueprint",
      "Repository Setup",
      "Mentor Kickoff"
    ],
    icon: Sparkles,
  },
  {
    week: "WEEK II",
    dates: "SEP 08 – SEP 14",
    kanji: "創", // Create
    title: "DEVELOPMENT",
    subtitle: "MVP Build & Logic",
    deliverables: [
      "Core MVP Deployed",
      "Database & Auth Live",
      "Midway Checkpoint"
    ],
    icon: Swords,
  },
  {
    week: "WEEK III",
    dates: "SEP 15 – SEP 21",
    kanji: "磨", // Polish
    title: "EXECUTION",
    subtitle: "Refinement & Beta",
    deliverables: [
      "Feedback Integration",
      "UI/UX Polish",
      "Security Audit"
    ],
    icon: Scroll,
  },
  {
    week: "WEEK IV",
    dates: "SEP 22 – SEP 28",
    kanji: "極", // Mastery
    title: "MASTERY",
    subtitle: "Demo Day & Finale",
    deliverables: [
      "Live Product Demo",
      "Pitch Deck Final",
      "Award Ceremony"
    ],
    icon: Trophy,
  },
];

export default function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        }
      }
    );

    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      }
    );

    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id="timeline" ref={containerRef} className="py-20 md:py-28 bg-[var(--color-off-white)] relative z-20 border-b border-[var(--color-borders)] overflow-hidden">
      {/* Background Image Blend */}
      <div className="absolute inset-0 bg-[url('/images/landscape-temple.png')] bg-cover bg-center opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>
      
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-3">
              <span className="w-4 h-[1px] bg-[var(--color-japan-red)]"></span>
              4-WEEK PROGRAM SCHEDULE
            </div>
            <h2 ref={titleRef} className="font-heading text-3xl md:text-5xl text-[var(--color-primary-text)] tracking-widest uppercase">
              QUEST <span className="text-(--color-japan-red) font-onari font-normal tracking-normal">TIMELINE</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-[var(--color-borders)] text-[10px] font-bold tracking-[0.2em] text-[var(--color-secondary-text)] uppercase rounded-full">
            <Clock className="w-3.5 h-3.5 text-[var(--color-japan-red)]" />
            <span>Event starts <strong className="text-[var(--color-japan-red)]">Sep 01</strong></span>
          </div>
        </div>

        {/* Timeline Grid with Progress Connector */}
        <div className="relative">
          
          {/* Connecting Rail Line (Desktop) */}
          <div 
            ref={lineRef}
            className="hidden lg:block absolute top-6 left-12 right-12 h-[1px] bg-[var(--color-borders)] origin-left z-0"
          />

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pb-6 md:pb-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {timelineStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.week}
                  ref={el => { if (el) cardsRef.current[i] = el; }}
                  className="group relative flex flex-col p-8 bg-white border border-[var(--color-borders)] hover:border-[var(--color-japan-red)] transition-all duration-500 overflow-hidden min-w-[85vw] md:min-w-0 shrink-0 snap-center"
                >
                  {/* Background Kanji */}
                  <div className="absolute -right-4 -bottom-10 text-[180px] font-heading text-[var(--color-primary-text)] opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.08] group-hover:text-[var(--color-japan-red)] transition-all duration-700">
                    {stage.kanji}
                  </div>

                  {/* Top Node & Date Banner */}
                  <div className="flex items-center justify-between gap-3 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-off-white)] border border-[var(--color-borders)] group-hover:border-[var(--color-japan-red)] text-[var(--color-secondary-text)] group-hover:text-[var(--color-japan-red)] group-hover:bg-white flex items-center justify-center transition-colors duration-500">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-[10px] font-bold tracking-widest px-3 py-1 border border-[var(--color-borders)] group-hover:border-[var(--color-japan-red)]/30 group-hover:text-[var(--color-japan-red)] transition-colors duration-500 text-[var(--color-secondary-text)] uppercase rounded-full">
                      {stage.dates}
                    </div>
                  </div>

                  {/* Stage Number & Title */}
                  <div className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-secondary-text)] uppercase mb-2 relative z-10">
                    {stage.week}
                  </div>
                  
                  <h3 className="font-onari text-2xl tracking-widest text-[var(--color-primary-text)] mb-2 relative z-10">
                    {stage.title}
                  </h3>
                  
                  <p className="text-xs font-bold tracking-wider text-[var(--color-japan-red)] uppercase mb-8 relative z-10">
                    {stage.subtitle}
                  </p>

                  {/* Deliverables Minimal */}
                  <ul className="flex flex-col gap-4 relative z-10 border-t border-[var(--color-borders)] pt-6 mt-auto">
                    {stage.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs text-[var(--color-secondary-text)] uppercase font-semibold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-japan-red)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transitionDelay: `${idx * 100}ms` }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-borders)] shrink-0 absolute group-hover:opacity-0 transition-opacity"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-12 p-6 bg-white border border-[var(--color-borders)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left hover:border-[var(--color-japan-red)] transition-colors duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-japan-red)] text-white flex items-center justify-center font-heading text-xl shrink-0">
              4W
            </div>
            <div>
              <h4 className="font-heading text-lg tracking-wider text-[var(--color-primary-text)]">
                28 DAYS OF FOCUSED MASTERY
              </h4>
              <p className="text-[10px] font-bold tracking-[0.1em] text-[var(--color-secondary-text)] uppercase mt-1">
                Every Sunday is the submission deadline before unlocking the next level.
              </p>
            </div>
          </div>

          <a 
            href="#levels" 
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-japan-red)] group"
          >
            <span>Explore Levels</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
}
