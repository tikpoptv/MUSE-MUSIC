import type { Metadata } from 'next';
import ShareLinkClient from './ShareLinkClient';

type Props = {
  params: Promise<{ shortLink: string }>;
};

async function fetchProcessing(shortLink: string) {
  try {
    // Prefer relative fetch (Next can resolve it on server), fallback to absolute env if provided
    const endpoint =
      (process.env.NEXT_PUBLIC_FRONTEND_URL
        ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/share/${shortLink}`
        : `/api/share/${shortLink}`);
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.processing ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortLink } = await params;
  const processing = await fetchProcessing(shortLink);

  const titleBase = 'MUSE MUSIC';
  const title =
    (processing?.songName && processing?.artistName)
      ? `${processing.songName} - ${processing.artistName} | ${titleBase}`
      : (processing?.songName ? `${processing.songName} | ${titleBase}` : titleBase);

  const description =
    processing?.summary && processing.summary.trim().length > 0
      ? processing.summary
      : 'Discover lyrics meanings, moods, and translations — MUSE MUSIC';

  // Get metadataBase from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://musemusic.phitik.com';
  
  // Ensure imageUrl is absolute URL for Facebook Open Graph
  let imageUrl = '/images/cover.jpg';
  if (processing?.coverImage) {
    if (processing.coverImage.startsWith('http')) {
      imageUrl = processing.coverImage;
    } else {
      // If relative path, make it absolute
      imageUrl = processing.coverImage.startsWith('/') 
        ? `${baseUrl}${processing.coverImage}`
        : `${baseUrl}/${processing.coverImage}`;
    }
  } else {
    imageUrl = `${baseUrl}/images/cover.jpg`;
  }

  // Ensure URL is absolute for Open Graph
  const url = `${baseUrl}/share/${shortLink}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url, // Use absolute URL
      siteName: 'MUSE MUSIC',
      images: [{ 
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ShareLinkPage({ params }: Props) {
  const { shortLink } = await params;
  return <ShareLinkClient shortLink={shortLink} />;
}

