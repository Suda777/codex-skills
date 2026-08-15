---
name: download-video-from-link
description: Download, verify, and organize public videos from shared URLs or copied share text. Use when the user provides a link from Douyin, Bilibili, Xiaohongshu, YouTube, Weibo, Xigua, TikTok, X/Twitter, Instagram, Vimeo, or another supported video site and asks Codex to download, save, archive, or prepare the video for later analysis. Route each platform to the bundled downloader, use an anonymous browser session only as a fallback, and write a project-local manifest. Do not use to bypass logins, paywalls, DRM, private access, or other authorization controls, or when the user only wants a summary without saving the video.
---

# Download Video From Link

Accept a link as the only required user input. Resolve the platform, download the public video with the bundled tools, validate the file, and store it predictably inside the current project.

## Core workflow

1. Identify the project root. Default to the current workspace; ask only when no safe destination can be inferred.
2. Extract the first HTTP(S) URL from the supplied link or copied share text.
3. Keep outputs under `<project>/videos/`:

   ```text
   videos/<platform>/<author>/<title>_<video-id>.<ext>
   videos/download_manifest.jsonl
   ```

4. Check the runtime without modifying the project:

   ```bash
   python3 <skill>/scripts/setup_runtime.py --check
   ```

   If setup is required, obtain permission for the networked dependency installation, then run `setup_runtime.py`. The runtime must remain under `<skill>/.runtime/`.
5. Run the downloader with the full share text quoted as one argument:

   ```bash
   python3 <skill>/scripts/download_video.py "<share text or URL>" --project-root "<project-root>"
   ```

6. Return the saved file path, platform, validation result, and manifest path. Do not claim success unless a non-temporary media file exists and validation passes.

## Routing rules

- Douyin: use the bundled `douyin-downloader`. Try the public request first, then capture a fresh anonymous Chrome session and retry when risk control blocks it.
- Bilibili: use the bundled `yt-dlp` Bilibili extractor. If Bilibili returns HTTP 412, use the bundled public `playurl` API adapter and merge the selected video/audio streams inside the Skill runtime.
- Xiaohongshu: try the bundled `yt-dlp` extractor, including short-link resolution. If extraction fails, retry once with a fresh anonymous Chrome session.
- Other sites: try the bundled `yt-dlp` extractor and generic extractor. Read [platform-strategies.md](references/platform-strategies.md) when routing or fallback behavior is unclear.
- If an extractor has genuinely broken, research a currently maintained replacement and finish the user's immediate task when safe. Propose a permanent Skill change separately; do not silently replace bundled tools.

## Browser and account boundaries

- Use a new anonymous browser context by default. Do not read the user's existing browser profile, history, passwords, or cookies.
- Store temporary cookies only inside `.runtime/jobs/`, set owner-only permissions, never print their values, and delete the job directory after the attempt.
- Ask before using an authenticated account session. Never bypass a login, paywall, DRM, private post, geographic restriction, or deleted-content restriction.
- Download only content the user is authorized to access. Do not upload downloaded media to another service unless separately requested and authorized.
- Read [security-and-maintenance.md](references/security-and-maintenance.md) before changing credential handling or bundled tools.

## File-management rules

- Keep tools and their Python environment inside this Skill; never create per-project `.tools/` copies.
- Keep partial downloads as tool-managed temporary files and report them as failures. Only final media files belong in the manifest.
- Reuse an existing valid file when the manifest already contains the same platform/video ID or source URL.
- Do not edit `.gitignore` automatically. If the project uses Git and `videos/` is not ignored, recommend the change and obtain permission before editing it.
- Do not transcribe, summarize, or analyze the video in this Skill. Hand the validated local path to the next video-analysis workflow.

## Completion standard

A run is complete only when:

- the media file exists outside `.runtime/` and has a nonzero size;
- no `.part` or `.tmp` file is presented as the result;
- the file has a SHA-256 digest and the available duration/resolution metadata has been collected;
- `videos/download_manifest.jsonl` contains the source URL, platform, title, author, video ID, relative file path, size, hash, and download time;
- temporary browser-session data has been removed.
