---
name: download-video-from-link
description: Download, verify, and organize public videos from shared URLs or copied share text. Use when the user asks Codex to download, save, archive, or prepare a public linked video from Douyin, Bilibili, Xiaohongshu, WeChat Channels, YouTube, Weibo, Xigua, TikTok, X/Twitter, Instagram, Vimeo, or another website. Route known platforms to bundled downloaders; when they fail or the site is unsupported, research maintained public GitHub download methods and continue without logging in. Do not use to bypass paywalls, DRM, private access, or other authorization controls, or when the user only wants a summary without saving the video.
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
- WeChat Channels: recognize public `weixin.qq.com/sph/...` and related share links. Try a public extractor without account state first. If it fails, research a maintained public GitHub downloader, but do not install a root certificate, change the system proxy or TUN settings, intercept application traffic, or use authenticated state.
- Other sites: try the bundled `yt-dlp` extractor and generic extractor. Read [platform-strategies.md](references/platform-strategies.md) when routing or fallback behavior is unclear.
- If a bundled extractor fails or the platform is unsupported, search GitHub for a currently maintained public downloader or extractor. Inspect its source, maintenance state, license, dependencies, credential behavior, and safety before using it. Continue through safe no-login alternatives until the file is downloaded or a hard authorization or technical blocker is proven. Propose any permanent bundled-tool change separately; do not silently replace the Skill runtime.

## Browser and account boundaries

- Use only public requests or a new anonymous browser context. Do not read the user's existing browser profile, history, passwords, account cookies, or authenticated application state.
- Anonymous session cookies may exist only inside `.runtime/jobs/`; set owner-only permissions, never print their values, and delete the job directory after the attempt.
- Never log in, ask the user to log in, reuse an authenticated session, or route through WeChat, Yuanbao, Chrome, or another signed-in account. Authentication is outside this Skill even if it might make the download easier.
- Never bypass a paywall, DRM, private post, geographic restriction, deleted-content restriction, or another access control. If every safe public GitHub method still requires authentication or bypassing access control, report the exact blocker instead of claiming success.
- Do not install or trust a root certificate, alter the system proxy, enable TUN mode, or intercept application traffic as an automatic fallback.
- Download only content the user is authorized to access. Do not upload downloaded media to another service unless separately requested and authorized.
- Read [security-and-maintenance.md](references/security-and-maintenance.md) before changing credential handling or bundled tools.

## File-management rules

- Keep tools and their Python environment inside this Skill; never create per-project `.tools/` copies.
- Keep partial downloads as tool-managed temporary files and report them as failures. Only final media files belong in the manifest.
- Reuse an existing valid file when the manifest already contains the same platform/video ID or source URL.
- Do not edit `.gitignore` automatically. If the project uses Git and `videos/` is not ignored, recommend the change and obtain permission before editing it.
- Do not transcribe, summarize, or analyze the video in this Skill. If the original request also asks for analysis, hand the validated local path directly to the next video-analysis workflow without requiring the user to repeat the request.

## Completion standard

A run is complete only when:

- the media file exists outside `.runtime/` and has a nonzero size;
- no `.part` or `.tmp` file is presented as the result;
- the file has a SHA-256 digest and the available duration/resolution metadata has been collected;
- `videos/download_manifest.jsonl` contains the source URL, platform, title, author, video ID, relative file path, size, hash, and download time;
- temporary browser-session data has been removed.
