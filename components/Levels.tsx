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

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Main animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // Pin when section reaches top of viewport
          end: "+=1500", // Scroll for 1500px to complete animation
          pin: true,
          scrub: 1, // Smooth scrub
        }
      });

      // 1. Title reveal animation
      tl.fromTo(
        titleRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none"
        }
      );

      // 2. Cards reveal animation (Ronin, then Kenshi, etc)
      tl.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.5, // sequential stagger
          ease: "power2.out"
        }
      );
    }, containerRef);

    return () => mm.revert();
  }, []);

  return (
    <section id="levels" ref={containerRef} className="py-24 md:py-32 bg-(--color-off-white) relative z-10 border-b border-(--color-borders) overflow-hidden">
      {/* Background Image Blend */}
      <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>

      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">

        {/* Section Title */}
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <h2 ref={titleRef} className="font-heading text-2xl md:text-5xl text-(--color-primary-text) tracking-widest leading-tight px-4 md:px-0">
            THE 4 LEVELS OF <span className="text-(--color-japan-red) font-onari font-normal tracking-normal block md:inline mt-2 md:mt-0">MASTERY</span>
          </h2>
          <div className="w-12 h-px bg-(--color-japan-red) mt-6"></div>
        </div>

        {/* Levels Grid - Minimalist UI */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-8 snap-x snap-mandatory [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden -mx-6 px-6 md:-mx-12 md:px-12 lg:mx-0 lg:px-0">
          {levels.map((level, i) => (
            <div
              key={level.title}
              ref={el => { if (el) cardsRef.current[i] = el; }}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border border-(--color-borders) transition-all duration-500 hover:border-(--color-japan-red) overflow-hidden min-w-[85vw] sm:min-w-[320px] lg:min-w-0 shrink-0 snap-center"
            >
              {/* Background Kanji Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                <span className="text-9xl font-heading text-(--color-primary-text) select-none">
                  {level.kanji}
                </span>
              </div>

              {/* Vertical Level Number (Japanese Editorial Style) */}
              <div className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-(--color-secondary-text) opacity-50 [writing-mode:vertical-rl] group-hover:text-(--color-japan-red) group-hover:opacity-100 transition-colors duration-500">
                LEVEL {level.level}
              </div>

              {/* Circular Avatar */}
              <div className="relative w-28 h-28 mb-6 rounded-full border border-(--color-borders) p-1 group-hover:border-(--color-japan-red) transition-colors duration-500 z-10 bg-white">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-(--color-off-white)">
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
                <h3 className="font-onari text-2xl tracking-widest text-(--color-primary-text) mb-2 group-hover:text-(--color-japan-red) transition-colors duration-500">
                  {level.title}
                </h3>

                <div className="flex items-center justify-center gap-2">
                  <span className="w-3 h-px bg-(--color-secondary-text) opacity-50"></span>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-(--color-secondary-text) uppercase">
                    {level.subtitle}
                  </span>
                  <span className="w-3 h-px bg-(--color-secondary-text) opacity-50"></span>
                </div>
              </div>

              {/* Bottom Right Kanji Accent */}
              <div className="absolute bottom-4 right-4 text-xs font-heading text-(--color-japan-red) opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {level.kanji}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
