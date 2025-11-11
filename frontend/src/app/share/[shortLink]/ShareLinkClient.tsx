'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import shareService from '@/services/shareService';
import toast from 'react-hot-toast';

export default function ShareLinkClient({ shortLink }: { shortLink: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!shortLink || shortLink === 'undefined') {
        toast.error('Invalid share link');
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const processing = await shareService.getProcessingByShortLink(shortLink);

        if (!processing || !processing.songID || !processing.processingID) {
          toast.error('Share link not found or invalid');
          router.push('/');
          return;
        }

        router.push(`/song/${processing.songID}?processingID=${processing.processingID}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load share link');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchAndRedirect();
  }, [shortLink, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading share link...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Redirecting...</h1>
            <p className="text-gray-600">Please wait while we redirect you.</p>
          </>
        )}
      </div>
    </div>
  );
}


