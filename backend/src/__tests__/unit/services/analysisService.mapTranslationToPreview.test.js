/* eslint-env jest */
const AnalysisService = require('../../../services/analysisService');

describe('AnalysisService.mapTranslationToPreview', () => {
  describe('Copyright Protection - Text Truncation', () => {
    test('should truncate English text to 10 characters max', () => {
      const input = `This is a very long line that should be truncated
This is the translation`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== ''); // Filter empty lines
      
      // First line should be truncated to 10 characters
      expect(lines[0]).toBe('This is a');
      expect(Array.from(lines[0]).length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('This is the translation');
    });

    test('should truncate Thai text to 10 characters max', () => {
      const input = `นี่คือข้อความภาษาไทยที่ยาวมากและควรถูกตัดให้เหลือเพียง 10 ตัวอักษร
นี่คือคำแปล`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      // Should truncate to first 10 characters (after trim)
      const firstLine = lines[0];
      expect(Array.from(firstLine).length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('นี่คือคำแปล');
    });

    test('should handle emoji and Unicode characters correctly', () => {
      const input = `Hello 😀😁😂🤣😃😄😅😆😉😊 World
Translation here`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      // Should count emoji as characters and truncate properly
      const firstLine = lines[0];
      const chars = Array.from(firstLine);
      expect(chars.length).toBeLessThanOrEqual(10);
    });

    test('should NOT truncate text already 10 characters or less', () => {
      const input = `Short text
This is the translation`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      expect(lines[0]).toBe('Short text');
      expect(lines[1]).toBe('This is the translation');
    });

    test('should handle mixed English and Thai text', () => {
      const input = `Hello world สวัสดีโลก this is very long
คำแปลภาษาไทย`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      const chars = Array.from(lines[0]);
      expect(chars.length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('คำแปลภาษาไทย');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const result = AnalysisService.mapTranslationToPreview('');
      expect(result).toBe('');
    });

    test('should handle null', () => {
      const result = AnalysisService.mapTranslationToPreview(null);
      expect(result).toBeNull();
    });

    test('should handle undefined', () => {
      const result = AnalysisService.mapTranslationToPreview(undefined);
      expect(result).toBeUndefined();
    });

    test('should handle whitespace only', () => {
      const result = AnalysisService.mapTranslationToPreview('   \n\n   ');
      // Returns the input since trim() makes it empty
      expect(result.trim()).toBe('');
    });

    test('should handle text with code blocks', () => {
      const input = `\`\`\`
This is a very long original text
Translation here
\`\`\``;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l.trim());
      
      // Should remove code block markers and truncate
      expect(lines[0].length).toBeLessThanOrEqual(10);
    });

    test('should handle text with \\n escape sequences', () => {
      const input = 'This is a very long line\\nTranslation';
      
      const result = AnalysisService.mapTranslationToPreview(input);
      
      // Should convert \\n to actual newline
      expect(result).toContain('\n');
    });
  });

  describe('Multi-line Processing', () => {
    test('should process multiple line pairs correctly', () => {
      const input = `First long original line that needs truncation
First translation
Second long original line that needs truncation
Second translation
Third long original line that needs truncation
Third translation`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n');
      
      // Line pairs with empty line separator: original, translation, empty
      expect(Array.from(lines[0]).length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('First translation');
      expect(lines[2]).toBe(''); // Empty separator
      expect(Array.from(lines[3]).length).toBeLessThanOrEqual(10);
      expect(lines[4]).toBe('Second translation');
      expect(lines[5]).toBe(''); // Empty separator
    });

    test('should handle original lines without translations', () => {
      const input = `This is a very long original line

Another very long original line

And one more very long original line`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      // Each original line should be truncated
      expect(Array.from(lines[0]).length).toBeLessThanOrEqual(10);
      expect(Array.from(lines[1]).length).toBeLessThanOrEqual(10);
      expect(Array.from(lines[2]).length).toBeLessThanOrEqual(10);
    });

    test('should handle extra whitespace between lines', () => {
      const input = `First long line


Second long line



Third long line`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      
      // Should clean up extra whitespace
      expect(result).not.toContain('\n\n\n');
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical song lyrics format', () => {
      const input = `I'm walking on sunshine, whoa-oh
ฉันกำลังเดินบนแสงอาทิตย์
And don't it feel good!
และมันรู้สึกดีมาก!
Hey, all right now
เฮ้ ดีมากเลยตอนนี้`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n');
      
      // Check original lines are truncated (line 0, 3, 6 with empty separators at 2, 5, 8)
      expect(Array.from(lines[0]).length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('ฉันกำลังเดินบนแสงอาทิตย์');
      expect(lines[2]).toBe(''); // Empty separator
      expect(Array.from(lines[3]).length).toBeLessThanOrEqual(10);
      expect(lines[4]).toBe('และมันรู้สึกดีมาก!');
    });

    test('should NOT leak full copyright text', () => {
      const copyrightedText = `This is the full copyrighted song lyrics that should never appear in preview`;
      const input = `${copyrightedText}
Translation of the lyrics`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      
      // Ensure full copyrighted text is NOT in the result
      expect(result).not.toContain(copyrightedText);
      
      // Only truncated version should appear
      const lines = result.split('\n');
      expect(lines[0].length).toBeLessThanOrEqual(10);
      expect(lines[0]).toBe('This is th');
    });

    test('should handle mixed English-Thai content', () => {
      const input = `Hello สวัสดี World โลก this is long
Translation mixed ภาษาผสม
Another line with emojis 😀🎵🎶
อีกบรรทัดหนึ่ง`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n').filter(l => l !== '');
      
      // Check truncation works with mixed content
      const firstLine = Array.from(lines[0]);
      expect(firstLine.length).toBeLessThanOrEqual(10);
      expect(lines[1]).toBe('Translation mixed ภาษาผสม');
      expect(Array.from(lines[2]).length).toBeLessThanOrEqual(10);
      expect(lines[3]).toBe('อีกบรรทัดหนึ่ง');
    });
  });

  describe('Security Tests - Prevent Data Leaks', () => {
    test('should NEVER return original text longer than 10 characters', () => {
      const longTexts = [
        {
          text: 'This is a very very very long line that contains copyrighted material',
          lang: 'English'
        },
        {
          text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
          lang: 'Latin'
        },
        {
          text: 'นี่คือข้อความภาษาไทยที่ยาวมากๆ และมีลิขสิทธิ์ที่ต้องปกป้อง',
          lang: 'Thai'
        },
        {
          text: 'Hello world this is English and Thai ภาษาไทยผสมกันยาวมาก',
          lang: 'Mixed'
        }
      ];

      longTexts.forEach(({ text, lang }) => {
        const input = `${text}\nTranslation for ${lang}`;
        const result = AnalysisService.mapTranslationToPreview(input);
        const lines = result.split('\n').filter(l => l !== '');
        
        // CRITICAL: Original line must be truncated
        const originalLine = lines[0];
        const chars = Array.from(originalLine);
        
        expect(chars.length).toBeLessThanOrEqual(10);
        expect(originalLine).not.toBe(text);
        expect(result).not.toContain(text);
      });
    });

    test('should truncate even with special characters', () => {
      const input = `!@#$%^&*()_+-=[]{}|;:'"<>,.?/~\`
Translation`;
      
      const result = AnalysisService.mapTranslationToPreview(input);
      const lines = result.split('\n');
      
      expect(Array.from(lines[0]).length).toBeLessThanOrEqual(10);
    });
  });
});

