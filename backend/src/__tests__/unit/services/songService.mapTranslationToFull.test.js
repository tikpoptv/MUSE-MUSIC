/* eslint-env jest */
const SongService = require('../../../services/songService');

describe('SongService.mapTranslationToFull', () => {
  describe('Basic Functionality', () => {
    test('should map preview translation to full lyrics', () => {
      const previewTranslation = `Hello wor
สวัสดีชาวโลก

This is a
นี่คือการทดสอบ

Goodbye wo
ลาก่อน`;

      const fullLyrics = `Hello world
This is a test
Goodbye world`;

      const result = SongService.mapTranslationToFull(previewTranslation, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      // Expect: original, translation, original, translation, original, translation
      expect(lines[0]).toBe('Hello world');
      expect(lines[1]).toBe('สวัสดีชาวโลก');
      expect(lines[2]).toBe('This is a test');
      expect(lines[3]).toBe('นี่คือการทดสอบ');
      expect(lines[4]).toBe('Goodbye world');
      expect(lines[5]).toBe('ลาก่อน');
    });

    test('should detect and return already full text unchanged', () => {
      const fullText = `Hello world this is already full
สวัสดีชาวโลก

This is a test with full lyrics
นี่คือการทดสอบ`;

      const lyrics = `Hello world this is already full
This is a test with full lyrics`;

      const result = SongService.mapTranslationToFull(fullText, lyrics);

      // Should return as-is because most lines are > 10 chars (already full)
      expect(result).toBe(fullText);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty preview translation', () => {
      const result = SongService.mapTranslationToFull('', 'Some lyrics');
      expect(result).toBe('');
    });

    test('should handle empty full lyrics', () => {
      const preview = `Short
Translation`;
      const result = SongService.mapTranslationToFull(preview, '');
      expect(result).toBe(preview);
    });

    test('should handle null preview translation', () => {
      const result = SongService.mapTranslationToFull(null, 'Some lyrics');
      expect(result).toBeNull();
    });

    test('should handle null full lyrics', () => {
      const preview = `Short\nTranslation`;
      const result = SongService.mapTranslationToFull(preview, null);
      expect(result).toBe(preview);
    });

    test('should handle undefined inputs', () => {
      expect(SongService.mapTranslationToFull(undefined, 'lyrics')).toBeUndefined();
      expect(SongService.mapTranslationToFull('preview', undefined)).toBe('preview');
    });
  });

  describe('Preview Detection Logic', () => {
    test('should correctly identify preview text (most lines <= 10 chars)', () => {
      const previewText = `Short
Translation
Brief
แปล
Quick
รวดเร็ว`;

      const fullLyrics = `Short text here
Brief description
Quick response`;

      const result = SongService.mapTranslationToFull(previewText, fullLyrics);

      // Should map because it's detected as preview
      expect(result).toContain('Short text here');
    });

    test('should correctly identify full text (most lines > 10 chars)', () => {
      const fullText = `This is already a full line
แปลเต็มรูปแบบ
Another complete line here
อีกบรรทัดเต็ม`;

      const lyrics = `This is already a full line
Another complete line here`;

      const result = SongService.mapTranslationToFull(fullText, lyrics);

      // Should return as-is because it's detected as full text
      expect(result).toBe(fullText);
    });
  });

  describe('Line Matching', () => {
    test('should match preview lines to correct full lyrics lines', () => {
      const preview = `I'm walkin
ฉันกำลังเดิน

And don't
และไม่ใช่

Hey, all r
เฮ้ ทั้งหมด`;

      const fullLyrics = `I'm walking on sunshine
And don't it feel good
Hey, all right now`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      // Sequential mapping: original, translation pairs
      expect(lines[0]).toBe("I'm walking on sunshine");
      expect(lines[1]).toBe('ฉันกำลังเดิน');
      expect(lines[2]).toBe("And don't it feel good");
      expect(lines[3]).toBe('และไม่ใช่');
      expect(lines[4]).toBe('Hey, all right now');
      expect(lines[5]).toBe('เฮ้ ทั้งหมด');
    });

    test('should handle mismatched line counts gracefully', () => {
      const preview = `First pre
แปลแรก

Second pr
แปลที่สอง`;

      const fullLyrics = `First preview line
Second preview line
Third line not in preview`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      // Should map what it can
      expect(result).toContain('First preview line');
      expect(result).toContain('แปลแรก');
      expect(result).toContain('Second preview line');
      expect(result).toContain('แปลที่สอง');
    });

    test('should handle when preview and lyrics are out of sync', () => {
      const preview = `Line two
แปล

Line four
แปลสี่`;

      const fullLyrics = `Line one
Line two
Line three
Line four`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      // Should match based on sequential order
      const lines = result.split('\n').filter(l => l.trim());
      expect(lines).toContain('Line one');
      expect(lines).toContain('แปล');
    });
  });

  describe('Multi-language Support', () => {
    test('should handle Thai preview to full mapping', () => {
      const preview = `นี่คือข้อค
คำแปลภาษาอังกฤษ`;

      const fullLyrics = `นี่คือข้อความภาษาไทยที่ยาว`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      // Maps sequentially: first full lyric + translation
      expect(lines[0]).toBe('นี่คือข้อความภาษาไทยที่ยาว');
      expect(lines[1]).toBe('คำแปลภาษาอังกฤษ');
    });

    test('should handle English preview to full mapping', () => {
      const preview = `This is a
นี่คือคำแปล`;

      const fullLyrics = `This is a very long English text`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      expect(lines[0]).toBe('This is a very long English text');
      expect(lines[1]).toBe('นี่คือคำแปล');
    });

    test('should handle emoji in preview correctly', () => {
      const preview = `Hello 😀😁
แปลพร้อมอีโมจิ`;

      const fullLyrics = `Hello 😀😁😂🤣😃 with more emoji`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      expect(lines[0]).toBe('Hello 😀😁😂🤣😃 with more emoji');
      expect(lines[1]).toBe('แปลพร้อมอีโมจิ');
    });

    test('should handle mixed English-Thai lyrics', () => {
      const preview = `Hello สวัส
Translation

World โลก
แปล`;

      const fullLyrics = `Hello สวัสดี welcome
World โลก universe`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      expect(lines[0]).toBe('Hello สวัสดี welcome');
      expect(lines[1]).toBe('Translation');
      expect(lines[2]).toBe('World โลก universe');
      expect(lines[3]).toBe('แปล');
    });
  });

  describe('Whitespace Handling', () => {
    test('should handle extra whitespace in preview', () => {
      const preview = `  Short  
  Translation  

  Brief  
  แปล  `;

      const fullLyrics = `Short text
Brief description`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      // Should clean up and map correctly
      expect(result).toContain('Short text');
      expect(result).toContain('Translation');
    });

    test('should handle empty lines correctly', () => {
      const preview = `Short

Translation

Brief

แปล`;

      const fullLyrics = `Short text

Brief description`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      expect(result).toContain('Short text');
      expect(result).toContain('Brief description');
    });

    test('should remove trailing empty lines', () => {
      const preview = `Short
Translation


`;

      const fullLyrics = `Short text`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      // Should not end with empty lines
      expect(result).not.toMatch(/\n\n$/);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical song lyrics with chorus repetition', () => {
      const preview = `I'm walkin
ฉันกำลังเดิน

And don't
และไม่

I'm walkin
ฉันกำลังเดิน`;

      const fullLyrics = `I'm walking on sunshine
And don't it feel good
I'm walking on sunshine`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);
      const lines = result.split('\n').filter(l => l.trim());

      // Should map both instances correctly
      expect(lines.filter(l => l === "I'm walking on sunshine").length).toBe(2);
      expect(lines.filter(l => l === 'ฉันกำลังเดิน').length).toBe(2);
    });

    test('should handle complex song structure', () => {
      const preview = `Verse one
บรรทัดแรก

Chorus he
คอรัสที่นี่

Verse two
บรรทัดสอง

Chorus he
คอรัสที่นี่`;

      const fullLyrics = `Verse one line
Chorus here
Verse two line
Chorus here`;

      const result = SongService.mapTranslationToFull(preview, fullLyrics);

      expect(result).toContain('Verse one line');
      expect(result).toContain('Verse two line');
      expect(result).toContain('Chorus here');
    });
  });

  describe('Performance and Safety', () => {
    test('should handle large texts efficiently', () => {
      const largeLyrics = Array(100).fill('This is a line of lyrics').join('\n');
      const largePreview = Array(100).fill('This is a\nTranslation').join('\n\n');

      const startTime = Date.now();
      const result = SongService.mapTranslationToFull(largePreview, largeLyrics);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    test('should not crash with malformed input', () => {
      const malformed = `\n\n\n\n\n
\t\t\t
      
`;
      
      expect(() => {
        SongService.mapTranslationToFull(malformed, 'normal lyrics');
      }).not.toThrow();
    });
  });
});

