"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const levels = [
  {
    level: "I",
    title: "RONIN",
    subtitle: "The Wanderer",
    kanji: "浪人",
    image: "/ronin.png",
  },
  {
    level: "II",
    title: "KENSHI",
    subtitle: "The Blade",
    kanji: "剣士",
    image: "/kenshi.png",
  },
  {
    level: "III",
    title: "SAMURAI",
    subtitle: "The Warrior",
    kanji: "侍",
    image: "/samurai.png",
  },
  {
    level: "IV",
    title: "SHOGUN",
    subtitle: "The Master",
    kanji: "将軍",
    image: "/shogun.png",
  }
];

export default function Levels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=500", // Requires 2500px of scrolling to complete the animation
          pin: true,
          scrub: 1, // Smooth scrubbing effect (1 second lag)
        }
      });

      // 1. Heading fades and slides in
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      // 2. Cards come in one by one
      tl.fromTo(
        cardsRef.current,
        { opacity: 0, y: 100, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1, 
          stagger: 0.8, // Delay between each card's appearance
          ease: "back.out(1.2)" 
        },
        "+=0.2" // Slight delay after heading
      );
      
      // 3. Add a small pause at the end before unpinning
      tl.to({}, { duration: 0.5 });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
<<<<<<< Updated upstream
    <section id="levels" ref={containerRef} className="py-32 bg-(--color-off-white) relative z-20">
      <div className="max-w-360 w-full mx-auto px-12 md:px-24">
        
        {/* Section Title */}
        <div className="text-center mb-24 flex flex-col items-center">
          <h2 ref={titleRef} className="font-heading text-3xl md:text-5xl text-(--color-primary-text) tracking-widest whitespace-nowrap overflow-hidden">
            THE 4 LEVELS OF <span className="text-(--color-japan-red)">MASTERY</span>
=======
    <section id="levels" ref={containerRef} className="min-h-screen flex flex-col justify-center py-12 md:py-20 bg-[var(--color-off-white)] relative z-10 border-b border-[var(--color-borders)] overflow-hidden">
      {/* Background Image Blend */}
      <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>
      
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
          <h2 ref={titleRef} className="font-heading text-3xl md:text-5xl text-[var(--color-primary-text)] tracking-widest px-4 md:px-0">
            THE 4 LEVELS OF <span className="text-[var(--color-japan-red)]">MASTERY</span>
>>>>>>> Stashed changes
          </h2>
          <div className="w-12 h-[1px] bg-[var(--color-japan-red)] mt-6"></div>
        </div>

        {/* Levels Grid - Minimalist UI */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 sm:pb-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {levels.map((level, i) => (
            <div 
              key={level.title}
              ref={el => { if (el) cardsRef.current[i] = el; }}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border border-[var(--color-borders)] transition-all duration-500 hover:border-[var(--color-japan-red)] overflow-hidden min-w-[85vw] sm:min-w-0 shrink-0 snap-center"
            >
              {/* Background Kanji Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                <span className="text-9xl font-heading text-[var(--color-primary-text)] select-none">
                  {level.kanji}
                </span>
              </div>
              
              {/* Vertical Level Number (Japanese Editorial Style) */}
              <div className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-[var(--color-secondary-text)] opacity-50 [writing-mode:vertical-rl] group-hover:text-[var(--color-japan-red)] group-hover:opacity-100 transition-colors duration-500">
                LEVEL {level.level}
              </div>

              {/* Circular Avatar */}
              <div className="relative w-28 h-28 mb-6 rounded-full border border-[var(--color-borders)] p-1 group-hover:border-[var(--color-japan-red)] transition-colors duration-500 z-10 bg-white">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--color-off-white)]">
                  <Image
                    src={level.image}
                    alt={level.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0"
                  />
                </div>
              </div>
              
              {/* Typographic Core */}
              <div className="text-center relative z-10">
                <h3 className="font-onari text-2xl tracking-widest text-[var(--color-primary-text)] mb-2 group-hover:text-[var(--color-japan-red)] transition-colors duration-500">
                  {level.title}
                </h3>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-[1px] bg-[var(--color-secondary-text)] opacity-50"></span>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[var(--color-secondary-text)] uppercase">
                    {level.subtitle}
                  </span>
                  <span className="w-3 h-[1px] bg-[var(--color-secondary-text)] opacity-50"></span>
                </div>
              </div>
              
              {/* Bottom Right Kanji Accent */}
              <div className="absolute bottom-4 right-4 text-xs font-heading text-[var(--color-japan-red)] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {level.kanji}
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}

