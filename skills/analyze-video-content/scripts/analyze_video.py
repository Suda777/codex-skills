#!/usr/bin/env python3
"""Extract traceable speech, visible text, and speaker turns from a local video."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import re
import subprocess
import sys
import time
import unicodedata
import wave
from difflib import SequenceMatcher
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Iterable

import numpy as np


SKILL_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = SKILL_ROOT / ".runtime"
RUNTIME_MANIFEST = RUNTIME_ROOT / "runtime.json"


def package_version(name: str) -> str | None:
    try:
        return version(name)
    except PackageNotFoundError:
        return None


def read_runtime_manifest() -> dict[str, object]:
    if not RUNTIME_MANIFEST.is_file():
        raise RuntimeError("runtime.json is missing; run setup_runtime.py first")
    return json.loads(RUNTIME_MANIFEST.read_text(encoding="utf-8"))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(value: str) -> str:
    cleaned = re.sub(r"[\\/:*?\"<>|\x00-\x1f]+", "_", value).strip(" ._")
    if len(cleaned) <= 72:
        return cleaned or "video"
    suffix = hashlib.sha1(cleaned.encode("utf-8")).hexdigest()[:8]
    return f"{cleaned[:72].rstrip()}_{suffix}"


def run(command: list[str], *, timeout: int | None = None, capture: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        timeout=timeout,
    )


def ffmpeg_path() -> Path:
    try:
        import imageio_ffmpeg
    except ImportError as exc:
        raise RuntimeError("imageio-ffmpeg is missing from the Skill runtime") from exc
    path = Path(imageio_ffmpeg.get_ffmpeg_exe())
    if not path.is_file():
        raise RuntimeError(f"FFmpeg executable is missing: {path}")
    return path


def probe_video(ffmpeg: Path, video: Path) -> dict[str, object]:
    result = subprocess.run(
        [str(ffmpeg), "-hide_banner", "-i", str(video)],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    text = result.stderr
    duration_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", text)
    resolution_match = re.search(r"Video:.*?\b(\d{2,5})x(\d{2,5})\b", text)
    if not duration_match:
        raise RuntimeError("FFmpeg could not determine the video duration")
    hours, minutes, seconds = duration_match.groups()
    duration = int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    return {
        "duration_seconds": round(duration, 3),
        "width": int(resolution_match.group(1)) if resolution_match else None,
        "height": int(resolution_match.group(2)) if resolution_match else None,
        "has_audio": "Audio:" in text,
        "has_embedded_subtitles": "Subtitle:" in text,
    }


def extract_audio(ffmpeg: Path, video: Path, audio: Path, force: bool) -> None:
    if audio.is_file() and audio.stat().st_size > 0 and not force:
        return
    run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(video),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            str(audio),
        ]
    )


def extract_embedded_subtitles(ffmpeg: Path, video: Path, output: Path) -> str | None:
    result = subprocess.run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(video),
            "-map",
            "0:s:0",
            str(output),
        ],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode == 0 and output.is_file() and output.stat().st_size > 0:
        return None
    return (result.stderr or "embedded subtitle extraction failed").strip()


SRT_TIME = re.compile(
    r"(?P<sh>\d{2}):(?P<sm>\d{2}):(?P<ss>\d{2})[,\.](?P<sms>\d{3})\s*-->\s*"
    r"(?P<eh>\d{2}):(?P<em>\d{2}):(?P<es>\d{2})[,\.](?P<ems>\d{3})"
)


def srt_seconds(match: re.Match[str], prefix: str) -> float:
    return (
        int(match.group(f"{prefix}h")) * 3600
        + int(match.group(f"{prefix}m")) * 60
        + int(match.group(f"{prefix}s"))
        + int(match.group(f"{prefix}ms")) / 1000
    )


def parse_srt(path: Path) -> list[dict[str, object]]:
    content = path.read_text(encoding="utf-8-sig", errors="replace").replace("\r\n", "\n")
    records: list[dict[str, object]] = []
    for block in re.split(r"\n\s*\n", content.strip()):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        timing_index = next((index for index, line in enumerate(lines) if "-->" in line), None)
        if timing_index is None:
            continue
        match = SRT_TIME.search(lines[timing_index])
        if not match:
            continue
        text = " ".join(lines[timing_index + 1 :]).strip()
        if not text:
            continue
        records.append(
            {
                "start": round(srt_seconds(match, "s"), 3),
                "end": round(srt_seconds(match, "e"), 3),
                "text": text,
                "source": "asr",
            }
        )
    return records


def write_jsonl(path: Path, records: Iterable[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def transcribe(
    whisper_cli: Path,
    model_path: Path,
    audio: Path,
    output_prefix: Path,
    language: str,
    portable: bool,
    threads: int,
    force: bool,
) -> list[dict[str, object]]:
    srt_path = output_prefix.with_suffix(".srt")
    jsonl_path = output_prefix.with_suffix(".jsonl")
    if srt_path.is_file() and jsonl_path.is_file() and not force:
        return [json.loads(line) for line in jsonl_path.read_text(encoding="utf-8").splitlines() if line]
    command = [
        str(whisper_cli),
        "-m",
        str(model_path),
        "-f",
        str(audio),
        "-l",
        language,
        "-t",
        str(max(1, threads)),
        "-osrt",
        "-of",
        str(output_prefix),
        "--suppress-nst",
        "--print-progress",
    ]
    if portable:
        command.append("--no-gpu")
    run(command)
    if not srt_path.is_file():
        raise RuntimeError("whisper.cpp did not create asr.srt")
    records = parse_srt(srt_path)
    if not records:
        raise RuntimeError("ASR produced no non-empty segments")
    write_jsonl(jsonl_path, records)
    return records


def extract_frames(
    ffmpeg: Path,
    video: Path,
    frames: Path,
    fps: float,
    x_start: float,
    x_end: float,
    y_start: float,
    y_end: float,
    force: bool,
) -> list[Path]:
    existing = sorted(frames.glob("frame_*.jpg"))
    if existing and not force:
        return existing
    frames.mkdir(parents=True, exist_ok=True)
    crop = f"crop=iw*{x_end - x_start:.6f}:ih*{y_end - y_start:.6f}:iw*{x_start:.6f}:ih*{y_start:.6f}"
    run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(video),
            "-vf",
            f"fps={fps:.6f},{crop}",
            "-q:v",
            "3",
            str(frames / "frame_%08d.jpg"),
        ]
    )
    return sorted(frames.glob("frame_*.jpg"))


def normalized_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text)
    return re.sub(r"[\W_]+", "", normalized, flags=re.UNICODE).lower()


def dedupe_ocr(observations: list[dict[str, object]], interval: float) -> list[dict[str, object]]:
    merged: list[dict[str, object]] = []
    for item in observations:
        text = str(item["text"]).strip()
        if len(normalized_text(text)) < 2:
            continue
        if merged:
            previous = merged[-1]
            ratio = SequenceMatcher(None, normalized_text(str(previous["text"])), normalized_text(text)).ratio()
            if ratio >= 0.88:
                previous["end"] = round(float(item["start"]) + interval, 3)
                previous["confidence"] = round(max(float(previous["confidence"]), float(item["confidence"])), 5)
                if len(text) > len(str(previous["text"])):
                    previous["text"] = text
                continue
        merged.append(
            {
                "start": round(float(item["start"]), 3),
                "end": round(float(item["start"]) + interval, 3),
                "text": text,
                "source": "ocr",
                "confidence": round(float(item["confidence"]), 5),
            }
        )
    return merged


def portable_ocr(frame_paths: list[Path], fps: float, min_confidence: float) -> list[dict[str, object]]:
    from rapidocr import RapidOCR

    engine = RapidOCR()
    observations: list[dict[str, object]] = []
    for index, frame in enumerate(frame_paths):
        result = engine(frame)
        if not result or not result.txts:
            continue
        pairs = []
        image_width = float(result.img.shape[1])
        for text, score, box in zip(result.txts, result.scores, result.boxes):
            text = str(text).strip()
            score = float(score)
            if not text or score < min_confidence:
                continue
            x_values = [float(point[0]) for point in box]
            box_width = max(x_values) - min(x_values)
            center_x = (max(x_values) + min(x_values)) / 2
            is_small_edge_label = (
                (center_x < image_width * 0.12 or center_x > image_width * 0.88)
                and box_width < image_width * 0.35
            )
            if is_small_edge_label:
                continue
            pairs.append((text, score))
        if not pairs:
            continue
        observations.append(
            {
                "start": index / fps,
                "text": " ".join(text for text, _ in pairs),
                "confidence": sum(score for _, score in pairs) / len(pairs),
            }
        )
    return dedupe_ocr(observations, 1 / fps)


def macos_ocr(frame_paths: list[Path], fps: float) -> list[dict[str, object]]:
    if platform.system() != "Darwin":
        raise RuntimeError("Apple Vision OCR requires macOS")
    if not frame_paths:
        return []
    script = Path(__file__).with_name("ocr_macos.swift")
    result = run(["/usr/bin/swift", str(script), str(frame_paths[0].parent)], capture=True)
    positions = {path.name: index for index, path in enumerate(frame_paths)}
    observations = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        if item["file"] not in positions:
            continue
        observations.append(
            {
                "start": positions[item["file"]] / fps,
                "text": item["text"],
                "confidence": item["confidence"],
            }
        )
    return dedupe_ocr(observations, 1 / fps)


def read_pcm16_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as handle:
        if handle.getnchannels() != 1 or handle.getframerate() != 16000 or handle.getsampwidth() != 2:
            raise RuntimeError("diarization input must be mono 16 kHz PCM16 WAV")
        samples = np.frombuffer(handle.readframes(handle.getnframes()), dtype="<i2")
    return samples.astype(np.float32) / 32768.0


def diarize(audio: Path, segmentation_model: Path, embedding_model: Path, speakers: int, threads: int) -> list[dict[str, object]]:
    import sherpa_onnx

    pyannote = sherpa_onnx.OfflineSpeakerSegmentationPyannoteModelConfig(model=str(segmentation_model))
    segmentation = sherpa_onnx.OfflineSpeakerSegmentationModelConfig(
        pyannote=pyannote,
        num_threads=max(1, threads),
        provider="cpu",
    )
    embedding = sherpa_onnx.SpeakerEmbeddingExtractorConfig(
        model=str(embedding_model),
        num_threads=max(1, threads),
        provider="cpu",
    )
    clustering = sherpa_onnx.FastClusteringConfig(num_clusters=speakers if speakers > 0 else -1, threshold=0.5)
    config = sherpa_onnx.OfflineSpeakerDiarizationConfig(
        segmentation=segmentation,
        embedding=embedding,
        clustering=clustering,
        min_duration_on=0.3,
        min_duration_off=0.5,
    )
    if not config.validate():
        raise RuntimeError(f"invalid sherpa-onnx diarization config: {config}")
    pipeline = sherpa_onnx.OfflineSpeakerDiarization(config)
    result = pipeline.process(read_pcm16_wav(audio))
    return [
        {
            "start": round(float(segment.start), 3),
            "end": round(float(segment.end), 3),
            "speaker": f"SPEAKER_{int(segment.speaker):02d}",
        }
        for segment in result.sort_by_start_time()
    ]


def overlap(a_start: float, a_end: float, b_start: float, b_end: float) -> float:
    return max(0.0, min(a_end, b_end) - max(a_start, b_start))


def merge_timeline(
    asr: list[dict[str, object]], ocr: list[dict[str, object]], speakers: list[dict[str, object]]
) -> list[dict[str, object]]:
    timeline = []
    for segment in asr:
        start, end = float(segment["start"]), float(segment["end"])
        best_speaker = "SPEAKER_UNKNOWN"
        best_overlap = 0.0
        for speaker_segment in speakers:
            amount = overlap(start, end, float(speaker_segment["start"]), float(speaker_segment["end"]))
            if amount > best_overlap:
                best_overlap = amount
                best_speaker = str(speaker_segment["speaker"])
        visible = [
            str(item["text"])
            for item in ocr
            if overlap(start - 0.75, end + 0.75, float(item["start"]), float(item["end"])) > 0
        ]
        timeline.append(
            {
                "start": start,
                "end": end,
                "speaker": best_speaker,
                "text": segment["text"],
                "visible_text": list(dict.fromkeys(visible)),
                "source": "asr+ocr" if visible else "asr",
            }
        )
    return timeline


def timestamp(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    hours, remainder = divmod(total, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def write_transcript(path: Path, video: Path, timeline: list[dict[str, object]]) -> None:
    lines = [f"# Transcript: {video.name}", "", "Speaker labels are anonymous clusters unless separately mapped with evidence.", ""]
    for item in timeline:
        lines.append(
            f"- [{timestamp(float(item['start']))}–{timestamp(float(item['end']))}] "
            f"**{item['speaker']}**: {item['text']}"
        )
        if item["visible_text"]:
            lines.append(f"  - Visible text: {' / '.join(item['visible_text'])}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--backend", choices=("auto", "macos", "portable"), default="auto")
    parser.add_argument("--language", default="zh")
    parser.add_argument("--model", default="base")
    parser.add_argument("--speakers", type=int, default=0, help="Known speaker count; 0 means auto")
    parser.add_argument("--threads", type=int, default=max(1, min(8, os.cpu_count() or 4)))
    parser.add_argument("--ocr-fps", type=float, default=0.5)
    parser.add_argument("--ocr-min-confidence", type=float, default=0.60)
    parser.add_argument("--ocr-x-start", type=float, default=0.10)
    parser.add_argument("--ocr-x-end", type=float, default=0.90)
    parser.add_argument("--ocr-y-start", type=float, default=0.62)
    parser.add_argument("--ocr-y-end", type=float, default=0.98)
    parser.add_argument("--skip-ocr", action="store_true")
    parser.add_argument("--skip-diarization", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    started = time.monotonic()
    video = args.video.expanduser().resolve()
    if not video.is_file() or video.stat().st_size <= 0:
        raise SystemExit(f"video does not exist or is empty: {video}")
    fractions = (args.ocr_x_start, args.ocr_x_end, args.ocr_y_start, args.ocr_y_end)
    if not (0 <= fractions[0] < fractions[1] <= 1 and 0 <= fractions[2] < fractions[3] <= 1):
        raise SystemExit("OCR crop fractions must satisfy 0 <= start < end <= 1")
    if args.ocr_fps <= 0:
        raise SystemExit("--ocr-fps must be positive")

    backend = args.backend
    if backend == "auto":
        backend = "macos" if platform.system() == "Darwin" else "portable"
    if backend == "macos" and platform.system() != "Darwin":
        raise SystemExit("--backend macos requires macOS")

    runtime = read_runtime_manifest()
    expected_profile = "native" if backend == "macos" else "portable"
    if runtime.get("profile") != expected_profile:
        raise SystemExit(
            f"runtime profile is {runtime.get('profile')!r}, expected {expected_profile!r}; "
            f"run setup_runtime.py --install --profile {expected_profile} --model {args.model}"
        )
    runtime_files = runtime.get("files", {})
    whisper_cli = Path(str(runtime_files.get("whisper_cli", {}).get("path", "")))
    model_path = RUNTIME_ROOT / "models" / "whisper" / f"ggml-{args.model}.bin"
    segmentation_model = Path(str(runtime_files.get("speaker_segmentation_model", {}).get("path", "")))
    embedding_model = Path(str(runtime_files.get("speaker_embedding_model", {}).get("path", "")))
    for required in (whisper_cli, model_path):
        if not required.is_file():
            raise SystemExit(f"runtime component is missing: {required}")

    output = (
        args.output_dir.expanduser().resolve()
        if args.output_dir
        else (Path.cwd() / "video-analysis" / safe_stem(video.stem)).resolve()
    )
    output.mkdir(parents=True, exist_ok=True)
    ffmpeg = ffmpeg_path()
    media = probe_video(ffmpeg, video)
    warnings: list[str] = []

    embedded_subtitles = None
    if media["has_embedded_subtitles"]:
        embedded_subtitles = output / "embedded.srt"
        error = extract_embedded_subtitles(ffmpeg, video, embedded_subtitles)
        if error:
            warnings.append(error)
            embedded_subtitles = None

    audio = output / "audio.wav"
    extract_audio(ffmpeg, video, audio, args.force)
    asr = transcribe(
        whisper_cli,
        model_path,
        audio,
        output / "asr",
        args.language,
        backend == "portable",
        args.threads,
        args.force,
    )

    ocr_path = output / "ocr.jsonl"
    ocr: list[dict[str, object]] = []
    if not args.skip_ocr:
        if ocr_path.is_file() and not args.force:
            ocr = [json.loads(line) for line in ocr_path.read_text(encoding="utf-8").splitlines() if line]
        else:
            frame_paths = extract_frames(
                ffmpeg,
                video,
                output / "frames",
                args.ocr_fps,
                args.ocr_x_start,
                args.ocr_x_end,
                args.ocr_y_start,
                args.ocr_y_end,
                args.force,
            )
            if backend == "macos":
                ocr = macos_ocr(frame_paths, args.ocr_fps)
            else:
                ocr = portable_ocr(frame_paths, args.ocr_fps, args.ocr_min_confidence)
            write_jsonl(ocr_path, ocr)
    else:
        warnings.append("OCR skipped by request")
        write_jsonl(ocr_path, [])

    speakers_path = output / "speakers.json"
    speaker_segments: list[dict[str, object]] = []
    if not args.skip_diarization:
        if speakers_path.is_file() and not args.force:
            speaker_segments = json.loads(speakers_path.read_text(encoding="utf-8"))
        elif segmentation_model.is_file() and embedding_model.is_file():
            try:
                speaker_segments = diarize(
                    audio,
                    segmentation_model,
                    embedding_model,
                    args.speakers,
                    args.threads,
                )
            except Exception as exc:
                warnings.append(f"speaker diarization failed: {type(exc).__name__}: {exc}")
        else:
            warnings.append("speaker diarization models are missing")
    else:
        warnings.append("speaker diarization skipped by request")
    speakers_path.write_text(
        json.dumps(speaker_segments, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    timeline = merge_timeline(asr, ocr, speaker_segments)
    write_jsonl(output / "timeline.jsonl", timeline)
    write_transcript(output / "transcript.md", video, timeline)

    manifest = {
        "source": {
            "path": str(video),
            "size_bytes": video.stat().st_size,
            "sha256": sha256_file(video),
        },
        "media": media,
        "backend": {
            "requested": args.backend,
            "selected": backend,
            "runtime_profile": runtime.get("profile"),
            "portable_backend_uses_apple_vision": False if backend == "portable" else None,
        },
        "components": {
            "ffmpeg": str(ffmpeg),
            "whisper_cpp": runtime.get("whisper_version"),
            "whisper_model": args.model,
            "rapidocr": package_version("rapidocr") if backend == "portable" else None,
            "onnxruntime": package_version("onnxruntime") if backend == "portable" else None,
            "sherpa_onnx": package_version("sherpa-onnx") if not args.skip_diarization else None,
        },
        "settings": {
            "language": args.language,
            "speakers": args.speakers,
            "threads": args.threads,
            "ocr_fps": args.ocr_fps,
            "ocr_crop": {
                "x_start": args.ocr_x_start,
                "x_end": args.ocr_x_end,
                "y_start": args.ocr_y_start,
                "y_end": args.ocr_y_end,
            },
        },
        "counts": {
            "asr_segments": len(asr),
            "ocr_segments": len(ocr),
            "speaker_segments": len(speaker_segments),
            "timeline_segments": len(timeline),
        },
        "outputs": {
            "directory": str(output),
            "embedded_subtitles": str(embedded_subtitles) if embedded_subtitles else None,
            "audio": str(audio),
            "asr_srt": str(output / "asr.srt"),
            "asr_jsonl": str(output / "asr.jsonl"),
            "ocr_jsonl": str(output / "ocr.jsonl"),
            "speakers_json": str(output / "speakers.json"),
            "timeline_jsonl": str(output / "timeline.jsonl"),
            "transcript_md": str(output / "transcript.md"),
        },
        "warnings": warnings,
        "elapsed_seconds": round(time.monotonic() - started, 3),
    }
    (output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
