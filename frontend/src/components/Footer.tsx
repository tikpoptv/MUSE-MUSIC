'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer 
      className="w-full bg-[#3E1E68]"
    >
      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        {/* Main Content - Original Design: Right Aligned */}
        <div className="flex items-center justify-end min-h-[100px]">
          <div className="text-right">
            <h2 className="text-white text-2xl font-bold mb-2">
              MUSE MUSIC
            </h2>
            <p className="text-white text-sm">
              &ldquo;Because music means more than sound.&rdquo;
            </p>
          </div>
        </div>

        {/* Bottom - Links & Copyright */}
        <div className="border-t border-white/20 pt-4 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white text-xs opacity-75 text-center sm:text-left">
              © 2025 MUSE MUSIC. An educational project for CPE 334 Software Engineering at KMUTT.
            </p>
            <div className="flex gap-4 text-xs">
              <Link 
                href="/terms" 
                className="text-white hover:text-purple-200 transition-colors opacity-75 hover:opacity-100"
              >
                Terms of Service
              </Link>
              <Link 
                href="/privacy" 
                className="text-white hover:text-purple-200 transition-colors opacity-75 hover:opacity-100"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
