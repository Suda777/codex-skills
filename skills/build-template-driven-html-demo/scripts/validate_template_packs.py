#!/usr/bin/env python3
"""Validate the catalog and every ready packaged HTML Demo template."""

from __future__ import annotations

import argparse
import json
import re
import struct
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

from inventory_controls import inventory


TEMPLATE_ID_RE = re.compile(r"^T\d{2}$")
ALLOWED_STATUSES = {"draft", "ready", "retired"}
REQUIRED_FILE_KEYS = {
    "starter",
    "tokens",
    "components",
    "interactions",
    "preview",
    "provenance",
}
PLACEHOLDER_RE = re.compile(r"\{\{[^{}]+\}\}|\[TODO[^\]]*\]|\blorem ipsum\b", re.I)


class TemplateHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.nav_targets: list[str] = []
        self.page_ids: list[str] = []
        self.initial_pages: list[str] = []
        self.asset_urls: list[tuple[str, str, str]] = []
        self.ids: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)

        if "data-nav-item" in values:
            href = values.get("href") or ""
            if href.startswith("#") and len(href) > 1:
                self.nav_targets.append(href[1:])
            else:
                self.nav_targets.append(href)

        if "data-page-view" in values:
            page_id = values.get("id") or ""
            self.page_ids.append(page_id)
            if "hidden" not in values:
                self.initial_pages.append(page_id)

        for attribute in ("src", "href"):
            value = values.get(attribute)
            if value:
                self.asset_urls.append((tag, attribute, value))


def _read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"missing file: {path}")
        return {}
    except json.JSONDecodeError as exc:
        errors.append(f"invalid JSON: {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"JSON root must be an object: {path}")
        return {}
    return value


def _is_external(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} or value.startswith("//")


def _png_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        data = path.read_bytes()[:24]
    except FileNotFoundError:
        return None
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", data[16:24])


def _parse_html(path: Path, errors: list[str]) -> TemplateHTMLParser | None:
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        errors.append(f"missing HTML: {path}")
        return None
    parser = TemplateHTMLParser()
    parser.feed(text)
    if PLACEHOLDER_RE.search(text):
        errors.append(f"unresolved placeholder text: {path}")
    duplicate_ids = sorted(key for key, count in Counter(parser.ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"duplicate HTML ids in {path}: {', '.join(duplicate_ids)}")
    return parser


def _validate_runtime_assets(
    parser: TemplateHTMLParser,
    pack: Path,
    expected_css: str,
    expected_js: str,
    errors: list[str],
) -> None:
    stylesheets: list[str] = []
    scripts: list[str] = []
    for tag, attribute, value in parser.asset_urls:
        if _is_external(value):
            errors.append(f"external runtime URL in {pack.name}: {value}")
        if tag == "link" and attribute == "href" and value.endswith(".css"):
            stylesheets.append(value)
        if tag == "script" and attribute == "src":
            scripts.append(value)
        if tag in {"img", "source", "video", "audio"} and not value.startswith("data:"):
            errors.append(f"non-embedded media in {pack.name}: {value}")
    if stylesheets != [expected_css]:
        errors.append(f"{pack.name} starter stylesheets must be [{expected_css!r}], got {stylesheets!r}")
    if scripts != [expected_js]:
        errors.append(f"{pack.name} starter scripts must be [{expected_js!r}], got {scripts!r}")


def _validate_ready_template(
    skill_dir: Path,
    catalog_item: dict,
    errors: list[str],
    warnings: list[str],
) -> dict:
    assets_dir = skill_dir / "assets"
    template_id = str(catalog_item.get("id", ""))
    path_value = str(catalog_item.get("path", ""))
    pack = assets_dir / path_value
    manifest_path = pack / "manifest.json"
    manifest = _read_json(manifest_path, errors)
    prefix = template_id or pack.name

    if not pack.is_dir():
        errors.append(f"{prefix}: missing template directory: {pack}")
        return {"id": prefix, "controls": None, "pages": None}

    for key, expected in (
        ("template_id", template_id),
        ("name", catalog_item.get("name")),
        ("status", "ready"),
    ):
        if manifest.get(key) != expected:
            errors.append(f"{prefix}: manifest {key!r} must equal {expected!r}")

    files = manifest.get("files")
    if not isinstance(files, dict):
        errors.append(f"{prefix}: manifest files must be an object")
        return {"id": prefix, "controls": None, "pages": None}
    missing_keys = sorted(REQUIRED_FILE_KEYS - set(files))
    if missing_keys:
        errors.append(f"{prefix}: manifest missing file keys: {', '.join(missing_keys)}")
    for key in REQUIRED_FILE_KEYS:
        value = files.get(key)
        if not isinstance(value, str) or not value:
            continue
        if not (pack / value).is_file():
            errors.append(f"{prefix}: missing {key} file: {pack / value}")

    runtime = manifest.get("runtime")
    if not isinstance(runtime, dict):
        errors.append(f"{prefix}: manifest runtime must be an object")
    else:
        if runtime.get("external_dependencies") != []:
            errors.append(f"{prefix}: external_dependencies must be []")
        if runtime.get("network_required") is not False:
            errors.append(f"{prefix}: network_required must be false")
        if runtime.get("build_required") is not False:
            errors.append(f"{prefix}: build_required must be false")
        if runtime.get("entry_file") != files.get("starter"):
            errors.append(f"{prefix}: runtime entry_file must match files.starter")

    preview_value = files.get("preview")
    catalog_preview = catalog_item.get("preview")
    expected_catalog_preview = f"{path_value}/{preview_value}" if preview_value else None
    if catalog_preview != expected_catalog_preview:
        errors.append(f"{prefix}: catalog preview must equal {expected_catalog_preview!r}")
    if isinstance(preview_value, str):
        dimensions = _png_dimensions(pack / preview_value)
        if dimensions is None:
            errors.append(f"{prefix}: preview must be a real PNG")
        elif dimensions != (1280, 720):
            errors.append(f"{prefix}: preview must be exactly 1280x720, got {dimensions}")

    starter_name = files.get("starter")
    tokens_name = files.get("tokens")
    interactions_name = files.get("interactions")
    components_name = files.get("components")
    starter_path = pack / starter_name if isinstance(starter_name, str) else pack / "starter.html"
    components_path = pack / components_name if isinstance(components_name, str) else pack / "components.html"
    parser = _parse_html(starter_path, errors)
    if parser:
        if not parser.nav_targets:
            errors.append(f"{prefix}: starter has no data-nav-item links")
        if parser.nav_targets != parser.page_ids:
            errors.append(
                f"{prefix}: sidebar/page order mismatch: nav={parser.nav_targets!r}, pages={parser.page_ids!r}"
            )
        if len(set(parser.nav_targets)) != len(parser.nav_targets):
            errors.append(f"{prefix}: duplicate sidebar targets")
        if len(parser.initial_pages) != 1:
            errors.append(f"{prefix}: exactly one page view must be initially visible")
        if isinstance(tokens_name, str) and isinstance(interactions_name, str):
            _validate_runtime_assets(parser, pack, tokens_name, interactions_name, errors)

    starter_controls = None
    component_controls = None
    try:
        starter_report = inventory(starter_path)
        starter_controls = starter_report["summary"]["total"]
        if starter_report["summary"]["suspicious"]:
            errors.append(f"{prefix}: starter has suspicious enabled controls")
    except (FileNotFoundError, KeyError, TypeError) as exc:
        errors.append(f"{prefix}: starter control inventory failed: {exc}")

    _parse_html(components_path, errors)
    try:
        component_report = inventory(components_path)
        component_controls = component_report["summary"]["total"]
        if component_report["summary"]["suspicious"]:
            errors.append(f"{prefix}: components page has suspicious enabled controls")
    except (FileNotFoundError, KeyError, TypeError) as exc:
        errors.append(f"{prefix}: component control inventory failed: {exc}")

    return {
        "id": prefix,
        "pages": len(parser.page_ids) if parser else None,
        "starter_controls": starter_controls,
        "component_controls": component_controls,
    }


def validate(skill_dir: Path) -> tuple[list[str], list[str], list[dict]]:
    errors: list[str] = []
    warnings: list[str] = []
    catalog_path = skill_dir / "assets" / "template-catalog.json"
    catalog = _read_json(catalog_path, errors)
    templates = catalog.get("templates")
    if not isinstance(templates, list) or not templates:
        errors.append("catalog templates must be a non-empty array")
        return errors, warnings, []

    ids = [str(item.get("id", "")) for item in templates if isinstance(item, dict)]
    duplicate_ids = sorted(key for key, count in Counter(ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"duplicate catalog ids: {', '.join(duplicate_ids)}")

    results: list[dict] = []
    for item in templates:
        if not isinstance(item, dict):
            errors.append("each catalog template must be an object")
            continue
        template_id = str(item.get("id", ""))
        if not TEMPLATE_ID_RE.fullmatch(template_id):
            errors.append(f"invalid template id: {template_id!r}")
        status = item.get("status")
        if status not in ALLOWED_STATUSES:
            errors.append(f"{template_id}: invalid status {status!r}")
            continue
        if status == "ready":
            results.append(_validate_ready_template(skill_dir, item, errors, warnings))

    return errors, warnings, results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_dir", type=Path, help="path to build-template-driven-html-demo")
    args = parser.parse_args()
    errors, warnings, results = validate(args.skill_dir.resolve())
    for result in results:
        print(
            f"{result['id']}: pages={result.get('pages')} "
            f"starter_controls={result.get('starter_controls')} "
            f"component_controls={result.get('component_controls')}"
        )
    for warning in warnings:
        print(f"WARN: {warning}")
    for error in errors:
        print(f"ERROR: {error}")
    if errors:
        return 1
    print(f"PASS: {len(results)} ready template pack(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
