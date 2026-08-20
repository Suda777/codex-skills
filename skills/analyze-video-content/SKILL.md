---
name: analyze-video-content
description: Transcribe and analyze local videos with timestamps, visible-text OCR, and speaker turns. Use when the user asks to read, understand, summarize, extract questions and answers from, or write from a downloaded video, podcast, interview, lecture, meeting, or screen recording. Use download-video-from-link first when only a public URL is available. Do not use for merely downloading a video or for bypassing private access, DRM, or authentication.
---

# Analyze Video Content

Turn a validated local video into a traceable transcript and then answer the user's actual content question. Keep extraction evidence separate from interpretation.

## Workflow

1. Resolve the local video. If the user supplied only a public URL, use `download-video-from-link` first and pass its validated file path into this Skill.
2. Check the runtime without changing the machine:

   ```bash
   python3 <skill>/scripts/setup_runtime.py --check --profile auto --model base
   ```

3. If setup is missing, ask before network access, package installation, model downloads, or compilation. Install only inside `<skill>/.runtime/`:

   ```bash
   python3 <skill>/scripts/setup_runtime.py --install --profile auto --model base
   ```

4. Choose the backend:
   - `auto`: macOS uses Apple Vision for visible text and a native-accelerated `whisper.cpp` build; Windows/Linux use the portable open-source path.
   - `macos`: require macOS and Apple Vision OCR.
   - `portable`: use `whisper.cpp`, RapidOCR, and sherpa-onnx without Apple Vision. Use this to reproduce the Windows/Linux extraction path on another system.
5. Run the extractor with the runtime Python printed by `setup_runtime.py`:

   ```bash
   <runtime-python> <skill>/scripts/analyze_video.py \
     "/absolute/path/video.mp4" \
     --backend auto \
     --language zh \
     --model base \
     --speakers 2
   ```

6. Inspect `manifest.json`, `timeline.jsonl`, and `transcript.md`. Do not claim that OCR, speaker identity, or names are certain when the evidence is weak.
7. Produce the requested deliverable from the timeline:
   - For interviews and podcasts, preserve the full substantive exchange in chronological order. For every topic, write `完整问题`, then `完整回答（整理稿）`, then `本题主旨`, with an approximate timestamp.
     - Merge immediate follow-up questions into the same question block when they clarify the same topic.
     - Keep every substantive argument, example, qualification, and conclusion from the answer. Remove only greetings, filler words, false starts, and exact repetition.
     - Do not replace the complete answer with a summary. If the source is ASR/OCR rather than a verified transcript, label the result as a cleaned or organized transcript rather than verbatim quotation.
   - For lectures, extract the argument structure, examples, conclusions, and unresolved questions.
   - For meetings, extract decisions, owners, deadlines, disagreements, and open items.
   - When the user asks for an article, synthesize the speaker's answer themes instead of pasting a transcript.
   - When the user asks for Word, hand the final content to the document workflow after the analysis is complete.

## Evidence and quality rules

- Prefer embedded subtitles when present, then ASR for complete speech, then OCR for visible captions, names, slides, and terminology correction.
- Keep `source`, `start`, `end`, `speaker`, and confidence or warning fields in intermediate records.
- OCR and ASR should corroborate each other; do not concatenate duplicate text.
- Speaker diarization answers "who spoke when" but normally returns anonymous clusters. Map clusters to names or roles only from visible labels, explicit introductions, user context, or a reviewed sample.
- Mark inferred questions, speaker names, and repaired wording as interpretation rather than verbatim source text.
- A portable run on macOS validates the cross-platform code path, not Windows packaging or GPU drivers. Say so explicitly.
- Keep generated audio, frames, transcripts, and reports under `<project>/video-analysis/<video-name>/`. Never put user media or analysis outputs inside the Skill.
- Do not upload the video or transcript to a cloud service unless separately requested and authorized.

## References

- Read [platforms.md](references/platforms.md) for backend selection, dependency fallbacks, and Windows-specific constraints.
- Read [output-schema.md](references/output-schema.md) before changing the timeline or manifest format.
- Read [sources-and-licenses.md](references/sources-and-licenses.md) before updating pinned open-source components.
