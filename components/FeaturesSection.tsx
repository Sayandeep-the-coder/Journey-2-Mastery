"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MonitorPlay, Users, Code, Award, Rocket, Database, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-16 md:py-24 bg-[var(--color-off-white)] relative z-20 border-b border-[var(--color-borders)] overflow-hidden">
      
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col mb-12 md:mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-[var(--color-japan-red)]"></span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase">
              The Arsenal
            </span>
          </div>
          <h2 ref={titleRef} className="font-heading text-4xl md:text-6xl lg:text-7xl text-[var(--color-primary-text)] tracking-widest uppercase">
            WEAPONS OF <br />
            <span className="text-(--color-japan-red) font-onari font-normal tracking-normal">MASTERY</span>
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 auto-rows-[220px] md:auto-rows-[260px] gap-4 md:gap-6 pb-6 md:pb-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          
          {/* 1. HUGE FEATURE - Dark Mode */}
          <div 
            ref={el => { if (el) cardsRef.current[0] = el; }}
            className="md:col-span-2 md:row-span-2 relative bg-[#111] group overflow-hidden flex flex-col justify-between p-6 md:p-8 border border-transparent hover:border-[var(--color-japan-red)] transition-colors duration-500 min-w-[85vw] md:min-w-0 shrink-0 snap-center"
          >
            <div className="absolute inset-0 bg-[url('/images/landscape-temple.png')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-14 h-14 bg-[var(--color-japan-red)] text-white flex items-center justify-center rounded-sm">
                <MonitorPlay className="w-7 h-7" />
              </div>
              <span className="text-8xl font-heading text-white opacity-10 select-none">学</span>
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-3">
                Core Program
              </div>
              <h3 className="font-heading text-4xl md:text-5xl text-white tracking-widest mb-6">
                COMPETITIVE<br/>LEADERBOARD
              </h3>
              <ul className="flex flex-col gap-3 max-w-sm">
                {["Live Ranking System", "Ronin to Shogun Path", "Dynamic Score Tracking"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 tracking-wider">
                    <ChevronRight className="w-4 h-4 text-[var(--color-japan-red)]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. SQUARE FEATURE - Pure White */}
          <div 
            ref={el => { if (el) cardsRef.current[1] = el; }}
            className="col-span-1 row-span-1 bg-white border border-[var(--color-borders)] group hover:border-[var(--color-japan-red)] transition-colors duration-500 p-6 flex flex-col relative overflow-hidden min-w-[85vw] md:min-w-0 shrink-0 snap-center"
          >
            {/* Background Image Blend */}
            <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.03] mix-blend-multiply group-hover:opacity-[0.06] transition-opacity duration-700"></div>
            <div className="absolute -right-4 -bottom-4 text-9xl font-heading text-[var(--color-primary-text)] opacity-[0.03] select-none group-hover:text-[var(--color-japan-red)] group-hover:opacity-[0.05] transition-colors duration-500 z-0">導</div>
            <Users className="w-8 h-8 text-[var(--color-secondary-text)] group-hover:text-[var(--color-japan-red)] transition-colors mb-auto relative z-10" />
            
            <div className="mt-8">
              <div className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-2">Platform</div>
              <h3 className="font-heading text-2xl text-[var(--color-primary-text)] tracking-widest mb-4">
                SMART<br/>JUDGE FLOW
              </h3>
              <p className="text-sm text-[var(--color-secondary-text)] leading-relaxed">
                Auto-assigned review queues and structured score rubrics.
              </p>
            </div>
          </div>

          {/* 3. SQUARE FEATURE - Japan Red Accent */}
          <div 
            ref={el => { if (el) cardsRef.current[2] = el; }}
            className="col-span-1 row-span-1 bg-[var(--color-japan-red)] border border-transparent group p-6 flex flex-col relative overflow-hidden text-white min-w-[85vw] md:min-w-0 shrink-0 snap-center"
          >
            <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute -right-4 -bottom-4 text-9xl font-heading text-black opacity-10 select-none">掟</div>
            
            <Code className="w-8 h-8 text-white/80 group-hover:text-white transition-colors mb-auto relative z-10" />
            
            <div className="mt-8 relative z-10">
              <div className="text-[10px] font-bold tracking-[0.25em] text-white/70 uppercase mb-2">Collaboration</div>
              <h3 className="font-heading text-2xl text-white tracking-widest mb-4">
                TEAM<br/>WORKFLOWS
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Join by code, manage roles, and collaborate on challenges together.
              </p>
            </div>
          </div>

          {/* 4. WIDE FEATURE - Light Theme */}
          <div 
            ref={el => { if (el) cardsRef.current[3] = el; }}
            className="col-span-1 md:col-span-2 row-span-1 bg-white border border-[var(--color-borders)] group hover:border-[var(--color-primary-text)] transition-colors duration-500 p-6 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden min-w-[85vw] md:min-w-0 shrink-0 snap-center"
          >
            {/* Background Image Blend */}
            <div className="absolute inset-0 bg-[url('/images/landscape-temple.png')] bg-cover bg-center opacity-[0.02] mix-blend-multiply group-hover:opacity-[0.05] transition-opacity duration-700"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-heading text-[var(--color-primary-text)] opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500 z-0">進</div>
            
            <div className="flex flex-col relative z-10">
              <div className="w-12 h-12 rounded-full border border-[var(--color-borders)] group-hover:border-[var(--color-primary-text)] flex items-center justify-center mb-6 transition-colors duration-500 text-[var(--color-primary-text)]">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-2">Management</div>
              <h3 className="font-heading text-3xl text-[var(--color-primary-text)] tracking-widest">
                FULL-STACK ADMINISTRATION
              </h3>
            </div>
            
            <div className="mt-6 md:mt-0 relative z-10 w-full md:w-auto">
              <ul className="flex flex-col gap-3">
                {["Full CRUD Operations", "Real-Time Activity Feed", "Audit Logging & Metrics"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-[var(--color-secondary-text)] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[var(--color-japan-red)] block"></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. SQUARE FEATURE - Off White */}
          <div 
            ref={el => { if (el) cardsRef.current[4] = el; }}
            className="col-span-1 row-span-1 bg-[var(--color-card-bg)] border border-[var(--color-borders)] group hover:border-[var(--color-japan-red)] transition-colors duration-500 p-6 flex flex-col relative overflow-hidden min-w-[85vw] md:min-w-0 shrink-0 snap-center"
          >
            {/* Background Image Blend */}
            <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.03] mix-blend-multiply group-hover:opacity-[0.06] transition-opacity duration-700"></div>
            <div className="absolute -right-4 -bottom-4 text-9xl font-heading text-[var(--color-primary-text)] opacity-[0.03] select-none group-hover:text-[var(--color-japan-red)] transition-colors duration-500 z-0">証</div>
            <Award className="w-8 h-8 text-[var(--color-secondary-text)] group-hover:text-[var(--color-japan-red)] transition-colors mb-auto relative z-10" />
            
            <div className="mt-8">
              <div className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-2">Onboarding</div>
              <h3 className="font-heading text-2xl text-[var(--color-primary-text)] tracking-widest mb-4">
                GITHUB<br/>INTEGRATION
              </h3>
              <p className="text-sm text-[var(--color-secondary-text)] leading-relaxed">
                One-click OAuth authentication and repository submissions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
