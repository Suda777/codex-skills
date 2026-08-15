# Platform strategies

## Primary routes

| Platform | Domains | Primary tool | Anonymous fallback |
| --- | --- | --- | --- |
| Douyin | `douyin.com`, `v.douyin.com`, `iesdouyin.com` | Bundled `douyin-downloader` | Fresh Playwright context using system Chrome |
| Bilibili | `bilibili.com`, `b23.tv` | Bundled `yt-dlp` Bilibili extractor | Fresh browser context, then the bundled public `playurl` API adapter when yt-dlp receives HTTP 412 |
| Xiaohongshu | `xiaohongshu.com`, `xhslink.com` | Bundled `yt-dlp` XiaoHongShu extractor | Resolve the short link and retry with fresh browser cookies |
| Other | Any HTTP(S) host | Bundled `yt-dlp` site or generic extractor | Research a maintained site-specific tool after a confirmed extractor failure |

## Generic coverage

The bundled `yt-dlp` is the first choice for YouTube, Weibo, Xigua, TikTok, X/Twitter, Instagram, Vimeo, and other sites listed by the pinned release. A listed extractor is not a guarantee that every current URL works; sites frequently change URL schemes and risk-control behavior.

For Xiaohongshu, prefer a freshly copied full share link containing its current `xsec_token`. Tokens expire, and some IPs are redirected to a login/error page even for public posts. Do not describe the platform as verified until a real current link completes on the active device.

## Fallback order

1. Public extractor with no cookies.
2. Same extractor with a fresh anonymous browser session created by this Skill.
3. A maintained platform-specific downloader found through current-source research.
4. Authenticated session only after explicit user authorization.

Stop when the content is private, paid, DRM-protected, deleted, region-blocked, or otherwise unavailable to the user. Do not interpret a technical workaround as authorization.

## Output behavior

- Download one video per supplied link; never expand a profile, collection, playlist, or channel unless the user explicitly requests batch download.
- Prefer the best available video and audio. When no merger is available, prefer the best single-file MP4 rather than failing silently.
- Preserve the platform video ID in the filename to support deduplication.
- Treat image posts, audio-only posts, live streams, and playlists as separate future capabilities unless the user's request explicitly requires them.
