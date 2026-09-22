"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Heart, Globe } from "lucide-react";

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
      { label: "Instagram", href: "https://www.instagram.com/dc_kgec/", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/dc-kgec/", external: true },
      { label: "Website", href: "https://dc.kgec.tech/", external: true },
    ],
    resources: [
      { label: "Level 1: Foundation Docs", href: "#", external: true },
      { label: "Level 2: Development Docs", href: "#", external: true },
      { label: "Level 3: Execution Docs", href: "#", external: true },
      { label: "Level 4: Mastery Docs", href: "#", external: true },
      { label: "Connect with Mentors", href: "#mentors" }      
    ],
  };

  return (
    <footer className="bg-(--color-off-white) pt-24 pb-12 border-t border-(--color-borders) relative z-20">
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Main Footer Content */}
        <div className="flex flex-col xl:grid xl:grid-cols-12 gap-12 xl:gap-8 pb-16 border-b border-(--color-borders)">
          
          {/* Col 1: Brand */}
          <div className="xl:col-span-4 flex flex-col items-center xl:items-start">
            <a href="https://dc.kgec.tech/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-6 group">
              <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <img src="/j2m-logo.png" alt="J2M Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] leading-none tracking-[0.2em] text-(--color-secondary-text) mb-1 uppercase group-hover:text-(--color-japan-red) transition-colors">Journey To</span>
                <span className="font-onari text-2xl leading-none tracking-widest text-(--color-japan-red) font-normal uppercase">Mastery</span>
              </div>
            </a>
            <p className="text-(--color-secondary-text) text-sm max-w-xs text-center xl:text-left mb-6">
              Empowering developers to build, launch, and impact the world.
            </p>
          </div>

          {/* Links Grid Wrapper for Mobile */}
          <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 w-full">
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
              href="https://www.instagram.com/dc_kgec/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M7.75 2h8.5A5.757 5.757 0 0 1 22 7.75v8.5A5.757 5.757 0 0 1 16.25 22h-8.5A5.757 5.757 0 0 1 2 16.25v-8.5A5.757 5.757 0 0 1 7.75 2zm0 1.5A4.255 4.255 0 0 0 3.5 7.75v8.5A4.255 4.255 0 0 0 7.75 20.5h8.5a4.255 4.255 0 0 0 4.25-4.25v-8.5A4.255 4.255 0 0 0 16.25 3.5h-8.5zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-2.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/company/dc-kgec/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45 1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45Z" />
              </svg>
            </a>

            <a
              href="https://dc.kgec.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-(--color-card-bg) border border-(--color-borders) flex items-center justify-center text-(--color-secondary-text) hover:text-(--color-japan-red) hover:border-(--color-japan-red) transition-colors shadow-2xs"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
