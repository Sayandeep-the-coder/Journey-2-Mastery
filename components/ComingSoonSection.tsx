"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Swords, Scroll, Trophy, Award, Medal, UserCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ComingSoonSection({ 
  id, 
  title 
}: { 
  id: string, 
  title: string 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    // Title reveal animation
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
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

    // Subtle pulse for Coming Soon
    gsap.to(overlayRef.current, {
      opacity: 0.9,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id={id} className="py-24 bg-(--color-off-white) relative z-20 overflow-hidden">
      <div className="max-w-360 w-full mx-auto px-12 md:px-24">
        
        {/* Section Title */}
        <div className="mb-16">
          <h2 ref={titleRef} className="font-heading text-4xl text-(--color-primary-text) tracking-widest uppercase">
            {title}
          </h2>
        </div>

        {/* Coming Soon Area */}
        <div ref={containerRef} className="relative h-96 w-full rounded-sm overflow-hidden group cursor-not-allowed">
          
          {/* Card Mock Content */}
          <div 
            ref={contentRef}
            className="absolute inset-0 bg-(--color-card-bg) border border-(--color-borders) scale-105"
            style={{ filter: "blur(12px)" }}
          >
            {/* Abstract shapes to look like content when blurred */}
            <div className="grid grid-cols-3 gap-8 p-12 h-full opacity-50">
              <div className="bg-(--color-secondary-bg) w-full h-full rounded-sm"></div>
              <div className="bg-(--color-secondary-bg) w-full h-full rounded-sm"></div>
              <div className="bg-(--color-secondary-bg) w-full h-full rounded-sm"></div>
            </div>
          </div>

          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[var(--color-off-white)]/40 backdrop-blur-[1px]">
            <span 
              ref={overlayRef}
              className="font-heading text-5xl md:text-7xl text-(--color-japan-red) tracking-[0.2em] font-light mix-blend-multiply"
            >
              COMING SOON
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[var(--color-secondary-text)] uppercase mt-2">
              DETAILS TO BE REVEALED
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}

