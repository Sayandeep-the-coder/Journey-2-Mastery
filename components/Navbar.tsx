"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession } from "@/hooks/useSession";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: user } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = ["HOME", "OVERVIEW", "LEVELS", "TIMELINE", "PRIZES", "FAQ", "CONTACT"];

  return (
    <nav
      className={twMerge(
        clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out py-4 md:py-6",
          scrolled || mobileMenuOpen ? "bg-(--color-off-white) shadow-sm" : "bg-transparent"
        )
      )}
    >
      <div className="max-w-360 w-full mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-(--color-japan-red) flex items-center justify-center text-white shrink-0">
            <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M12 4v16"/><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs tracking-[0.2em] text-(--color-secondary-text) leading-tight">JOURNEY TO</span>
            <span className="font-heading text-lg md:text-xl tracking-wider text-(--color-japan-red) font-semibold leading-tight">MASTERY</span>
          </div>
        </div>

        {/* Desktop Links and CTA */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={clsx(
                "text-xs tracking-widest font-medium transition-colors hover:text-(--color-japan-red) relative group",
                i === 0 ? "text-(--color-japan-red)" : "text-(--color-primary-text)"
              )}
            >
              {link}
              {i === 0 && (
                <span className="absolute -bottom-2 left-0 w-full h-px bg-(--color-japan-red)"></span>
              )}
              {i !== 0 && (
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-(--color-japan-red) transition-all duration-300 group-hover:w-full"></span>
              )}
            </a>
          ))}

          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-5 py-2 border border-(--color-japan-red) bg-(--color-japan-red) text-white hover:bg-transparent hover:text-(--color-japan-red) text-xs tracking-widest font-medium transition-all duration-300 rounded-sm"
          >
            {user ? "DASHBOARD" : "LOGIN"}
          </Link>
        </div>

        {/* Mobile Menu Toggle & CTA */}
        <div className="flex lg:hidden items-center gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-4 py-2 border border-(--color-japan-red) bg-(--color-japan-red) text-white hover:bg-transparent hover:text-(--color-japan-red) text-[10px] md:text-xs tracking-widest font-medium transition-all duration-300 rounded-sm"
          >
            {user ? "DASHBOARD" : "LOGIN"}
          </Link>
          <button 
            className="text-(--color-primary-text) focus:outline-none p-1" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 h-[100vh] bg-(--color-off-white) pt-8 px-6 md:px-12 flex flex-col items-start gap-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "text-lg tracking-widest font-medium w-full border-b border-(--color-borders) pb-4",
                i === 0 ? "text-(--color-japan-red)" : "text-(--color-primary-text)"
              )}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
