import type { Metadata } from 'next';
import { songService } from '@/services/songService';

const languageCodeToName: Record<string, string> = {
  'th': 'Thai',
  'en': 'English',
  'ja': 'Japanese',
  'ko': 'Korean',
  'English': 'English',
  'Thai': 'Thai',
  'Japanese': 'Japanese',
  'Korean': 'Korean'
};

export async function generateMetadata(
  { params }: { params: Promise<{ songID: string; processingID: string }> }
): Promise<Metadata> {
  const { songID, processingID } = await params;

  // Default metadata
  const defaultMetadata: Metadata = {
    title: 'Song Lyrics Translation & Analysis | MUSE MUSIC',
    description: 'Discover song lyrics translation, meaning analysis, and mood interpretation. Translate lyrics to Thai, English, Japanese, and Korean.',
    keywords: ['song lyrics', 'lyrics translation', 'song meaning', 'mood analysis', 'music translation', 'Thai lyrics', 'English lyrics'],
  };

  if (!processingID || processingID === 'undefined') {
    return defaultMetadata;
  }

  try {
    const data = await songService.getSongDetail(songID, processingID);
    const song = data.song;
    const processing = data.processing;

    if (!song || !processing) {
      return defaultMetadata;
    }

    const songName = song.songName || 'Unknown Song';
    const artistName = song.artistName || 'Unknown Artist';
    const targetLanguage = processing.targetLanguage 
      ? (languageCodeToName[processing.targetLanguage] || processing.targetLanguage)
      : 'Thai';
    const originalLanguage = processing.originalLanguage 
      ? (languageCodeToName[processing.originalLanguage] || processing.originalLanguage)
      : 'Unknown';

    // Create SEO-friendly title (avoid duplicating global template suffix)
    const title = `${songName} - ${artistName} | ${targetLanguage} Lyrics Translation`;
    
    // Create SEO-friendly description
    const description = `Read ${songName} by ${artistName} lyrics translated to ${targetLanguage}. ${originalLanguage !== targetLanguage ? `Translated from ${originalLanguage} to ${targetLanguage}. ` : ''}Discover the meaning, mood analysis, and interpretation of this song. Free lyrics translation service.`;

    // Build keywords
    const keywords = [
      `${songName} lyrics`,
      `${songName} ${targetLanguage} lyrics`,
      `${artistName} ${songName} lyrics`,
      `${songName} translation`,
      `${songName} ${targetLanguage} translation`,
      'lyrics translation',
      'song meaning',
      'mood analysis',
      'music translation',
      `${targetLanguage} lyrics`,
      song.country || '',
    ].filter(Boolean);

    const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://musemusic.phitik.com';
    const pageUrl = `${siteUrl}/song/${songID}/analysis/${processingID}`;
    const coverImageUrl = processing.coverImage 
      ? (processing.coverImage.startsWith('http') ? processing.coverImage : `${siteUrl}${processing.coverImage}`)
      : `${siteUrl}/images/cover.jpg`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        type: 'music.song',
        title,
        description,
        url: pageUrl,
        siteName: 'MUSE MUSIC',
        images: [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: `${songName} by ${artistName}`,
          },
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [coverImageUrl],
      },
      alternates: {
        canonical: pageUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch {
    // Silently return default metadata on error
    return defaultMetadata;
  }
}

export default function SongAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

