'use client';

import React from 'react';
import Image from 'next/image';

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitLayout({ left, right }: SplitLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#F7F3EE] overflow-x-hidden text-[#111111] font-sans selection:bg-[#B93A32] selection:text-white flex items-center justify-center py-6 lg:py-12">
      {/* Paper Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      />

      {/* Background Artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-end">
        <div className="relative w-full lg:w-[65%] h-full">
          <Image
            src="/images/journey-landscape.png"
            alt="Japanese Landscape"
            fill
            className="object-cover lg:object-contain object-right-bottom lg:object-right opacity-90 mix-blend-multiply pointer-events-none"
            priority
          />
          {/* Gradient overlay to blur left side into background */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#F7F3EE] via-[#F7F3EE]/80 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* Japanese Vertical Text */}
      <div className="absolute right-8 top-20 z-10 hidden lg:flex flex-col items-center gap-6 pointer-events-none select-none">
        <div
          className="text-[#8A2722] text-xl tracking-[0.3em] font-serif opacity-80"
          style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
        >
          開発者の道
        </div>
        {/* Seal Stamp */}
        <div className="w-8 h-8 border border-[#B93A32] text-[#B93A32] flex items-center justify-center rounded-sm opacity-80">
          <span className="font-serif text-sm">道</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-6 py-4 lg:py-8 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        {/* Left Side Content */}
        <div className="flex-1 w-full max-w-xl">
          {left}
        </div>

        {/* Right Side Independent Gesture-Scrollable Form Container */}
        <div
          data-lenis-prevent
          className="flex-1 w-full max-w-2xl bg-gradient-to-r from-[rgba(250,248,244,0.95)] to-[rgba(250,248,244,0.85)] backdrop-blur-md border border-[#D8D0C8] rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain"
        >
          {right}
        </div>
      </div>
    </div>
  );
}
