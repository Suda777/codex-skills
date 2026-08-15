#!/usr/bin/env python3
"""Create and verify the device-local runtime inside this Skill."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = SKILL_ROOT / ".runtime"
VENV_ROOT = RUNTIME_ROOT / "venv"
REQUIREMENTS = SKILL_ROOT / "tools" / "runtime-requirements.txt"


def runtime_python() -> Path:
    if os.name == "nt":
        return VENV_ROOT / "Scripts" / "python.exe"
    return VENV_ROOT / "bin" / "python"


def check_runtime() -> tuple[bool, str]:
    executable = runtime_python()
    if not executable.is_file():
        return False, "runtime Python is missing"
    command = [
        str(executable),
        "-c",
        "import aiohttp, aiofiles, aiosqlite, curl_cffi, httpx, imageio_ffmpeg, playwright, rich, yaml; print('ok')",
    ]
    try:
        subprocess.run(command, check=True, capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.SubprocessError) as exc:
        return False, f"runtime import check failed: {exc}"

    yt_root = SKILL_ROOT / "tools" / "yt-dlp"
    environment = os.environ.copy()
    environment["PYTHONPATH"] = str(yt_root)
    try:
        subprocess.run(
            [str(executable), "-c", "import yt_dlp; print(yt_dlp.version.__version__)"],
            check=True,
            capture_output=True,
            text=True,
            timeout=60,
            env=environment,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        return False, f"vendored yt-dlp import check failed: {exc}"
    return True, "runtime is ready"


def install_runtime(python: str) -> None:
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)
    (RUNTIME_ROOT / "tmp").mkdir(exist_ok=True)
    (RUNTIME_ROOT / "browsers").mkdir(exist_ok=True)

    if not runtime_python().is_file():
        subprocess.run([python, "-m", "venv", str(VENV_ROOT)], check=True)

    environment = os.environ.copy()
    environment["PIP_NO_CACHE_DIR"] = "1"
    environment["TMPDIR"] = str(RUNTIME_ROOT / "tmp")
    environment["PLAYWRIGHT_BROWSERS_PATH"] = str(RUNTIME_ROOT / "browsers")
    command = [
        str(runtime_python()),
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "--no-cache-dir",
        "-r",
        str(REQUIREMENTS),
    ]
    subprocess.run(command, check=True, env=environment)

    marker = {
        "python": str(runtime_python()),
        "requirements": str(REQUIREMENTS),
    }
    (RUNTIME_ROOT / "runtime.json").write_text(
        json.dumps(marker, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check without installing anything")
    parser.add_argument("--python", default=sys.executable, help="Python used to create the venv")
    args = parser.parse_args()

    ready, message = check_runtime()
    if args.check:
        print(message)
        return 0 if ready else 1
    if ready:
        print(message)
        return 0

    install_runtime(args.python)
    ready, message = check_runtime()
    print(message)
    return 0 if ready else 1


if __name__ == "__main__":
    raise SystemExit(main())
