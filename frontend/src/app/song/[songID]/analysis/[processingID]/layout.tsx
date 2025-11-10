import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ songID: string; processingID: string }> }
): Promise<Metadata> {
  let songID: string;
  let processingID: string;
  
  try {
    const resolvedParams = await params;
    songID = resolvedParams.songID;
    processingID = resolvedParams.processingID;
  } catch {
    // If params resolution fails, return default metadata
    return {
      title: 'Song Lyrics Translation & Analysis | MUSE MUSIC',
      description: 'Discover song lyrics translation, meaning analysis, and mood interpretation. Translate lyrics to Thai, English, Japanese, and Korean.',
      keywords: ['song lyrics', 'lyrics translation', 'song meaning', 'mood analysis', 'music translation', 'Thai lyrics', 'English lyrics'],
    };
  }

  // Default metadata
  const defaultMetadata: Metadata = {
    title: 'Song Lyrics Translation & Analysis | MUSE MUSIC',
    description: 'Discover song lyrics translation, meaning analysis, and mood interpretation. Translate lyrics to Thai, English, Japanese, and Korean.',
    keywords: ['song lyrics', 'lyrics translation', 'song meaning', 'mood analysis', 'music translation', 'Thai lyrics', 'English lyrics'],
  };

  if (!processingID || processingID === 'undefined' || !songID || songID === 'undefined') {
    return defaultMetadata;
  }

  // Don't call API in generateMetadata to avoid production errors
  // Metadata will be set dynamically on client side via JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://musemusic.phitik.com';
  const pageUrl = `${siteUrl}/song/${songID}/analysis/${processingID}`;

  return {
    ...defaultMetadata,
    openGraph: {
      type: 'music.song',
      title: defaultMetadata.title as string,
      description: defaultMetadata.description as string,
      url: pageUrl,
      siteName: 'MUSE MUSIC',
      images: [
        {
          url: `${siteUrl}/images/cover.jpg`,
          width: 1200,
          height: 630,
          alt: 'MUSE MUSIC',
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultMetadata.title as string,
      description: defaultMetadata.description as string,
      images: [`${siteUrl}/images/cover.jpg`],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default function SongAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

