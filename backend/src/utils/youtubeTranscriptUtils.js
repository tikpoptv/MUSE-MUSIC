/**
 * Utility functions for YouTube transcript processing
 */

/**
 * Convert YouTube transcript array to LRC format
 * @param {Array} transcript - Array of {text, start, duration} objects
 * @returns {string} LRC formatted string
 */
function transcriptToLRC(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return '';
  }

  const lrcLines = transcript.map(item => {
    const start = item.start || 0;
    const minutes = Math.floor(start / 60);
    const seconds = Math.floor(start % 60);
    const centiseconds = Math.floor((start % 1) * 100);
    
    const timeTag = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}]`;
    const text = (item.text || '').trim();
    
    return `${timeTag}${text}`;
  });

  return lrcLines.join('\n');
}

/**
 * Convert YouTube transcript array to plain text
 * @param {Array} transcript - Array of {text, start, duration} objects
 * @returns {string} Plain text lyrics
 */
function transcriptToPlainText(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return '';
  }

  if (typeof transcript === 'string') {
    return transcript;
  }

  return transcript
    .map(item => (item.text || '').trim())
    .filter(text => text.length > 0)
    .join('\n');
}

/**
 * Extract lyrics preview from transcript (first line, max 500 chars)
 * @param {Array|string} transcript - Transcript array or plain text
 * @returns {string} Preview text
 */
function extractLyricsPreview(transcript) {
  let plainText = '';
  
  if (Array.isArray(transcript)) {
    plainText = transcriptToPlainText(transcript);
  } else if (typeof transcript === 'string') {
    plainText = transcript;
  } else {
    return '';
  }

  const firstLine = plainText.split('\n')[0] || '';
  return firstLine.substring(0, 500).trim();
}

/**
 * Parse artist name from YouTube title
 * Common patterns: "Song Name - Artist", "Artist - Song Name", "Song Name (feat. Artist)"
 * @param {string} title - Video title
 * @param {string} channelTitle - Channel name (fallback)
 * @returns {string} Parsed artist name
 */
function parseArtistFromTitle(title, channelTitle = '') {
  if (!title) {
    return channelTitle || 'Unknown Artist';
  }

  // Try "Song - Artist" pattern
  const dashPattern = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashPattern) {
    const [, part1, part2] = dashPattern;
    // Usually artist is shorter, but we'll use the second part
    return part2.trim() || channelTitle || 'Unknown Artist';
  }

  // Try "Artist - Song" pattern (less common)
  const reverseDashPattern = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (reverseDashPattern) {
    const [, part1] = reverseDashPattern;
    // Check if first part looks like artist name (shorter, no special chars)
    if (part1.length < 50 && !part1.includes('(') && !part1.includes('[')) {
      return part1.trim() || channelTitle || 'Unknown Artist';
    }
  }

  // Fallback to channel title
  return channelTitle || 'Unknown Artist';
}

module.exports = {
  transcriptToLRC,
  transcriptToPlainText,
  extractLyricsPreview,
  parseArtistFromTitle
};

