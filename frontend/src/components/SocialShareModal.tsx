'use client';

import { X, Facebook, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialShareModalProps {
  isOpen: boolean;
  shareUrl: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function SocialShareModal({ 
  isOpen, 
  shareUrl, 
  title = 'Check out this song!',
  description = '',
  onClose 
}: SocialShareModalProps) {
  if (!isOpen) return null;

  // Ensure absolute URL for social platforms
  const absoluteShareUrl = (() => {
    if (!shareUrl) return '';
    if (/^https?:\/\//i.test(shareUrl)) return shareUrl;
    const origin =
      (typeof window !== 'undefined' && window.location?.origin)
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_FRONTEND_URL || '');
    return `${origin}${shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`}`;
  })();

  const encodedUrl = encodeURIComponent(absoluteShareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // X (Twitter) Share URL
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${description ? `%20${encodedDescription}` : ''}`;

   const handleFacebookShare = () => {
    if (!absoluteShareUrl) {
      toast.error('No URL to share.');
      return;
    }

    if (absoluteShareUrl.includes('localhost') || absoluteShareUrl.includes('127.0.0.1')) {
      toast.error('Facebook cannot share localhost URLs. Please deploy to production first.');
      // eslint-disable-next-line no-console
      console.warn('Attempted to share localhost URL:', absoluteShareUrl);
      return;
    }

    try {
      // ใช้ Facebook Share Dialog แบบง่าย
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

      // เปิดใน popup
      const popup = window.open(
        facebookShareUrl, 
        'facebook-share', 
        'width=600,height=400,left=100,top=100,scrollbars=yes,resizable=yes'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // ถ้า popup ถูกบล็อก ให้เปิดใน tab ใหม่
        window.open(facebookShareUrl, '_blank');
      }
      
      toast.success('Opening Facebook share dialog...');

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Facebook share error:', error);
      toast.error('Failed to open Facebook sharing');
    }
  };

  const handleTwitterShare = () => {
    if (!absoluteShareUrl) {
      toast.error('No URL to share.');
      return;
    }
    window.open(twitterShareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(absoluteShareUrl);
    toast.success('Link copied to clipboard!');
  };

  // Debug ขณะพัฒนา - disabled for tests
  // if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  //   // eslint-disable-next-line no-console
  //   console.log({ shareUrl, absoluteShareUrl, twitterShareUrl });
  // }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Share to Social Media</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Social Media Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Facebook className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Facebook</span>
          </button>

          {/* X (Twitter) */}
          <button
            onClick={handleTwitterShare}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
          >
            <Twitter className="h-8 w-8 text-black mb-2" />
            <span className="text-sm font-medium text-gray-700">X (Twitter)</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-all"
          >
            <div className="h-8 w-8 flex items-center justify-center mb-2">
              <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Copy Link</span>
          </button>
        </div>

        {/* Share URL Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Share URL:</p>
          <p className="text-sm text-gray-700 break-all">{absoluteShareUrl}</p>
        </div>
      </div>
    </div>
  );
}

