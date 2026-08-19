#!/usr/bin/env python3
"""Shared path, manifest, and media-validation helpers."""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse


MEDIA_SUFFIXES = {".mp4", ".mkv", ".webm", ".mov", ".flv", ".m4v"}
TEMP_SUFFIXES = {".part", ".tmp", ".ytdl"}


def extract_url(text: str) -> str:
    match = re.search(r"https?://[^\s<>\"']+", text)
    if match:
        return match.group(0).rstrip("，。！？；;、)]}>")
    bare = re.search(
        r"(?<![\w.-])(?:v\.douyin\.com|(?:www\.)?douyin\.com|b23\.tv|"
        r"(?:www\.)?bilibili\.com|xhslink\.com|(?:www\.)?xiaohongshu\.com|"
        r"weixin\.qq\.com|channels\.weixin\.qq\.com)/[^\s<>\"']+",
        text,
        re.IGNORECASE,
    )
    if bare:
        return ("https://" + bare.group(0)).rstrip("，。！？；;、)]}>")
    raise ValueError("No supported HTTP(S) or known share URL found in the supplied text")


def detect_platform(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().removeprefix("www.")
    if host == "douyin.com" or host.endswith(".douyin.com") or host.endswith("iesdouyin.com"):
        return "douyin"
    if host == "b23.tv" or host == "bilibili.com" or host.endswith(".bilibili.com"):
        return "bilibili"
    if host == "xhslink.com" or host == "xiaohongshu.com" or host.endswith(".xiaohongshu.com"):
        return "xiaohongshu"
    if host == "weixin.qq.com" or host.endswith(".weixin.qq.com"):
        return "wechat-channels"
    return "other"


def sanitize_component(value: Any, fallback: str, limit: int = 120) -> str:
    text = str(value or "").strip()
    text = re.sub(r"[\x00-\x1f\x7f]", "", text)
    text = re.sub(r"[\\/:*?\"<>|%]", "_", text)
    text = re.sub(r"\s+", " ", text).strip(" .")
    if not text:
        text = fallback
    return text[:limit].rstrip(" .") or fallback


def iter_media_files(root: Path) -> Iterable[Path]:
    if not root.exists():
        return []
    return (
        path
        for path in root.rglob("*")
        if path.is_file()
        and path.suffix.lower() in MEDIA_SUFFIXES
        and not any(path.name.endswith(suffix) for suffix in TEMP_SUFFIXES)
    )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def has_media_signature(path: Path) -> bool:
    with path.open("rb") as handle:
        header = handle.read(16)
    suffix = path.suffix.lower()
    if suffix in {".mp4", ".mov", ".m4v"}:
        return len(header) >= 12 and header[4:8] == b"ftyp"
    if suffix in {".mkv", ".webm"}:
        return header.startswith(b"\x1aE\xdf\xa3")
    if suffix == ".flv":
        return header.startswith(b"FLV")
    return False


def _ffprobe(path: Path) -> dict[str, Any]:
    executable = shutil.which("ffprobe")
    if not executable:
        return {}
    command = [
        executable,
        "-v",
        "error",
        "-show_entries",
        "format=duration,format_name:stream=codec_type,codec_name,width,height",
        "-of",
        "json",
        str(path),
    ]
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
        payload = json.loads(result.stdout)
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError):
        return {}
    video_stream = next(
        (stream for stream in payload.get("streams", []) if stream.get("codec_type") == "video"),
        {},
    )
    audio_stream = next(
        (stream for stream in payload.get("streams", []) if stream.get("codec_type") == "audio"),
        {},
    )
    return {
        "duration_seconds": _as_float(payload.get("format", {}).get("duration")),
        "width": _as_int(video_stream.get("width")),
        "height": _as_int(video_stream.get("height")),
        "video_codec": video_stream.get("codec_name"),
        "audio_codec": audio_stream.get("codec_name"),
        "container": payload.get("format", {}).get("format_name"),
    }


def _mdls(path: Path) -> dict[str, Any]:
    executable = shutil.which("mdls")
    if not executable:
        return {}
    attributes = [
        "kMDItemDurationSeconds",
        "kMDItemPixelWidth",
        "kMDItemPixelHeight",
        "kMDItemCodecs",
    ]
    command = [executable]
    for attribute in attributes:
        command.extend(["-name", attribute])
    command.append(str(path))
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return {}
    values: dict[str, Any] = {}
    duration = re.search(r"kMDItemDurationSeconds\s*=\s*([0-9.]+)", result.stdout)
    width = re.search(r"kMDItemPixelWidth\s*=\s*(\d+)", result.stdout)
    height = re.search(r"kMDItemPixelHeight\s*=\s*(\d+)", result.stdout)
    codecs = re.findall(r'"([^\"]+)"', result.stdout)
    if duration:
        values["duration_seconds"] = float(duration.group(1))
    if width:
        values["width"] = int(width.group(1))
    if height:
        values["height"] = int(height.group(1))
    if codecs:
        values["codecs"] = codecs
    return values


def _as_int(value: Any) -> int | None:
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _as_float(value: Any) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def probe_media(path: Path, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    path = path.resolve()
    if not path.is_file():
        raise FileNotFoundError(path)
    if path.suffix.lower() not in MEDIA_SUFFIXES or any(
        path.name.endswith(suffix) for suffix in TEMP_SUFFIXES
    ):
        raise ValueError(f"Not a final supported media file: {path}")
    size = path.stat().st_size
    if size <= 0:
        raise ValueError(f"Media file is empty: {path}")
    if not has_media_signature(path):
        raise ValueError(f"Media signature does not match the file extension: {path}")

    supplied = metadata or {}
    probed = _ffprobe(path)
    if not probed:
        probed = _mdls(path)
    return {
        "file_path": str(path),
        "size_bytes": size,
        "sha256": sha256_file(path),
        "duration_seconds": probed.get("duration_seconds") or _as_float(supplied.get("duration")),
        "width": probed.get("width") or _as_int(supplied.get("width")),
        "height": probed.get("height") or _as_int(supplied.get("height")),
        "video_codec": probed.get("video_codec"),
        "audio_codec": probed.get("audio_codec"),
        "codecs": probed.get("codecs"),
        "container": probed.get("container") or path.suffix.lower().lstrip("."),
    }


def read_manifest(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            records.append(value)
    return records


def find_existing(
    manifest_path: Path,
    videos_root: Path,
    source_url: str,
    platform: str,
    video_id: str | None = None,
) -> Path | None:
    for record in reversed(read_manifest(manifest_path)):
        same_source = record.get("source_url") == source_url
        same_id = bool(video_id) and record.get("platform") == platform and str(
            record.get("video_id")
        ) == str(video_id)
        if not (same_source or same_id):
            continue
        candidate = videos_root / str(record.get("file_path", ""))
        if candidate.is_file() and candidate.stat().st_size > 0:
            return candidate.resolve()
    return None


def upsert_manifest(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    records = read_manifest(path)
    filtered = [
        item
        for item in records
        if not (
            item.get("source_url") == record.get("source_url")
            or (
                item.get("platform") == record.get("platform")
                and str(item.get("video_id")) == str(record.get("video_id"))
            )
        )
    ]
    filtered.append(record)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    temporary = Path(temporary_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            for item in filtered:
                handle.write(json.dumps(item, ensure_ascii=False, sort_keys=True) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def manifest_record(
    *,
    videos_root: Path,
    media_path: Path,
    source_url: str,
    platform: str,
    title: str,
    author: str,
    video_id: str,
    validation: dict[str, Any],
) -> dict[str, Any]:
    return {
        "downloaded_at": datetime.now(timezone.utc).isoformat(),
        "source_url": source_url,
        "platform": platform,
        "video_id": video_id,
        "title": title,
        "author": author,
        "file_path": str(media_path.resolve().relative_to(videos_root.resolve())),
        "size_bytes": validation["size_bytes"],
        "sha256": validation["sha256"],
        "duration_seconds": validation.get("duration_seconds"),
        "width": validation.get("width"),
        "height": validation.get("height"),
        "container": validation.get("container"),
    }
