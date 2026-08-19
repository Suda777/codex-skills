#!/usr/bin/env python3
"""Route one shared public-video link to the bundled downloader and archive it."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any

from video_common import (
    detect_platform,
    extract_url,
    find_existing,
    iter_media_files,
    manifest_record,
    probe_media,
    sanitize_component,
    upsert_manifest,
)


SKILL_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = SKILL_ROOT / ".runtime"
TOOLS_ROOT = SKILL_ROOT / "tools"
DOUYIN_ROOT = TOOLS_ROOT / "douyin-downloader"
YT_DLP_ROOT = TOOLS_ROOT / "yt-dlp"


def runtime_python() -> Path:
    if os.name == "nt":
        return RUNTIME_ROOT / "venv" / "Scripts" / "python.exe"
    return RUNTIME_ROOT / "venv" / "bin" / "python"


def tool_environment(tool_root: Path | None = None) -> dict[str, str]:
    environment = os.environ.copy()
    if tool_root:
        previous = environment.get("PYTHONPATH")
        environment["PYTHONPATH"] = str(tool_root) + (os.pathsep + previous if previous else "")
    environment["PLAYWRIGHT_BROWSERS_PATH"] = str(RUNTIME_ROOT / "browsers")
    environment["TMPDIR"] = str(RUNTIME_ROOT / "tmp")
    return environment


def ensure_runtime() -> None:
    executable = runtime_python()
    if not executable.is_file():
        raise RuntimeError(
            f"Skill runtime is missing. With network permission, run: "
            f"python3 {SKILL_ROOT / 'scripts' / 'setup_runtime.py'}"
        )


def capture_anonymous_session(url: str, job_dir: Path) -> dict[str, Any]:
    session_path = job_dir / "browser-session.json"
    command = [
        str(runtime_python()),
        str(SKILL_ROOT / "scripts" / "capture_browser_session.py"),
        url,
        "--output",
        str(session_path),
    ]
    subprocess.run(command, check=True, env=tool_environment(), cwd=job_dir)
    return json.loads(session_path.read_text(encoding="utf-8"))


def write_netscape_cookies(session: dict[str, Any], path: Path) -> None:
    lines = ["# Netscape HTTP Cookie File", "# Temporary anonymous session"]
    for item in session.get("cookies", []):
        name = str(item.get("name") or "")
        value = str(item.get("value") or "")
        domain = str(item.get("domain") or "")
        if not name or not domain:
            continue
        include_subdomains = "TRUE" if domain.startswith(".") else "FALSE"
        secure = "TRUE" if item.get("secure") else "FALSE"
        expires = item.get("expires")
        try:
            expiry = str(max(0, int(float(expires)))) if expires else "0"
        except (TypeError, ValueError):
            expiry = "0"
        cookie_path = str(item.get("path") or "/")
        lines.append(
            "\t".join([domain, include_subdomains, cookie_path, secure, expiry, name, value])
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    if os.name != "nt":
        path.chmod(0o600)


def yt_dlp_command(*arguments: str) -> list[str]:
    return [str(runtime_python()), "-m", "yt_dlp", *arguments]


def get_yt_metadata(url: str, cookie_path: Path | None = None) -> dict[str, Any]:
    command = yt_dlp_command(
        "--no-playlist",
        "--no-warnings",
        "--impersonate",
        "chrome",
        "--dump-single-json",
    )
    if cookie_path:
        command.extend(["--cookies", str(cookie_path)])
    command.append(url)
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        env=tool_environment(YT_DLP_ROOT),
        timeout=180,
    )
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "metadata extraction failed").strip()
        raise RuntimeError(message.splitlines()[-1])
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("yt-dlp returned invalid metadata") from exc


def find_ffmpeg() -> str | None:
    executable = shutil.which("ffmpeg")
    if executable:
        return executable
    command = [
        str(runtime_python()),
        "-c",
        "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())",
    ]
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return None
    candidate = result.stdout.strip()
    return candidate if candidate and Path(candidate).is_file() else None


def select_downloaded_file(directory: Path, stem: str) -> Path | None:
    candidates = [
        path
        for path in directory.glob(f"{stem}.*")
        if path.is_file()
        and path.suffix.lower() not in {".part", ".tmp", ".json", ".ytdl"}
        and not path.name.endswith((".info.json", ".description"))
    ]
    return max(candidates, key=lambda item: item.stat().st_size) if candidates else None


def download_with_yt_dlp(
    *,
    url: str,
    platform: str,
    videos_root: Path,
    manifest_path: Path,
    job_dir: Path,
    browser_fallback: bool,
) -> tuple[Path, dict[str, Any], str]:
    cookie_path: Path | None = None
    effective_url = url
    try:
        metadata = get_yt_metadata(effective_url)
    except RuntimeError as direct_error:
        if platform == "bilibili" and "412" in str(direct_error):
            return download_bilibili_fallback(url, videos_root, job_dir)
        if not browser_fallback:
            if platform == "bilibili":
                return download_bilibili_fallback(url, videos_root, job_dir)
            raise
        try:
            session = capture_anonymous_session(url, job_dir)
            effective_url = str(session.get("final_url") or url)
            cookie_path = job_dir / "cookies.txt"
            write_netscape_cookies(session, cookie_path)
            metadata = get_yt_metadata(effective_url, cookie_path)
        except Exception as fallback_error:
            if platform == "bilibili":
                return download_bilibili_fallback(url, videos_root, job_dir)
            raise RuntimeError(
                f"Public extraction failed ({direct_error}); anonymous browser retry failed "
                f"({fallback_error})"
            ) from fallback_error

    video_id = str(metadata.get("id") or hashlib.sha256(url.encode()).hexdigest()[:12])
    existing = find_existing(manifest_path, videos_root, url, platform, video_id)
    if existing:
        return existing, metadata, video_id

    author = sanitize_component(
        metadata.get("uploader") or metadata.get("channel") or metadata.get("creator"),
        "unknown-author",
    )
    title = sanitize_component(metadata.get("title"), "untitled-video", limit=150)
    safe_id = sanitize_component(video_id, "unknown-id", limit=80)
    stem = f"{title}_{safe_id}"
    destination = videos_root / platform / author
    destination.mkdir(parents=True, exist_ok=True)
    existing_file = select_downloaded_file(destination, stem)
    if existing_file:
        return existing_file, metadata, video_id

    output_template = str(destination / f"{stem}.%(ext)s")
    command = yt_dlp_command(
        "--no-playlist",
        "--newline",
        "--impersonate",
        "chrome",
        "--retries",
        "3",
        "--fragment-retries",
        "3",
        "-o",
        output_template,
    )
    if cookie_path:
        command.extend(["--cookies", str(cookie_path)])
    ffmpeg = find_ffmpeg()
    if ffmpeg:
        command.extend(
            ["-f", "bv*+ba/b", "--merge-output-format", "mp4", "--ffmpeg-location", ffmpeg]
        )
    else:
        command.extend(["-f", "b[ext=mp4]/b"])
    command.append(effective_url)
    result = subprocess.run(command, env=tool_environment(YT_DLP_ROOT))
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp download failed with exit code {result.returncode}")
    media_path = select_downloaded_file(destination, stem)
    if not media_path:
        raise RuntimeError("yt-dlp exited without producing a final media file")
    return media_path, metadata, video_id


def download_bilibili_fallback(
    url: str, videos_root: Path, job_dir: Path
) -> tuple[Path, dict[str, Any], str]:
    result_path = job_dir / "bilibili-result.json"
    command = [
        str(runtime_python()),
        str(SKILL_ROOT / "scripts" / "bilibili_fallback.py"),
        url,
        "--output-root",
        str(videos_root),
        "--job-dir",
        str(job_dir),
        "--result",
        str(result_path),
    ]
    completed = subprocess.run(command, env=tool_environment(), cwd=job_dir)
    if completed.returncode != 0 or not result_path.is_file():
        raise RuntimeError(
            f"Bilibili public API fallback failed with exit code {completed.returncode}"
        )
    metadata = json.loads(result_path.read_text(encoding="utf-8"))
    media_path = Path(str(metadata.get("file_path") or ""))
    if not media_path.is_file():
        raise RuntimeError("Bilibili fallback produced no final media file")
    video_id = str(metadata.get("id") or media_path.stem.rsplit("_", 1)[-1])
    return media_path, metadata, video_id


def write_douyin_config(
    path: Path, url: str, output_path: Path, cookies: dict[str, Any] | None
) -> None:
    config = {
        "link": [url],
        "path": str(output_path),
        "video": True,
        "music": False,
        "cover": False,
        "avatar": False,
        "json": False,
        "folderstyle": False,
        "filename_template": "{title}_{id}",
        "author_dir": "nickname",
        "video_quality": "highest",
        "thread": 1,
        "retry_times": 3,
        "proxy": "",
        "database": False,
        "progress": {"quiet_logs": False},
        "transcript": {"enabled": False},
        "comments": {"enabled": False},
        "notifications": {"enabled": False},
        "cookies": cookies or {},
    }
    path.write_text(json.dumps(config, ensure_ascii=False), encoding="utf-8")
    if os.name != "nt":
        path.chmod(0o600)


def run_douyin(url: str, output_path: Path, job_dir: Path, cookies: dict[str, Any] | None) -> int:
    config_path = job_dir / "douyin-config.json"
    write_douyin_config(config_path, url, output_path, cookies)
    command = [str(runtime_python()), "-m", "cli.main", "-c", str(config_path)]
    result = subprocess.run(
        command,
        cwd=job_dir,
        env=tool_environment(DOUYIN_ROOT),
        stdin=subprocess.DEVNULL,
    )
    return result.returncode


def latest_douyin_manifest_record(output_path: Path) -> dict[str, Any]:
    manifest = output_path / "download_manifest.jsonl"
    if not manifest.exists():
        return {}
    for line in reversed(manifest.read_text(encoding="utf-8").splitlines()):
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(record, dict):
            return record
    return {}


def path_from_douyin_record(output_path: Path, record: dict[str, Any]) -> Path | None:
    for value in reversed(record.get("file_paths") or []):
        candidate = output_path / str(value)
        if candidate.is_file() and candidate.suffix.lower() in {
            ".mp4",
            ".mkv",
            ".webm",
            ".mov",
            ".flv",
            ".m4v",
        }:
            return candidate
    return None


def download_douyin(
    *,
    url: str,
    videos_root: Path,
    manifest_path: Path,
    job_dir: Path,
    browser_fallback: bool,
) -> tuple[Path, dict[str, Any], str]:
    existing = find_existing(manifest_path, videos_root, url, "douyin")
    if existing:
        return existing, {}, "unknown"

    output_path = videos_root / "douyin"
    output_path.mkdir(parents=True, exist_ok=True)
    before = {path.resolve() for path in iter_media_files(output_path)}
    direct_code = run_douyin(url, output_path, job_dir, cookies=None)
    after = {path.resolve() for path in iter_media_files(output_path)}
    new_files = after - before

    if not new_files and browser_fallback:
        session = capture_anonymous_session(url, job_dir)
        cookies = session.get("cookie_dict") or {}
        if not cookies:
            raise RuntimeError("Anonymous browser session produced no usable cookies")
        retry_code = run_douyin(url, output_path, job_dir, cookies=cookies)
        after = {path.resolve() for path in iter_media_files(output_path)}
        new_files = after - before
    else:
        retry_code = direct_code

    source_record = latest_douyin_manifest_record(output_path)
    media_path = max(new_files, key=lambda item: item.stat().st_size) if new_files else None
    if media_path is None:
        media_path = path_from_douyin_record(output_path, source_record)
    if media_path is None:
        raise RuntimeError(
            f"Douyin downloader produced no final media file (exit code {retry_code})"
        )

    video_id = str(source_record.get("aweme_id") or media_path.stem.rsplit("_", 1)[-1])
    metadata = {
        "id": video_id,
        "title": source_record.get("desc") or media_path.stem.rsplit("_", 1)[0],
        "uploader": source_record.get("author_name") or media_path.parent.name,
    }
    return media_path, metadata, video_id


def build_result(
    *,
    source_url: str,
    platform: str,
    videos_root: Path,
    manifest_path: Path,
    media_path: Path,
    metadata: dict[str, Any],
    video_id: str,
) -> dict[str, Any]:
    validation = probe_media(media_path, metadata)
    title = str(metadata.get("title") or media_path.stem.rsplit("_", 1)[0])
    author = str(
        metadata.get("uploader")
        or metadata.get("channel")
        or metadata.get("creator")
        or media_path.parent.name
    )
    record = manifest_record(
        videos_root=videos_root,
        media_path=media_path,
        source_url=source_url,
        platform=platform,
        title=title,
        author=author,
        video_id=video_id,
        validation=validation,
    )
    upsert_manifest(manifest_path, record)
    return {
        "status": "success",
        "platform": platform,
        "source_url": source_url,
        "file_path": str(media_path.resolve()),
        "manifest_path": str(manifest_path.resolve()),
        "validation": validation,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("share_text", help="A URL or copied share text containing a URL")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--output-root", type=Path)
    parser.add_argument("--no-browser-fallback", action="store_true")
    parser.add_argument("--keep-job", action="store_true", help="Keep temporary state for debugging")
    parser.add_argument("--dry-run", action="store_true", help="Show routing without downloading")
    args = parser.parse_args()

    try:
        url = extract_url(args.share_text)
        platform = detect_platform(url)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    project_root = args.project_root.expanduser().resolve()
    videos_root = (args.output_root or (project_root / "videos")).expanduser().resolve()
    manifest_path = videos_root / "download_manifest.jsonl"
    if args.dry_run:
        primary_tool = {
            "douyin": "douyin-downloader",
            "wechat-channels": "public yt-dlp/generic probe, then safe public GitHub fallback",
        }.get(platform, "yt-dlp")
        print(
            json.dumps(
                {
                    "url": url,
                    "platform": platform,
                    "videos_root": str(videos_root),
                    "primary_tool": primary_tool,
                    "runtime_ready": runtime_python().is_file(),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    try:
        ensure_runtime()
        videos_root.mkdir(parents=True, exist_ok=True)
        jobs_root = RUNTIME_ROOT / "jobs"
        jobs_root.mkdir(parents=True, exist_ok=True)
        job_dir = jobs_root / uuid.uuid4().hex
        job_dir.mkdir(mode=0o700)
        try:
            if platform == "douyin":
                media_path, metadata, video_id = download_douyin(
                    url=url,
                    videos_root=videos_root,
                    manifest_path=manifest_path,
                    job_dir=job_dir,
                    browser_fallback=not args.no_browser_fallback,
                )
            else:
                media_path, metadata, video_id = download_with_yt_dlp(
                    url=url,
                    platform=platform,
                    videos_root=videos_root,
                    manifest_path=manifest_path,
                    job_dir=job_dir,
                    browser_fallback=not args.no_browser_fallback,
                )
            result = build_result(
                source_url=url,
                platform=platform,
                videos_root=videos_root,
                manifest_path=manifest_path,
                media_path=media_path,
                metadata=metadata,
                video_id=video_id,
            )
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 0
        finally:
            if not args.keep_job:
                shutil.rmtree(job_dir, ignore_errors=True)
    except (OSError, RuntimeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
