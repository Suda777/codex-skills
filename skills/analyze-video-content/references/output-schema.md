# Output schema

The default output directory is `<project>/video-analysis/<video-stem>/`.

## Files

- `manifest.json`: source file, SHA-256, media facts, selected backend, component versions, counts, warnings, and generated paths.
- `audio.wav`: mono 16 kHz PCM audio used by ASR and diarization.
- `asr.srt`: raw `whisper.cpp` subtitle output.
- `asr.jsonl`: normalized ASR segments.
- `ocr.jsonl`: deduplicated visible-text observations.
- `speakers.json`: anonymous speaker time intervals.
- `timeline.jsonl`: ASR segments enriched with the best-overlap speaker and nearby visible text.
- `transcript.md`: human-readable, timestamped evidence for semantic analysis.
- `frames/`: sampled subtitle or key-frame images when OCR is enabled.

## JSONL records

ASR:

```json
{"start": 12.3, "end": 16.8, "text": "...", "source": "asr"}
```

OCR:

```json
{"start": 12.0, "end": 14.0, "text": "...", "source": "ocr", "confidence": 0.93}
```

Timeline:

```json
{"start": 12.3, "end": 16.8, "speaker": "SPEAKER_00", "text": "...", "visible_text": ["..."], "source": "asr+ocr"}
```

Times are seconds from the start of the video. Preserve anonymous speaker labels until identity mapping has evidence.

## Completion checks

A run is usable when `manifest.json` exists, audio extraction succeeded, ASR produced at least one non-empty segment, and `timeline.jsonl` and `transcript.md` are non-empty. OCR or diarization may be skipped only when the manifest records the reason.
