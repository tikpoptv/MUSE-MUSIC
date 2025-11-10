# Mood Class Mapping

This document describes the mood class indices used in the mood analysis system. The mood analysis is performed by the n8n AI model (LLM OSS 120B) and returns numeric class indices (0-21) that map to specific mood types.

## Overview

The mood analysis system uses a class-based approach where each mood is represented by a numeric index. The AI model analyzes song lyrics and returns scores for different mood classes, which are then mapped to human-readable mood names.

## Mood Class Index Reference

| Class Index | Mood Name | Emoji Examples | Description |
|------------|-----------|----------------|-------------|
| 0 | Happy | 🙂 😄 😁 😆 😀 😊 😃 | Positive, joyful emotions |
| 1 | Sad | 😢 😥 😰 😓 🙁 😟 😞 😔 😣 😫 😩 | Negative, melancholic emotions |
| 2 | Anger | 😡 😠 😤 😖 | Angry, frustrated emotions |
| 3 | Disgust | 🙄 😒 😑 😕 | Disgusted, displeased emotions |
| 4 | Fear | 😱 | Fearful, scared emotions |
| 5 | Fear | 😨 😧 😦 | Fearful emotions (alternative) |
| 6 | Surprise | 😮 😲 😯 | Surprised, astonished emotions |
| 7 | Sleepy | 😴 😪 | Tired, sleepy emotions |
| 8 | Playful | 😋 😜 😝 😛 | Playful, fun-loving emotions |
| 9 | Love | 😍 💕 😘 😚 😙 😗 | Loving, affectionate emotions |
| 10 | Calm | 😌 | Calm, peaceful emotions |
| 11 | Neutral | 😐 | Neutral, emotionless state |
| 12 | Sick | 😷 | Sick, unwell emotions |
| 13 | Embarrassed | 😳 | Embarrassed, shy emotions |
| 14 | Dizzy | 😵 | Dizzy, confused emotions |
| 15 | Broken Heart | 💔 | Heartbroken, devastated emotions |
| 16 | Cool | 😎 😈 | Cool, confident emotions |
| 17 | Mixed | 🙃 😏 😂 😭 | Mixed emotions (sarcastic, funny, crying) |
| 18 | Awkward | 😬 😅 😶 | Awkward, uncomfortable emotions |
| 19 | Wink | 😉 | Playful, flirty emotions |
| 20 | Hearts | 💖 💙 💚 💗 💓 💜 💘 💛 | Various heart colors (affectionate) |
| 21 | Angel | 😇 | Angelic, innocent emotions |

## Implementation Details

### Backend Mapping

The mood class mapping is defined in `backend/src/services/analysisService.js`:

```javascript
const MOOD_CLASS_MAP = {
  0: 'Happy',
  1: 'Sad',
  2: 'Anger',
  3: 'Disgust',
  4: 'Fear',
  5: 'Fear',
  6: 'Surprise',
  7: 'Sleepy',
  8: 'Playful',
  9: 'Love',
  10: 'Calm',
  11: 'Neutral',
  12: 'Sick',
  13: 'Embarrassed',
  14: 'Dizzy',
  15: 'Broken Heart',
  16: 'Cool',
  17: 'Mixed',
  18: 'Awkward',
  19: 'Wink',
  20: 'Hearts',
  21: 'Angel'
};
```

### API Response Format

The n8n webhook returns mood analysis results in the following format:

```
MoodAnalyze:
1 40%
9 30%
20 15%
17 10%
```

Where:
- First number: Class index (0-21)
- Second number: Percentage score (0-100%)

### Data Flow

1. **Input**: Song lyrics are sent to the n8n webhook with `moodEnabled: true`
2. **Processing**: The AI model analyzes the lyrics and generates mood scores
3. **Output**: The response includes a `moodAnalyze` field with class indices and percentages
4. **Parsing**: The backend parses the response and maps class indices to mood names
5. **Storage**: Mood data is stored in the database as JSON array
6. **Display**: The frontend displays moods with icons and percentages

### Frontend Display

The frontend uses icons to represent each mood:
- **SVG Icons**: Happy, Sad, Anger, Disgust, Fear, Surprise (stored in `/public/icons/`)
- **Lucide Icons**: All other moods use Lucide React icons

The mood display shows:
- Top mood icon (largest percentage)
- List of all moods with percentages > 0%
- Progress bars for each mood

## Notes

- **Class 4 and 5**: Both map to "Fear" but may represent different intensities or contexts
- **Normalization**: Mood names are normalized (lowercase, trimmed) for consistent mapping
- **Filtering**: Moods with 0% are filtered out from display
- **Sorting**: Moods are sorted by percentage in descending order
- **Top Mood**: The mood with the highest percentage is considered the "top mood"

## Example Usage

When the API returns:
```
MoodAnalyze:
17 35%
1 25%
9 20%
20 15%
```

The system will:
1. Parse class indices: 17, 1, 9, 20
2. Map to names: Mixed, Sad, Love, Hearts
3. Display with percentages: Mixed 35%, Sad 25%, Love 20%, Hearts 15%
4. Show "Mixed" as the top mood with its icon

## Related Files

- `backend/src/services/analysisService.js` - Mood parsing and mapping logic
- `frontend/src/components/MoodAnalyzeSection.tsx` - Frontend mood display component
- `frontend/src/components/MusicCard.tsx` - Mood icon display on music cards

