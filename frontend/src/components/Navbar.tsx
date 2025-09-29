'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-[100px]">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <Image 
                src="/icons/music-icon.svg" 
                alt="Music Icon" 
                width={24} 
                height={24} 
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              
              <span className="text-lg md:text-2xl font-bold text-black tracking-wider">
                MUSE MUSIC
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              style={{ fontSize: '17px' }}
            >
              Home
            </Link>
            <Link 
              href="/for-you" 
              className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              style={{ fontSize: '17px' }}
            >
              For you
            </Link>
            <Link 
              href="/archive" 
              className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              style={{ fontSize: '17px' }}
            >
              Archive
            </Link>
            <Link 
              href="/login"
              className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ width: '142px', height: '48px' }}
            >
              <span>Sign up</span>
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                viewBox="0 0 29 28"
              >
                <path d="M14.5 15.1667C17.7216 15.1667 20.3333 12.555 20.3333 9.33333C20.3333 6.11167 17.7216 3.5 14.5 3.5C11.2783 3.5 8.66663 6.11167 8.66663 9.33333C8.66663 12.555 11.2783 15.1667 14.5 15.1667Z"/>
                <path d="M23.8333 24.5C23.8333 22.0246 22.85 19.6507 21.0996 17.9003C19.3493 16.15 16.9753 15.1667 14.5 15.1667C12.0246 15.1667 9.65064 16.15 7.9003 17.9003C6.14996 19.6507 5.16663 22.0246 5.16663 24.5"/>
              </svg>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B61FF] transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg 
              className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-opacity duration-200`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg 
              className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-opacity duration-200`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
            <Link 
              href="/" 
              className="block px-3 py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/for-you" 
              className="block px-3 py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              For you
            </Link>
            <Link 
              href="/archive" 
              className="block px-3 py-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Archive
            </Link>
            
            <div className="pt-2">
              <Link 
                href="/login"
                className="block w-full bg-[#7B61FF] hover:bg-[#6B51EF] text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 py-3 px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Sign up</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.75" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  viewBox="0 0 29 28"
                >
                  <path d="M14.5 15.1667C17.7216 15.1667 20.3333 12.555 20.3333 9.33333C20.3333 6.11167 17.7216 3.5 14.5 3.5C11.2783 3.5 8.66663 6.11167 8.66663 9.33333C8.66663 12.555 11.2783 15.1667 14.5 15.1667Z"/>
                  <path d="M23.8333 24.5C23.8333 22.0246 22.85 19.6507 21.0996 17.9003C19.3493 16.15 16.9753 15.1667 14.5 15.1667C12.0246 15.1667 9.65064 16.15 7.9003 17.9003C6.14996 19.6507 5.16663 22.0246 5.16663 24.5"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}