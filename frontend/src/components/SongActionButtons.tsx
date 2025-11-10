'use client';

import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';

interface SongActionButtonsProps {
  onReAnalyzeClick: () => void;
  isReAnalyzing?: boolean;
}

export default function SongActionButtons({ onReAnalyzeClick, isReAnalyzing = false }: SongActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 sm:gap-[22px] mt-6 lg:mt-8">
      {/* Re-analyze Button */}
      <button
        onClick={onReAnalyzeClick}
        disabled={isReAnalyzing}
        className="flex justify-center items-center gap-2 sm:gap-[22px] h-12 sm:h-[60px] px-4 sm:px-[19px] py-3 sm:py-4 rounded-xl sm:rounded-[14px] border border-[rgba(123,97,255,0.51)] bg-transparent text-[#7B61FF] hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base flex-shrink-0"
      >
        {isReAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
      </button>

      {/* One more song Button */}
      <button
        onClick={() => router.push('/')}
        className="flex justify-center items-center gap-2 sm:gap-[22px] px-4 sm:px-[19px] py-3 sm:py-4 rounded-xl sm:rounded-[14px] bg-[#7B61FF] text-white hover:bg-[#6B51EF] transition-colors cursor-pointer border-none whitespace-nowrap text-sm sm:text-base flex-1 sm:flex-initial"
      >
        <Music className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={2.33333} />
        <span className="hidden sm:inline">One more song? Let&apos;s go!</span>
        <span className="sm:hidden">One more song</span>
      </button>
    </div>
  );
}

