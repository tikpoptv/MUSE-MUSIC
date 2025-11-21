'use client';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeAPIPromise: Promise<void> | null = null;

export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (youtubeAPIPromise) {
    return youtubeAPIPromise;
  }

  youtubeAPIPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });

  return youtubeAPIPromise;
}

