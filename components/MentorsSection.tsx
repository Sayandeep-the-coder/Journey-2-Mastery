"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Mentor {
  name: string;
  role: string;
  kanji: string;
  image: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

const mentors: Mentor[] = [
  {
    name: "Sayan Chaterjee",
    role: "Software Engineer & Mentor",
    kanji: "師",
    image: "/Judges-img/sayan.png",
    socials: { 
      github: "https://github.com/sayanChaterjee", 
      linkedin: "https://www.linkedin.com/in/sayan-chatterjee-devch/", 
      twitter: "https://x.com/devch_sayan" 
    },
  },
  {
    name: "Shatakshi Saha",
    role: "Mentor",
    kanji: "創",
    image: "/Judges-img/shatakshi.png",
    socials: { 
      github: "https://github.com/ShatakshiSaha19", 
      linkedin: "https://www.linkedin.com/in/shatakshisaha", 
      twitter: "https://x.com/ShatakshiSahaa" 
    },
  },
  {
    name: "Ananya Ghosh",
    role: "Mentor",
    kanji: "基",
    image: "/Judges-img/ananya.png",
    socials: { 
      github: "https://github.com/Ananya9304", 
      linkedin: "https://www.linkedin.com/in/ananya-ghosh-014b00290", 
      twitter: "https://x.com/AnanyaGhos57680" 
    },
  },
  {
    name: "Ishita Mukherjee",
    role: "Mentor",
    kanji: "美",
    image: "/Judges-img/ishita.png",
    socials: { 
      github: "https://github.com/Ishitamukherjee2004", 
      linkedin: "https://www.linkedin.com/in/ishita-mukherjee/", 
      twitter: "https://x.com/IshitaM01204933" 
    },
  },
  {
    name: "Md Kaif Sardar",
    role: "Full stack developer & Mentor",
    kanji: "知",
    image: "/Judges-img/kaif.jpg",
    socials: { 
      github: "https://github.com/MdKaifSardar/", 
      linkedin: "https://www.linkedin.com/in/md-kaif-sardar-12aab4290/", 
      twitter: "https://x.com/Haha00234" 
    },
  }

];

export default function MentorsSection() {
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
        stagger: 0.15,
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
    <section id="mentors" ref={containerRef} className="py-20 md:py-28 bg-[var(--color-off-white)] relative z-20 border-b border-[var(--color-borders)] overflow-hidden">
      {/* Background Image Blend */}
      <div className="absolute inset-0 bg-[url('/images/bamboo-bg.png')] bg-cover bg-center opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>
      
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-[var(--color-japan-red)] uppercase mb-3">
            <span className="w-4 h-[1px] bg-[var(--color-japan-red)]"></span>
            INDUSTRY MASTERS
            <span className="w-4 h-[1px] bg-[var(--color-japan-red)]"></span>
          </div>
          <h2 ref={titleRef} className="font-heading text-3xl md:text-5xl text-[var(--color-primary-text)] tracking-widest uppercase">
            HONORED <span className="text-(--color-japan-red) font-onari font-normal tracking-normal">MENTORS</span>
          </h2>
        </div>

        {/* Mentors Grid - Seamless Infinite Marquee */}
        <div className="relative w-full overflow-hidden flex gap-6 pb-6 group [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] pause-on-hover">
          <div className="flex gap-6 animate-marquee min-w-max">
            {mentors.map((mentor, i) => (
              <div
                key={`a-${mentor.name}`}
                ref={el => { if (el) cardsRef.current[i] = el; }}
                className="group/card relative flex flex-col items-center justify-center p-8 bg-white border border-[var(--color-borders)] hover:border-[var(--color-japan-red)] transition-all duration-500 overflow-hidden w-[85vw] sm:w-[320px] shrink-0"
              >
                {/* Background Kanji Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-700">
                  <span className="text-9xl font-heading text-[var(--color-primary-text)] select-none">
                    {mentor.kanji}
                  </span>
                </div>

                {/* Circular Avatar */}
                <div className="relative w-24 h-24 mb-6 rounded-full border border-[var(--color-borders)] p-1 group-hover/card:border-[var(--color-japan-red)] transition-colors duration-500 z-10 bg-white">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--color-off-white)]">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      fill
                      className="object-cover object-top group-hover/card:scale-110 transition-transform duration-700 ease-out grayscale group-hover/card:grayscale-0"
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <div className="text-center relative z-10 w-full mb-6">
                  <h3 className="font-heading text-xl md:text-2xl tracking-wider text-[var(--color-primary-text)] mb-1 group-hover/card:text-[var(--color-japan-red)] transition-colors">
                    {mentor.name}
                  </h3>
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-secondary-text)] uppercase">
                    {mentor.role}
                  </div>
                </div>

                {/* Social Links Minimalist */}
                <div className="flex items-center gap-4 relative z-10 border-t border-[var(--color-borders)] pt-4 w-12 justify-center group-hover/card:w-full group-hover/card:border-[var(--color-japan-red)] transition-all duration-500">
                  <a href={mentor.socials.github} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" /></svg>
                  </a>
                  <a href={mentor.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45 1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45Z" /></svg>
                  </a>
                  <a href={mentor.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6 animate-marquee min-w-max" aria-hidden="true">
            {mentors.map((mentor, i) => (
              <div
                key={`b-${mentor.name}`}
                ref={el => { if (el) cardsRef.current[i + mentors.length] = el; }}
                className="group/card relative flex flex-col items-center justify-center p-8 bg-white border border-[var(--color-borders)] hover:border-[var(--color-japan-red)] transition-all duration-500 overflow-hidden w-[85vw] sm:w-[320px] shrink-0"
              >
                {/* Background Kanji Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-700">
                  <span className="text-9xl font-heading text-[var(--color-primary-text)] select-none">
                    {mentor.kanji}
                  </span>
                </div>

                {/* Circular Avatar */}
                <div className="relative w-24 h-24 mb-6 rounded-full border border-[var(--color-borders)] p-1 group-hover/card:border-[var(--color-japan-red)] transition-colors duration-500 z-10 bg-white">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--color-off-white)]">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      fill
                      className="object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out grayscale group-hover/card:grayscale-0"
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <div className="text-center relative z-10 w-full mb-6">
                  <h3 className="font-heading text-xl md:text-2xl tracking-wider text-[var(--color-primary-text)] mb-1 group-hover/card:text-[var(--color-japan-red)] transition-colors">
                    {mentor.name}
                  </h3>
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-secondary-text)] uppercase">
                    {mentor.role}
                  </div>
                </div>

                {/* Social Links Minimalist */}
                <div className="flex items-center gap-4 relative z-10 border-t border-[var(--color-borders)] pt-4 w-12 justify-center group-hover/card:w-full group-hover/card:border-[var(--color-japan-red)] transition-all duration-500">
                  <a href={mentor.socials.github} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" /></svg>
                  </a>
                  <a href={mentor.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45 1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45Z" /></svg>
                  </a>
                  <a href={mentor.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
