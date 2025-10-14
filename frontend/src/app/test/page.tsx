'use client';

import React from 'react';
import { Languages, SmilePlus } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 bg-white min-h-screen">
      {/* ส่วนหัว */}
      <div className="mt-12 mb-10 text-center px-4">
        <p className="mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
          Discover the soul of music!
        </p>
        <p className="text-xs xs:text-base leading-relaxed text-gray-700">
          Ever heard a song and thought, “What does this even mean?” or “Why does this hit me right in the feels?”<br />
          At MUSE MUSIC, we’re all about decoding the lyrics, uncovering hidden meanings, and capturing the mood behind every beat.<br />
          Whether it’s heartbreak, hype, or just plain weird — we’ve got you.
        </p>
      </div>


      {/* search bar */}
      <div className="w-full max-w-[640px] mx-auto mt-4 px-4">
        <div className="relative w-full h-[60px]">
          <input
            type="text"
            placeholder="Search song by name, artist, etc."
            className="w-full h-full px-6 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-sm rounded-xl"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              className="h-6 w-6 text-[#8A73FF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Analyze Menu */}
      <div className="flex flex-wrap gap-4 p-4 w-full max-w-[640px] mx-auto">

        <div className="flex-1 min-w-[280px] bg-gray-100 rounded-xl flex items-center justify-between gap-2 p-4">
          <p className="text-violet-600 text-sm sm:text-base">Translate to understand</p>
          <Languages className="text-violet-600 w-6 h-6" />
        </div>

        <div className="flex-1 min-w-[280px] bg-gray-100 rounded-xl flex items-center justify-between gap-2 p-4">
          <p className="text-violet-600 text-sm sm:text-base">Check the Mood</p>
          <SmilePlus className="text-violet-600 w-6 h-6" />
        </div>
      </div>

      {/* Analyze Button */}

    </div>
  );
}
