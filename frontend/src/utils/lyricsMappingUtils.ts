import type { SyncedLyricsLine } from '@/components/SyncedLyricsPlayer';

interface LyricsPair {
  original: string;
  translation: string;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function textsMatch(text1: string, text2: string): boolean {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  if (normalized1 === normalized2) {
    return true;
  }
  
  if (normalized2.includes(normalized1) && normalized1.length > 0) {
    return true;
  }
  
  if (normalized1.includes(normalized2) && normalized2.length > 0) {
    return true;
  }
  
  return false;
}

export function buildLineTimeCache(
  pairs: LyricsPair[],
  syncedLyricsLines: SyncedLyricsLine[]
): Map<number, number | null> {
  const cache = new Map<number, number | null>();

  pairs.forEach((pair, index) => {
    if (!pair || !pair.original.trim()) {
      cache.set(index, null);
      return;
    }

    const originalTrimmed = pair.original.trim();
    let baseTime: number | null = null;

    if (index < syncedLyricsLines.length) {
      const syncedLine = syncedLyricsLines[index];
      const syncedText = syncedLine.text.trim();

      if (textsMatch(originalTrimmed, syncedText)) {
        baseTime = syncedLine.time;
        cache.set(index, baseTime);
        return;
      }
    }

    const searchRange = 3;
    const startIndex = Math.max(0, index - searchRange);
    const endIndex = Math.min(syncedLyricsLines.length, index + searchRange + 1);

    for (let i = startIndex; i < endIndex; i++) {
      const syncedLine = syncedLyricsLines[i];
      const syncedText = syncedLine.text.trim();

      if (textsMatch(originalTrimmed, syncedText)) {
        if (index > 0) {
          const prevTime = cache.get(index - 1);
          if (prevTime !== null && prevTime !== undefined && syncedLine.time < prevTime) {
            continue;
          }
        }
        baseTime = syncedLine.time;
        break;
      }
    }

    if (baseTime === null) {
      for (let i = 0; i < syncedLyricsLines.length; i++) {
        const syncedLine = syncedLyricsLines[i];
        const syncedText = syncedLine.text.trim();

        if (textsMatch(originalTrimmed, syncedText)) {
          if (index > 0) {
            const prevTime = cache.get(index - 1);
            if (prevTime !== null && prevTime !== undefined && syncedLine.time < prevTime) {
              continue;
            }
          }
          baseTime = syncedLine.time;
          break;
        }
      }
    }

    cache.set(index, baseTime);
  });

  return cache;
}

export function getLineTime(
  pairIndex: number,
  cache: Map<number, number | null>
): number | null {
  return cache.get(pairIndex) ?? null;
}

