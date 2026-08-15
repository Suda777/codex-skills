#!/usr/bin/env python3
"""Validate a downloaded media file and print machine-readable metadata."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from video_common import probe_media


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    args = parser.parse_args()
    result = probe_media(args.path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
