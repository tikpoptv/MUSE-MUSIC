'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface LyricsPair {
  original: string;
  translation: string;
}

interface EditableLyricsPairsProps {
  lyrics: string;
  translation?: string;
  onChange: (lyrics: string) => void;
  onSave?: (lyrics: string) => void;
  baselineOriginalLyrics?: string;
}

export default function EditableLyricsPairs({
  lyrics,
  translation,
  onChange,
  onSave,
  baselineOriginalLyrics
}: EditableLyricsPairsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [pairs, setPairs] = useState<LyricsPair[]>([]);

  // Parse lyrics into pairs
  const parseToPairs = (text: string): LyricsPair[] => {
    if (!text) return [];
    
    const cleanedText = text.replace(/^Translation per line\s*/i, '').trim();
    if (!cleanedText) return [];
    
    // Parse format: original\n translation\n \n ...
    const lines = cleanedText.split('\n');
    const pairs: LyricsPair[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const original = lines[i]?.trim() || '';
      const translation = lines[i + 1]?.trim() || '';
      
      if (original || translation) {
        pairs.push({ original, translation });
      }
      
      i += 2;
      // Skip empty line separator
      while (i < lines.length && !lines[i]?.trim()) {
        i++;
      }
    }
    
    return pairs;
  };

  // Convert pairs to JSON
  const convertToJSON = (pairsToConvert: LyricsPair[]): string => {
    return JSON.stringify(pairsToConvert, null, 2);
  };

  // Convert JSON back to backend format (original\n translation\n \n ...)
  const convertJSONToBackendFormat = (jsonStr: string): string => {
    try {
      const pairs: LyricsPair[] = JSON.parse(jsonStr);
      if (!Array.isArray(pairs)) return '';
      
      const result: string[] = [];
      pairs.forEach((pair, index) => {
        if (pair.original || pair.translation) {
          result.push(pair.original || '');
          result.push(pair.translation || '');
          if (index < pairs.length - 1) {
            result.push('');
          }
        }
      });
      
      return result.join('\n');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Invalid JSON:', error);
      return '';
    }
  };

  // Initialize pairs
  useEffect(() => {
    const textToParse = translation || lyrics || '';
    const parsedPairs = parseToPairs(textToParse);
    setPairs(parsedPairs);
  }, [lyrics, translation]);

  const handleEdit = () => {
    const json = convertToJSON(pairs);
    setJsonText(json);
    setIsEditing(true);
  };

  const handleSave = () => {
      try {
        const pairs: LyricsPair[] = JSON.parse(jsonText);
        if (!Array.isArray(pairs)) {
          toast.error('Invalid JSON format');
          return;
        }

        // Require at least one pair
        if (pairs.length === 0) {
          toast.error('Please add at least 1 pair of original and translation');
          return;
        }

        // Validate that each pair has both original and translation
        const invalidPairs = pairs.filter((pair) => {
          const hasOriginal = pair.original && pair.original.trim() !== '';
          const hasTranslation = pair.translation && pair.translation.trim() !== '';
          return !hasOriginal || !hasTranslation;
        });

        if (invalidPairs.length > 0) {
          toast.error(`Please ensure all ${invalidPairs.length} pair(s) have both original and translation lines`);
          return;
        }

        // Forbid newline characters inside a single line (would break pairing)
        const invalidNewlines = pairs.filter((pair) => pair.original.includes('\n') || pair.translation.includes('\n'));
        if (invalidNewlines.length > 0) {
          toast.error('Newlines inside a single original/translation are not allowed');
          return;
        }

        // Strict count validation: compare number of original pairs vs original lyrics lines
        const expectedOriginalCount = (baselineOriginalLyrics ?? lyrics ?? '')
          .split('\n')
          .filter(line => line.trim() !== '').length;
        const newOriginalCount = pairs.filter(p => p.original && p.original.trim() !== '').length;
        if (expectedOriginalCount > 0 && newOriginalCount !== expectedOriginalCount) {
          toast.error(`Original lines mismatch: expected ${expectedOriginalCount}, got ${newOriginalCount}`);
          return;
        }

        const backendFormat = convertJSONToBackendFormat(jsonText);
        if (backendFormat) {
          onChange(backendFormat);
          const parsedPairs = parseToPairs(backendFormat);
          setPairs(parsedPairs);
          
          // Auto-save to backend if onSave callback is provided
          if (onSave) {
            onSave(backendFormat);
          }
        }
        setIsEditing(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Invalid JSON:', error);
        toast.error('Invalid JSON format. Please check your input.');
      }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setJsonText('');
  };

  return (
    <div className="w-full">
      {!isEditing ? (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
          
          {/* Display with colors */}
          <div className="px-4 py-4 text-sm bg-white border border-gray-300 rounded-md max-h-[500px] overflow-y-auto space-y-3">
            {pairs.length > 0 ? (
              pairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="space-y-1.5 border-b border-gray-200 pb-3 last:border-b-0">
                  {/* Original line - Purple */}
                  {pair.original && (
                    <div className="text-[#7B61FF] font-semibold text-base" style={{ lineHeight: '1.8rem' }}>
                      {pair.original}
                    </div>
                  )}
                  {/* Translation line - Gray */}
                  {pair.translation && (
                    <div className="text-gray-600 text-base" style={{ lineHeight: '1.8rem' }}>
                      {pair.translation}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">No lyrics available</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#7B61FF] rounded-md hover:bg-[#6B51EF] transition-colors"
              type="button"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs text-gray-500 px-1">
              Edit lyrics in JSON format. Each pair has &quot;original&quot; and &quot;translation&quot; fields.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={20}
              placeholder='[{"original": "line 1", "translation": "translation 1"}, {"original": "line 2", "translation": "translation 2"}]'
              className="w-full px-5 py-4 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-[#7B61FF] rounded-md resize-none font-mono"
              style={{
                lineHeight: '1.6rem'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

