#!/usr/bin/env python3
"""Install or inspect the device-local video-analysis runtime."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = SKILL_ROOT / ".runtime"
VENV_ROOT = RUNTIME_ROOT / "venv"
REQUIREMENTS = Path(__file__).with_name("runtime-requirements.txt")
RUNTIME_MANIFEST = RUNTIME_ROOT / "runtime.json"

WHISPER_VERSION = "v1.9.2"
WHISPER_SOURCE_URL = (
    f"https://github.com/ggml-org/whisper.cpp/archive/refs/tags/{WHISPER_VERSION}.tar.gz"
)
WHISPER_MODEL_URL = (
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{model}.bin?download=true"
)
WHISPER_MODELS = {"tiny", "base", "small", "medium", "large-v3", "large-v3-turbo"}

SEGMENTATION_URL = (
    "https://github.com/k2-fsa/sherpa-onnx/releases/download/"
    "speaker-segmentation-models/sherpa-onnx-pyannote-segmentation-3-0.tar.bz2"
)
EMBEDDING_URL = (
    "https://github.com/k2-fsa/sherpa-onnx/releases/download/"
    "speaker-recongition-models/3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx"
)


def runtime_python() -> Path:
    if os.name == "nt":
        return VENV_ROOT / "Scripts" / "python.exe"
    return VENV_ROOT / "bin" / "python"


def normalize_profile(profile: str) -> str:
    if profile == "auto":
        return "native" if platform.system() == "Darwin" else "portable"
    if profile == "macos":
        if platform.system() != "Darwin":
            raise RuntimeError("the macos profile requires macOS")
        return "native"
    return profile


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download(url: str, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.is_file() and destination.stat().st_size > 0:
        return destination
    temporary = destination.with_suffix(destination.suffix + ".part")
    request = urllib.request.Request(url, headers={"User-Agent": "analyze-video-content/1.0"})
    with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as output:
        shutil.copyfileobj(response, output)
    temporary.replace(destination)
    return destination


def safe_extract_tar(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    with tarfile.open(archive) as bundle:
        for member in bundle.getmembers():
            target = (destination / member.name).resolve()
            if root not in target.parents and target != root:
                raise RuntimeError(f"unsafe archive path: {member.name}")
        try:
            bundle.extractall(destination, filter="data")
        except TypeError:
            # Python 3.10/3.11 do not expose the extraction filter argument.
            # The explicit path-traversal check above keeps those runtimes safe.
            bundle.extractall(destination)


def safe_extract_zip(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    with zipfile.ZipFile(archive) as bundle:
        for name in bundle.namelist():
            target = (destination / name).resolve()
            if root not in target.parents and target != root:
                raise RuntimeError(f"unsafe archive path: {name}")
        bundle.extractall(destination)


def find_file(root: Path, names: tuple[str, ...]) -> Path | None:
    if not root.exists():
        return None
    lowered = {name.lower() for name in names}
    for candidate in root.rglob("*"):
        if candidate.is_file() and candidate.name.lower() in lowered:
            return candidate
    return None


def whisper_binary(profile: str) -> Path | None:
    profile_root = RUNTIME_ROOT / "vendor" / f"whisper.cpp-{profile}"
    names = ("whisper-cli.exe",) if os.name == "nt" else ("whisper-cli",)
    return find_file(profile_root, names)


def whisper_model(model: str) -> Path:
    return RUNTIME_ROOT / "models" / "whisper" / f"ggml-{model}.bin"


def diarization_models() -> tuple[Path, Path]:
    root = RUNTIME_ROOT / "models" / "diarization"
    segmentation = root / "sherpa-onnx-pyannote-segmentation-3-0" / "model.onnx"
    embedding = root / "3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx"
    return segmentation, embedding


def import_check() -> tuple[bool, str]:
    executable = runtime_python()
    if not executable.is_file():
        return False, "runtime Python is missing"
    command = [
        str(executable),
        "-c",
        "import imageio_ffmpeg, onnxruntime, rapidocr, sherpa_onnx; print(imageio_ffmpeg.get_ffmpeg_exe())",
    ]
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True, timeout=90)
    except (OSError, subprocess.SubprocessError) as exc:
        return False, f"runtime import check failed: {exc}"
    return True, result.stdout.strip()


def inspect_runtime(profile: str, model: str) -> dict[str, object]:
    resolved = normalize_profile(profile)
    imported, ffmpeg_or_error = import_check()
    whisper = whisper_binary(resolved)
    model_path = whisper_model(model)
    segmentation, embedding = diarization_models()
    issues: list[str] = []
    if not imported:
        issues.append(ffmpeg_or_error)
    if whisper is None:
        issues.append(f"whisper.cpp {resolved} binary is missing")
    if not model_path.is_file():
        issues.append(f"Whisper model is missing: {model_path.name}")
    if not segmentation.is_file():
        issues.append("speaker segmentation model is missing")
    if not embedding.is_file():
        issues.append("speaker embedding model is missing")
    return {
        "ready": not issues,
        "profile": resolved,
        "runtime_python": str(runtime_python()),
        "ffmpeg": ffmpeg_or_error if imported else None,
        "whisper_cli": str(whisper) if whisper else None,
        "whisper_model": str(model_path),
        "speaker_segmentation_model": str(segmentation),
        "speaker_embedding_model": str(embedding),
        "issues": issues,
    }


def install_python_runtime(python: str) -> None:
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)
    for name in ("cache", "downloads", "models", "tmp", "vendor"):
        (RUNTIME_ROOT / name).mkdir(exist_ok=True)
    if not runtime_python().is_file():
        subprocess.run([python, "-m", "venv", str(VENV_ROOT)], check=True)
    environment = os.environ.copy()
    environment["PIP_CACHE_DIR"] = str(RUNTIME_ROOT / "cache" / "pip")
    environment["XDG_CACHE_HOME"] = str(RUNTIME_ROOT / "cache")
    environment["TMPDIR"] = str(RUNTIME_ROOT / "tmp")
    subprocess.run(
        [
            str(runtime_python()),
            "-m",
            "pip",
            "install",
            "--disable-pip-version-check",
            "-r",
            str(REQUIREMENTS),
        ],
        check=True,
        env=environment,
    )


def install_whisper_release(profile: str) -> Path:
    system = platform.system()
    machine = platform.machine().lower()
    target = RUNTIME_ROOT / "vendor" / f"whisper.cpp-{profile}"
    existing = whisper_binary(profile)
    if existing:
        return existing

    downloads = RUNTIME_ROOT / "downloads"
    if system == "Windows":
        if machine not in {"amd64", "x86_64"}:
            raise RuntimeError(f"no pinned Windows whisper.cpp binary for {machine}")
        archive = download(
            f"https://github.com/ggml-org/whisper.cpp/releases/download/{WHISPER_VERSION}/whisper-bin-x64.zip",
            downloads / f"whisper-bin-x64-{WHISPER_VERSION}.zip",
        )
        safe_extract_zip(archive, target)
    elif system == "Linux":
        asset = {"x86_64": "ubuntu-x64", "amd64": "ubuntu-x64", "aarch64": "ubuntu-arm64", "arm64": "ubuntu-arm64"}.get(machine)
        if not asset:
            raise RuntimeError(f"no pinned Linux whisper.cpp binary for {machine}")
        archive = download(
            f"https://github.com/ggml-org/whisper.cpp/releases/download/{WHISPER_VERSION}/whisper-bin-{asset}.tar.gz",
            downloads / f"whisper-bin-{asset}-{WHISPER_VERSION}.tar.gz",
        )
        safe_extract_tar(archive, target)
    elif system == "Darwin":
        source_archive = download(
            WHISPER_SOURCE_URL,
            downloads / f"whisper.cpp-{WHISPER_VERSION}.tar.gz",
        )
        source_parent = RUNTIME_ROOT / "vendor" / "src"
        source_dir = source_parent / f"whisper.cpp-{WHISPER_VERSION.removeprefix('v')}"
        if not source_dir.is_dir():
            safe_extract_tar(source_archive, source_parent)
        build_dir = target / "build"
        cmake = runtime_python().with_name("cmake")
        configure = [str(cmake), "-S", str(source_dir), "-B", str(build_dir), "-DWHISPER_BUILD_EXAMPLES=ON"]
        if profile == "portable":
            configure.extend(
                [
                    "-DGGML_METAL=OFF",
                    "-DGGML_ACCELERATE=OFF",
                    "-DGGML_BLAS=OFF",
                    "-DWHISPER_COREML=OFF",
                ]
            )
        subprocess.run(configure, check=True)
        subprocess.run(
            [str(cmake), "--build", str(build_dir), "--config", "Release", "-j", str(max(1, os.cpu_count() or 1))],
            check=True,
        )
    else:
        raise RuntimeError(f"unsupported operating system: {system}")

    binary = whisper_binary(profile)
    if binary is None:
        raise RuntimeError("whisper.cpp installation finished without whisper-cli")
    if os.name != "nt":
        binary.chmod(binary.stat().st_mode | 0o111)
    return binary


def install_whisper_model(model: str) -> Path:
    if model not in WHISPER_MODELS:
        raise RuntimeError(f"unsupported Whisper model: {model}")
    destination = whisper_model(model)
    return download(WHISPER_MODEL_URL.format(model=model), destination)


def install_diarization_models() -> tuple[Path, Path]:
    segmentation, embedding = diarization_models()
    root = segmentation.parents[1]
    archive = download(SEGMENTATION_URL, RUNTIME_ROOT / "downloads" / "sherpa-onnx-pyannote-segmentation-3-0.tar.bz2")
    if not segmentation.is_file():
        safe_extract_tar(archive, root)
    download(EMBEDDING_URL, embedding)
    if not segmentation.is_file() or not embedding.is_file():
        raise RuntimeError("speaker diarization models were not installed correctly")
    return segmentation, embedding


def write_manifest(state: dict[str, object]) -> None:
    files = {}
    for key in ("whisper_cli", "whisper_model", "speaker_segmentation_model", "speaker_embedding_model"):
        value = state.get(key)
        if value and Path(str(value)).is_file():
            files[key] = {"path": str(value), "sha256": sha256_file(Path(str(value)))}
    payload = {
        "whisper_version": WHISPER_VERSION,
        "profile": state["profile"],
        "python": state["runtime_python"],
        "ffmpeg": state.get("ffmpeg"),
        "files": files,
    }
    RUNTIME_MANIFEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--check", action="store_true", help="Inspect without installing")
    action.add_argument("--install", action="store_true", help="Install the local runtime")
    parser.add_argument("--profile", choices=("auto", "macos", "native", "portable"), default="auto")
    parser.add_argument("--model", choices=sorted(WHISPER_MODELS), default="base")
    parser.add_argument("--python", default=sys.executable, help="Python used to create the runtime venv")
    args = parser.parse_args()

    profile = normalize_profile(args.profile)
    if args.install:
        install_python_runtime(args.python)
        install_whisper_release(profile)
        install_whisper_model(args.model)
        install_diarization_models()

    state = inspect_runtime(profile, args.model)
    if state["ready"]:
        write_manifest(state)
    print(json.dumps(state, ensure_ascii=False, indent=2))
    return 0 if state["ready"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
