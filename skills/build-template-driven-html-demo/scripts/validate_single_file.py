#!/usr/bin/env python3
"""Check structural invariants for a self-contained HTML Demo."""

from __future__ import annotations

import argparse
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


class DemoParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.external_assets: list[str] = []
        self.local_assets: list[str] = []
        self.styles = 0
        self.scripts = 0
        self.buttons_without_type = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "style":
            self.styles += 1
        if tag == "script":
            self.scripts += 1
        if tag == "button" and not values.get("type"):
            self.buttons_without_type += 1
        for key in ("src", "href"):
            value = values.get(key)
            if not value or value.startswith(("#", "mailto:", "tel:")):
                continue
            if value.startswith(("http://", "https://", "//")):
                self.external_assets.append(value)
            elif tag in {"script", "link", "img", "source", "video", "audio"} and not value.startswith("data:"):
                self.local_assets.append(value)


def validate(path: Path) -> tuple[list[str], list[str]]:
    text = path.read_text(encoding="utf-8")
    parser = DemoParser()
    parser.feed(text)
    errors: list[str] = []
    warnings: list[str] = []

    if "<html" not in text.lower() or "</html>" not in text.lower():
        errors.append("missing complete html document")
    if not parser.styles:
        errors.append("missing embedded style block")
    if not parser.scripts:
        errors.append("missing embedded script block")
    if parser.external_assets:
        errors.append("external URLs found: " + ", ".join(sorted(set(parser.external_assets))))
    if parser.local_assets:
        errors.append("non-inlined local assets found: " + ", ".join(sorted(set(parser.local_assets))))
    unresolved = sorted(set(re.findall(r"\{\{[^{}]+\}\}|\[TODO[^\]]*\]", text, re.IGNORECASE)))
    if unresolved:
        errors.append("unresolved placeholders: " + ", ".join(unresolved))
    if re.search(r"\blorem ipsum\b", text, re.IGNORECASE):
        errors.append("lorem ipsum placeholder copy found")
    duplicates = sorted(key for key, count in Counter(parser.ids).items() if count > 1)
    if duplicates:
        errors.append("duplicate ids: " + ", ".join(duplicates))
    if parser.buttons_without_type:
        warnings.append(f"buttons without explicit type: {parser.buttons_without_type}")
    if "aria-" not in text:
        warnings.append("no aria attributes found")
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("html", type=Path)
    args = parser.parse_args()
    errors, warnings = validate(args.html)
    for item in warnings:
        print(f"WARN: {item}")
    for item in errors:
        print(f"ERROR: {item}")
    if errors:
        return 1
    print("PASS: self-contained HTML structure")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
