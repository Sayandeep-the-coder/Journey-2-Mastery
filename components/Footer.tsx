"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Heart } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const sealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sealRef.current) return;

    gsap.fromTo(
      sealRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sealRef.current,
          start: "top 90%",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const footerLinks = {
    program: [
      { label: "Home", href: "#home" },
      { label: "4 Levels of Mastery", href: "#levels" },
      { label: "Quest Timeline", href: "#timeline" },
      { label: "Honored Mentors", href: "#mentors" },
      { label: "Honor & Prizes", href: "#prizes" },
      { label: "Warrior FAQ", href: "#faq" },
    ],
    community: [
      { label: "Dev Community", href: "https://dc.kgec.tech/", external: true },
      { label: "Discord Server", href: "https://dc.kgec.tech/", external: true },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "GitHub Repository", href: "https://github.com", external: true },
      { label: "Submission Guidelines", href: "#" },
    ],
    resources: [
      { label: "Starter Kits & Templates", href: "#" },
      { label: "Architecture Checklist", href: "#" },
      { label: "Pitch Deck Template", href: "#" },
      { label: "Office Hours Booking", href: "#mentors" },
      { label: "Code of Conduct", href: "#" },
    ],
  };

  return (
    <footer className="bg-(--color-off-white) pt-24 pb-12 border-t border-(--color-borders) relative z-20">
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-(--color-borders)">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start">
            <a href="https://dc.kgec.tech/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-(--color-borders) group-hover:border-(--color-japan-red) transition-colors">
                <img src="/logo.jpg" alt="Dev Community Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] leading-none tracking-[0.2em] text-(--color-secondary-text) mb-1 uppercase group-hover:text-(--color-japan-red) transition-colors">Dev</span>
                <span className="font-onari text-2xl leading-none tracking-widest text-(--color-japan-red) font-normal uppercase">Community</span>
              </div>
            </a>
            <p className="text-(--color-secondary-text) text-sm max-w-xs text-center md:text-left mb-6">
              Empowering developers to build, launch, and impact the world.
            </p>
            
            {/* Seal Stamp */}
            <div 
              ref={sealRef}
              className="flex items-center gap-3 mt-2"
            >
              <div className="border-2 border-(--color-dark-red) p-1.5 w-12 h-12 flex items-center justify-center text-(--color-dark-red) rounded-sm bg-white shadow-2xs">
                <span className="font-heading text-sm text-center leading-tight">魂<br/>決</span>
              </div>
              <div className="text-[10px] text-(--color-secondary-text) leading-tight">
                <span className="font-bold text-(--color-primary-text) uppercase block">Dojo Seal</span>
                Forged for builders
              </div>
            </div>
          </div>

          {/* Links Grid Wrapper for Mobile */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 w-full">
            {/* Col 2: Program */}
            <div className="col-span-1">
              <h4 className="font-heading text-sm text-(--color-primary-text) tracking-widest uppercase mb-5 flex items-center gap-2">
                <span>Program</span>
                <span className="w-1 h-1 rounded-full bg-(--color-japan-red)"></span>
              </h4>
              <ul className="flex flex-col gap-3">
              {footerLinks.program.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-xs text-(--color-secondary-text) hover:text-(--color-japan-red) transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            </div>

            {/* Col 3: Community */}
            <div className="col-span-1">
              <h4 className="font-heading text-sm text-(--color-primary-text) tracking-widest uppercase mb-5 flex items-center gap-2">
                <span>Community</span>
                <span className="w-1 h-1 rounded-full bg-(--color-japan-red)"></span>
              </h4>
              <ul className="flex flex-col gap-3">
              {footerLinks.community.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-xs text-(--color-secondary-text) hover:text-(--color-japan-red) transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                    {item.external && (
                      <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
            </div>

            {/* Col 4: Resources */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-heading text-sm text-(--color-primary-text) tracking-widest uppercase mb-5 flex items-center gap-2">
                <span>Resources</span>
                <span className="w-1 h-1 rounded-full bg-(--color-japan-red)"></span>
              </h4>
              <ul className="flex flex-col gap-3">
              {footerLinks.resources.map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-xs text-(--color-secondary-text) hover:text-(--color-japan-red) transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-(--color-secondary-text)">
          <p className="flex items-center gap-1 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Journey to Mastery. Built with</span>
            <Heart className="w-3.5 h-3.5 text-(--color-japan-red) fill-current inline" />
            <span>by Dev Community.</span>
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45 1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
