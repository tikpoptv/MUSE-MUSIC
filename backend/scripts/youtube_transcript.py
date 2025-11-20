#!/usr/bin/env python3
"""
CLI tool to fetch YouTube transcripts via youtube-transcript-api.
Outputs JSON so the Node.js service can consume it easily.
"""

import argparse
import json
import sys
from typing import Dict, List, Optional, Union

try:
    from youtube_transcript_api import (
        NoTranscriptFound,
        TranscriptsDisabled,
        VideoUnavailable,
        YouTubeTranscriptApi,
    )
    from youtube_transcript_api.formatters import TextFormatter
except ModuleNotFoundError as import_error:  # pragma: no cover
    print(json.dumps({
        "success": False,
        "error": "Package youtube-transcript-api is missing. Install with pip install youtube-transcript-api."
    }, ensure_ascii=False))
    sys.exit(1)


def parse_languages(values: Optional[List[str]]) -> List[str]:
    if not values:
        return ["th", "en"]
    langs: List[str] = []
    for value in values:
        parts = value.split(",")
        for part in parts:
            cleaned = part.strip()
            if cleaned:
                langs.append(cleaned)
    return langs or ["th", "en"]


class YouTubeTranscriptService:
    def __init__(
        self,
        *,
        languages: Optional[List[str]] = None,
        preserve_formatting: bool = False,
    ):
        self.languages = languages or ["th", "en"]
        self.preserve_formatting = preserve_formatting
        self._api = YouTubeTranscriptApi()

    def _format_transcript(self, transcript, as_text: bool):
        if as_text:
            formatter = TextFormatter()
            return formatter.format_transcript(transcript)
        return transcript.to_raw_data()

    def fetch(
        self,
        video_id: str,
        *,
        languages: Optional[List[str]] = None,
        as_text: bool = False,
        strategy: str = "fallback",
    ) -> Union[Dict[str, Union[str, list]], list, str]:
        target_languages = languages or self.languages
        if not target_languages:
            raise RuntimeError("At least one language must be provided.")

        try:
            if strategy == "multi":
                transcripts: Dict[str, Union[str, list]] = {}
                for language in target_languages:
                    try:
                        result = self._api.fetch(
                            video_id,
                            languages=[language],
                            preserve_formatting=self.preserve_formatting,
                        )
                    except NoTranscriptFound:
                        continue

                    formatted = self._format_transcript(result, as_text)
                    transcripts[result.language_code or language] = formatted

                if not transcripts:
                    raise NoTranscriptFound("No transcripts found for requested languages.")
                return transcripts

            # default fallback behaviour (existing)
            transcript = self._api.fetch(
                video_id,
                languages=target_languages,
                preserve_formatting=self.preserve_formatting,
            )
            return self._format_transcript(transcript, as_text)

        except VideoUnavailable as exc:
            raise RuntimeError("Video is unavailable or has been removed.") from exc
        except TranscriptsDisabled as exc:
            raise RuntimeError("Captions are disabled for this video.") from exc
        except NoTranscriptFound as exc:
            raise RuntimeError("No transcript found for the requested languages.") from exc
        except Exception as exc:  # pragma: no cover - unexpected edge cases
            raise RuntimeError("Unexpected error while fetching transcript.") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch YouTube transcript via youtube-transcript-api")
    parser.add_argument("--video-id", required=True, help="YouTube video ID")
    parser.add_argument(
        "--languages",
        nargs="+",
        default=["th", "en"],
        help="Preferred languages (e.g. --languages th en or --languages th,en)",
    )
    parser.add_argument(
        "--format",
        choices=["raw", "text"],
        default="raw",
        help="Output format: raw (list/dict) or text (plain text)",
    )
    parser.add_argument(
        "--preserve-formatting",
        action="store_true",
        help="Forward preserve_formatting=True to youtube-transcript-api",
    )
    parser.add_argument(
        "--strategy",
        choices=["fallback", "multi"],
        default="fallback",
        help="fallback = first available language, multi = return all requested languages that exist",
    )

    args = parser.parse_args()
    languages = parse_languages(args.languages)

    service = YouTubeTranscriptService(
        languages=languages,
        preserve_formatting=args.preserve_formatting,
    )

    try:
        data = service.fetch(
            args.video_id,
            languages=languages,
            as_text=args.format == "text",
            strategy=args.strategy,
        )
        payload = {
            "success": True,
            "format": args.format,
            "strategy": args.strategy,
            "languages": languages,
            "data": data,
        }
        print(json.dumps(payload, ensure_ascii=False))
        return 0
    except RuntimeError as exc:
        payload = {
            "success": False,
            "error": str(exc),
        }
        print(json.dumps(payload, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())

