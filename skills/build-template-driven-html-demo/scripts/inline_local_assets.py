#!/usr/bin/env python3
"""Inline local stylesheet and script references into one HTML file."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path


STYLESHEET_RE = re.compile(
    r'<link\b(?=[^>]*\brel=["\']stylesheet["\'])(?=[^>]*\bhref=["\']([^"\']+)["\'])[^>]*>',
    re.IGNORECASE,
)
SCRIPT_RE = re.compile(
    r'<script\b(?=[^>]*\bsrc=["\']([^"\']+)["\'])[^>]*>\s*</script>',
    re.IGNORECASE,
)


def _local_asset(base: Path, value: str) -> Path:
    if value.startswith(("http://", "https://", "//", "data:", "/")):
        raise ValueError(f"Only relative local assets can be inlined: {value}")
    candidate = (base / value).resolve()
    base_resolved = base.resolve()
    if candidate != base_resolved and base_resolved not in candidate.parents:
        raise ValueError(f"Asset escapes the HTML directory: {value}")
    if not candidate.is_file():
        raise FileNotFoundError(candidate)
    return candidate


def inline_assets(source: Path) -> str:
    text = source.read_text(encoding="utf-8")
    base = source.parent

    def replace_css(match: re.Match[str]) -> str:
        relative = match.group(1)
        content = _local_asset(base, relative).read_text(encoding="utf-8")
        return f'<style data-inlined-from="{html.escape(relative)}">\n{content}\n</style>'

    def replace_js(match: re.Match[str]) -> str:
        relative = match.group(1)
        content = _local_asset(base, relative).read_text(encoding="utf-8")
        return f'<script data-inlined-from="{html.escape(relative)}">\n{content}\n</script>'

    text = STYLESHEET_RE.sub(replace_css, text)
    text = SCRIPT_RE.sub(replace_js, text)
    return text


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = inline_assets(args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(result, encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
