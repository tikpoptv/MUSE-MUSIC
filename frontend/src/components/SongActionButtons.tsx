'use client';

import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';

export default function SongActionButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full" style={{ gap: '22px' }}>
      {/* Re-analyze Button */}
      <button
        style={{
          display: 'flex',
          height: '60px',
          padding: '16px 19px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '22px',
          flexShrink: 0,
          borderRadius: '14px',
          border: '1px solid rgba(123, 97, 255, 0.51)',
          background: 'transparent',
          color: '#7B61FF',
          cursor: 'pointer'
        }}
        className="hover:bg-purple-50 transition-colors"
      >
        Re-analyze
      </button>

      {/* One more song Button */}
      <button
        onClick={() => router.push('/')}
        style={{
          display: 'flex',
          padding: '16px 19px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '22px',
          borderRadius: '14px',
          background: '#7B61FF',
          color: 'white',
          cursor: 'pointer',
          border: 'none',
          whiteSpace: 'nowrap'
        }}
        className="hover:bg-[#6B51EF] transition-colors"
      >
        <Music className="h-7 w-7" strokeWidth={2.33333} />
        <span>One more song? Let&apos;s go!</span>
      </button>
    </div>
  );
}

