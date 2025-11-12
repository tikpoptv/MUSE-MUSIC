# Unit Tests for Copyright Protection

## Overview
This directory contains critical unit tests for data mapping functions that handle copyrighted song lyrics. These tests ensure that we **NEVER leak full copyrighted text** to users and comply with copyright law.

## Test Files

### 1. `analysisService.mapTranslationToPreview.test.js`
Tests the function that **truncates original lyrics to prevent copyright infringement**.

#### Critical Security Tests
- **Text Truncation**: Ensures original text is ALWAYS truncated to maximum 10 characters
- **Multi-language Support**: Tests English and Thai text truncation with proper Unicode handling
- **Emoji Support**: Correctly counts emoji as single characters
- **No Data Leaks**: Verifies full copyrighted text never appears in preview

#### Test Categories
1. **Copyright Protection - Text Truncation** (6 tests)
   - English text truncation
   - Thai text truncation
   - Emoji handling
   - Short text (no truncation needed)
   - Mixed language text

2. **Edge Cases** (6 tests)
   - Empty strings
   - Null/undefined values
   - Whitespace handling
   - Code blocks
   - Escape sequences

3. **Multi-line Processing** (3 tests)
   - Multiple line pairs
   - Missing translations
   - Whitespace cleanup

4. **Real-world Scenarios** (3 tests)
   - Song lyrics format
   - Copyright text protection
   - Mixed language content

5. **Security Tests - Prevent Data Leaks** (2 tests)
   - **CRITICAL**: Verifies no original text > 10 characters escapes
   - Tests multiple languages (English, Thai, Latin, Mixed)
   - Special characters handling

### 2. `songService.mapTranslationToFull.test.js`
Tests the function that **reconstructs full lyrics from preview** (used internally only).

#### Purpose
This function is used server-side to map truncated previews back to full lyrics when:
- User has access to full song (purchased/premium)
- Admin is editing translations

#### Test Categories
1. **Basic Functionality** (2 tests)
   - Preview to full mapping
   - Detection of already-full text

2. **Edge Cases** (5 tests)
   - Empty/null/undefined inputs
   - Handles all edge cases gracefully

3. **Preview Detection Logic** (2 tests)
   - Correctly identifies preview (lines ≤ 10 chars)
   - Correctly identifies full text (lines > 10 chars)

4. **Line Matching** (3 tests)
   - Sequential line mapping
   - Mismatched line counts
   - Out-of-sync previews

5. **Multi-language Support** (4 tests)
   - Thai preview mapping
   - English preview mapping
   - Emoji handling
   - Mixed English-Thai

6. **Whitespace Handling** (3 tests)
   - Extra whitespace cleanup
   - Empty lines
   - Trailing whitespace

7. **Real-world Scenarios** (2 tests)
   - Chorus repetition
   - Complex song structures

8. **Performance and Safety** (2 tests)
   - Large text efficiency
   - Malformed input handling

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Run only these service tests
npm test -- analysisService songService
```

## Why These Tests Are Important

### Legal Compliance
- **Copyright Law**: We must not distribute full copyrighted lyrics without permission
- **Preview Limitation**: 10-character truncation ensures we're showing minimal preview
- **Audit Trail**: These tests serve as proof of compliance

### Data Security
- Prevents accidental leakage of copyrighted material
- Ensures consistent truncation across all languages
- Validates Unicode character counting (important for Thai, emoji, etc.)

### Business Protection
- Protects company from copyright infringement lawsuits
- Demonstrates good faith effort to comply with copyright law
- Provides documentation for legal review

## Test Coverage

- **42 tests total**
- **All critical security paths covered**
- **Multiple language support verified**
- **Edge cases handled**

## Maintenance

⚠️ **CRITICAL**: Do NOT modify or remove these tests without legal review.

When modifying the mapping functions:
1. Ensure ALL existing tests still pass
2. Add new tests for new edge cases
3. Verify truncation limit (10 chars) is maintained
4. Test with real Thai, English, and emoji content
5. Run `npm run test:coverage` to ensure 100% coverage of critical paths

## Related Files

- `backend/src/services/analysisService.js` - Contains `mapTranslationToPreview()`
- `backend/src/services/songService.js` - Contains `mapTranslationToFull()`
- `backend/src/services/adminSongsService.js` - Uses both functions

## Contact

For questions about these tests or copyright compliance:
- Technical: Backend team
- Legal: Legal department
- Security: Security team

