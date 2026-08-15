#!/usr/bin/env python3
"""Download one public Bilibili video through the public playurl API fallback."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from curl_cffi import requests
from imageio_ffmpeg import get_ffmpeg_exe

from video_common import sanitize_component


HEADERS = {
    "Referer": "https://www.bilibili.com/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146 Safari/537.36",
}


def api_json(url: str, params: dict[str, object]) -> dict:
    response = requests.get(
        url,
        params=params,
        headers=HEADERS,
        impersonate="chrome",
        timeout=45,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("code") != 0:
        raise RuntimeError(f"Bilibili API returned code {payload.get('code')}: {payload.get('message')}")
    return payload.get("data") or {}


def resolve_bvid(url: str) -> tuple[str, str]:
    match = re.search(r"/((?:BV)[A-Za-z0-9]+)", url, re.IGNORECASE)
    if match:
        return match.group(1), url
    response = requests.get(
        url,
        headers=HEADERS,
        impersonate="chrome",
        allow_redirects=True,
        timeout=45,
    )
    response.raise_for_status()
    final_url = str(response.url)
    match = re.search(r"/((?:BV)[A-Za-z0-9]+)", final_url, re.IGNORECASE)
    if not match:
        raise RuntimeError("Unable to resolve a Bilibili BV id from the supplied link")
    return match.group(1), final_url


def choose_page(view: dict, url: str) -> dict:
    pages = view.get("pages") or []
    requested = parse_qs(urlparse(url).query).get("p", ["1"])[0]
    try:
        page_number = max(1, int(requested))
    except ValueError:
        page_number = 1
    for page in pages:
        if int(page.get("page") or 1) == page_number:
            return page
    if pages:
        return pages[0]
    return {"cid": view.get("cid"), "page": 1, "part": view.get("title")}


def media_url(item: dict) -> str:
    value = item.get("baseUrl") or item.get("base_url") or item.get("url")
    if value:
        return str(value)
    backups = item.get("backupUrl") or item.get("backup_url") or []
    return str(backups[0]) if backups else ""


def pick_best(items: list[dict]) -> dict:
    usable = [item for item in items if media_url(item)]
    if not usable:
        raise RuntimeError("Bilibili returned no downloadable media formats")
    return max(
        usable,
        key=lambda item: (
            int(item.get("id") or 0),
            int(item.get("bandwidth") or 0),
            int(item.get("width") or 0) * int(item.get("height") or 0),
        ),
    )


def download_stream(url: str, destination: Path, referer: str) -> None:
    headers = {**HEADERS, "Referer": referer}
    temporary = destination.with_suffix(destination.suffix + ".part")
    response = requests.get(
        url,
        headers=headers,
        impersonate="chrome",
        stream=True,
        timeout=120,
    )
    try:
        response.raise_for_status()
        with temporary.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)
            handle.flush()
            os.fsync(handle.fileno())
    finally:
        response.close()
    temporary.replace(destination)


def run(url: str, output_root: Path, job_dir: Path, metadata_only: bool) -> dict:
    bvid, resolved_url = resolve_bvid(url)
    view = api_json("https://api.bilibili.com/x/web-interface/view", {"bvid": bvid})
    page = choose_page(view, resolved_url)
    cid = page.get("cid")
    if not cid:
        raise RuntimeError("Bilibili metadata did not contain a cid")
    play = api_json(
        "https://api.bilibili.com/x/player/playurl",
        {"bvid": bvid, "cid": cid, "qn": 127, "fnval": 4048, "fourk": 1},
    )
    dash = play.get("dash") or {}
    video = pick_best(dash.get("video") or [])
    audio = pick_best(dash.get("audio") or [])

    page_number = int(page.get("page") or 1)
    video_id = bvid if page_number == 1 else f"{bvid}_p{page_number}"
    title = str(view.get("title") or bvid)
    if page_number > 1 and page.get("part"):
        title = f"{title}_{page.get('part')}"
    author = str((view.get("owner") or {}).get("name") or "unknown-author")
    metadata = {
        "id": video_id,
        "title": title,
        "uploader": author,
        "duration": page.get("duration") or view.get("duration"),
        "width": video.get("width"),
        "height": video.get("height"),
        "webpage_url": resolved_url,
        "selected_video_format": video.get("id"),
        "selected_audio_format": audio.get("id"),
    }
    if metadata_only:
        return metadata

    author_dir = output_root / "bilibili" / sanitize_component(author, "unknown-author")
    author_dir.mkdir(parents=True, exist_ok=True)
    stem = (
        f"{sanitize_component(title, 'untitled-video', limit=150)}_"
        f"{sanitize_component(video_id, 'unknown-id', limit=80)}"
    )
    output_path = author_dir / f"{stem}.mp4"
    if output_path.is_file() and output_path.stat().st_size > 0:
        return {**metadata, "file_path": str(output_path.resolve())}

    video_part = job_dir / "video.m4s"
    audio_part = job_dir / "audio.m4s"
    download_stream(media_url(video), video_part, resolved_url)
    download_stream(media_url(audio), audio_part, resolved_url)
    temporary_output = job_dir / "merged.mp4"
    command = [
        get_ffmpeg_exe(),
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(video_part),
        "-i",
        str(audio_part),
        "-c",
        "copy",
        str(temporary_output),
    ]
    subprocess.run(command, check=True)
    temporary_output.replace(output_path)
    return {**metadata, "file_path": str(output_path.resolve())}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--job-dir", type=Path, required=True)
    parser.add_argument("--result", type=Path, required=True)
    parser.add_argument("--metadata-only", action="store_true")
    args = parser.parse_args()
    result = run(args.url, args.output_root.resolve(), args.job_dir.resolve(), args.metadata_only)
    args.result.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    print(
        json.dumps(
            {
                "status": "metadata" if args.metadata_only else "success",
                "video_id": result.get("id"),
                "file_path": result.get("file_path"),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
