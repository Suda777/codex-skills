#!/usr/bin/env python3
"""Inventory HTML controls and report static interaction clues.

This is deliberately a static, read-only inspection. It can identify controls
that have no obvious native action or JavaScript mapping clue, but it cannot
prove that an interaction works. Runtime clicking remains a separate review
step.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


CONTROL_TAGS = {"a", "button", "input", "select", "textarea"}
INTERACTIVE_ROLES = {
    "button",
    "checkbox",
    "combobox",
    "link",
    "menuitem",
    "option",
    "radio",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "textbox",
}
FORM_CONTROL_TAGS = {"button", "input", "select", "textarea"}
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
BUTTON_INPUT_TYPES = {"button", "image", "reset", "submit"}
INLINE_HIDDEN_RE = re.compile(
    r"(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse))\s*(?:;|$)",
    re.IGNORECASE,
)
SPACE_RE = re.compile(r"\s+")


@dataclass
class ElementContext:
    tag: str
    hidden: bool
    conditional: bool
    inert: bool
    disabled_fieldset: bool
    in_form: bool
    control_index: int | None = None


@dataclass
class RawControl:
    tag: str
    attrs: dict[str, str | None]
    line: int
    column: int
    hidden: bool
    conditional: bool
    inert: bool
    disabled_fieldset: bool
    in_form: bool
    text_parts: list[str] = field(default_factory=list)


class ControlParser(HTMLParser):
    """Collect controls while preserving document order and source positions."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.controls: list[RawControl] = []
        self.stack: list[ElementContext] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        values = {key.lower(): value for key, value in attrs}
        parent = self.stack[-1] if self.stack else None

        parent_hidden = parent.hidden if parent else False
        parent_conditional = parent.conditional if parent else False
        parent_inert = parent.inert if parent else False
        parent_disabled_fieldset = parent.disabled_fieldset if parent else False
        parent_in_form = parent.in_form if parent else False

        own_hidden = (
            "hidden" in values
            or tag == "template"
            or bool(INLINE_HIDDEN_RE.search(values.get("style") or ""))
        )
        hidden = parent_hidden or own_hidden
        conditional = parent_conditional or (
            tag == "dialog" and "open" not in values and not hidden
        )
        inert = parent_inert or "inert" in values
        disabled_fieldset = parent_disabled_fieldset or (
            tag == "fieldset" and "disabled" in values
        )
        in_form = parent_in_form or tag == "form"

        role_tokens = (values.get("role") or "").lower().split()
        has_interactive_role = any(role in INTERACTIVE_ROLES for role in role_tokens)
        contenteditable = (values.get("contenteditable") or "").lower() in {
            "true",
            "plaintext-only",
        }
        is_control = (
            tag in CONTROL_TAGS
            or has_interactive_role
            or tag == "summary"
            or (tag == "area" and values.get("href") is not None)
            or contenteditable
        )

        control_index: int | None = None
        input_hidden = tag == "input" and (values.get("type") or "text").lower() == "hidden"
        if is_control and not input_hidden:
            line, zero_based_column = self.getpos()
            control_index = len(self.controls)
            self.controls.append(
                RawControl(
                    tag=tag,
                    attrs=values,
                    line=line,
                    column=zero_based_column + 1,
                    hidden=hidden,
                    conditional=conditional and not hidden,
                    inert=inert,
                    disabled_fieldset=disabled_fieldset,
                    in_form=in_form,
                )
            )

        if tag not in VOID_TAGS:
            self.stack.append(
                ElementContext(
                    tag=tag,
                    hidden=hidden,
                    conditional=conditional,
                    inert=inert,
                    disabled_fieldset=disabled_fieldset,
                    in_form=in_form,
                    control_index=control_index,
                )
            )

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        if not data.strip():
            return
        for context in self.stack:
            if context.control_index is not None:
                self.controls[context.control_index].text_parts.append(data)


def _clean(value: str | None, limit: int = 80) -> str:
    cleaned = SPACE_RE.sub(" ", value or "").strip()
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def _attribute_clue(name: str, value: str | None) -> str:
    cleaned = _clean(value, 60)
    return f"{name}={cleaned}" if cleaned else name


def _label(control: RawControl) -> str:
    attrs = control.attrs
    text = _clean(" ".join(control.text_parts))
    aria_label = _clean(attrs.get("aria-label"))
    title = _clean(attrs.get("title"))
    role = next(
        (item for item in (attrs.get("role") or "").lower().split() if item in INTERACTIVE_ROLES),
        None,
    )
    contenteditable = (attrs.get("contenteditable") or "").lower() in {
        "true",
        "plaintext-only",
    }

    if control.tag == "area":
        return aria_label or _clean(attrs.get("alt")) or title or _clean(attrs.get("href")) or "(unlabelled)"
    if control.tag in {"button", "a", "summary"} or role or contenteditable:
        return aria_label or text or title or _clean(attrs.get("id")) or "(unlabelled)"
    if control.tag == "input" and (attrs.get("type") or "text").lower() in BUTTON_INPUT_TYPES:
        return _clean(attrs.get("value")) or aria_label or title or _clean(attrs.get("id")) or "(unlabelled)"
    return (
        aria_label
        or title
        or _clean(attrs.get("placeholder"))
        or _clean(attrs.get("name"))
        or _clean(attrs.get("id"))
        or "(unlabelled)"
    )


def _meaningful_href(href: str | None) -> tuple[bool, str | None]:
    if href is None:
        return False, None
    value = href.strip()
    lowered = value.lower()
    if not value or value in {"#", "#!"}:
        return False, None
    if lowered.startswith("javascript:"):
        expression = re.sub(r"\s+", "", lowered[len("javascript:") :]).rstrip(";")
        if expression in {"", "false", "returnfalse", "void(0)", "void0"}:
            return False, None
        return True, "inline-javascript-url"
    if value.startswith("#"):
        return True, "native-fragment-navigation"
    return True, "native-link-navigation"


def _inspect(control: RawControl, index: int) -> dict[str, Any]:
    attrs = control.attrs
    tag = control.tag
    input_type = (attrs.get("type") or ("submit" if tag == "button" else "text")).lower()
    interactive_role = next(
        (item for item in (attrs.get("role") or "").lower().split() if item in INTERACTIVE_ROLES),
        None,
    )
    contenteditable = (attrs.get("contenteditable") or "").lower() in {
        "true",
        "plaintext-only",
    }

    disabled_attribute = tag in FORM_CONTROL_TAGS and "disabled" in attrs
    aria_disabled = attrs.get("aria-disabled", "").lower() == "true"
    disabled = (
        control.inert
        or aria_disabled
        or disabled_attribute
        or (tag in FORM_CONTROL_TAGS and control.disabled_fieldset)
    )

    if control.hidden:
        visibility = "hidden"
    elif control.conditional:
        visibility = "conditional"
    else:
        visibility = "visible"

    mapping_clues: list[str] = []
    strong_mapping = False
    if attrs.get("id"):
        mapping_clues.append(_attribute_clue("id", attrs["id"]))
        strong_mapping = True
    for name in sorted(key for key in attrs if key.startswith("data-")):
        mapping_clues.append(_attribute_clue(name, attrs[name]))
        strong_mapping = True
    if attrs.get("class"):
        mapping_clues.append(_attribute_clue("class", attrs["class"]))
    if interactive_role:
        mapping_clues.append(_attribute_clue("role", interactive_role))
    if contenteditable:
        mapping_clues.append(_attribute_clue("contenteditable", attrs.get("contenteditable")))
    for name in ("aria-controls", "form", "formaction", "popovertarget"):
        if attrs.get(name):
            mapping_clues.append(_attribute_clue(name, attrs[name]))
            strong_mapping = True

    inline_handlers = sorted(name for name in attrs if name.startswith("on"))
    action_clues = [_attribute_clue(name, attrs[name]) for name in inline_handlers]
    if inline_handlers:
        strong_mapping = True

    associated_form = control.in_form or bool(attrs.get("form"))
    native_action: str | None = None
    if tag in {"a", "area"}:
        href_is_action, native_action = _meaningful_href(attrs.get("href"))
        if attrs.get("href") is not None:
            mapping_clues.append(_attribute_clue("href", attrs["href"]))
    elif tag == "button":
        href_is_action = False
        if input_type in {"submit", "reset"} and associated_form:
            native_action = f"native-{input_type}"
        elif input_type in {"submit", "reset"}:
            native_action = f"unbound-{input_type}"
    elif tag == "input":
        href_is_action = False
        if input_type in {"submit", "image", "reset"}:
            if associated_form:
                native_action = "native-submit" if input_type == "image" else f"native-{input_type}"
            else:
                native_action = "unbound-submit" if input_type == "image" else f"unbound-{input_type}"
        elif input_type != "button":
            native_action = "native-form-field"
    elif tag in {"select", "textarea"}:
        href_is_action = False
        native_action = "native-form-field"
    elif tag == "summary":
        href_is_action = False
        native_action = "native-details-toggle"
    elif contenteditable:
        href_is_action = False
        native_action = "native-content-editing"
    else:
        href_is_action = False

    if native_action and not native_action.startswith("unbound-"):
        action_clues.insert(0, native_action)

    has_action_clue = bool(action_clues) or strong_mapping or href_is_action
    suspicious = (
        visibility != "hidden"
        and not disabled
        and not has_action_clue
    )

    reason = None
    if suspicious:
        reason = (
            "no native action, inline handler, id, data-* attribute, or explicit target mapping clue"
        )

    if disabled:
        state = "disabled"
    elif visibility == "hidden":
        state = "hidden"
    elif visibility == "conditional":
        state = "conditional"
    else:
        state = "enabled"

    recognized_by: list[str] = []
    if tag in CONTROL_TAGS:
        recognized_by.append("native-control-tag")
    if tag == "summary":
        recognized_by.append("summary-element")
    if tag == "area":
        recognized_by.append("area-with-href")
    if interactive_role:
        recognized_by.append("interactive-role")
    if contenteditable:
        recognized_by.append("contenteditable")

    state_sources = {
        "disabled_attribute": disabled_attribute,
        "aria_disabled": aria_disabled,
        "inert": control.inert,
        "disabled_fieldset": tag in FORM_CONTROL_TAGS and control.disabled_fieldset,
        "hidden": control.hidden,
        "conditional": control.conditional,
    }

    return {
        "index": index,
        "line": control.line,
        "column": control.column,
        "tag": tag,
        "input_type": input_type if tag in {"button", "input"} else None,
        "interactive_role": interactive_role,
        "contenteditable": contenteditable,
        "recognized_by": recognized_by,
        "label": _label(control),
        "state": state,
        "visibility": visibility,
        "enabled": not disabled,
        "disabled": disabled,
        "state_sources": state_sources,
        "native_action": native_action,
        "action_clues": action_clues,
        "mapping_clues": mapping_clues,
        "suspicious": suspicious,
        "reason": reason,
    }


def inventory(path: Path) -> dict[str, Any]:
    parser = ControlParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    controls = [_inspect(control, index) for index, control in enumerate(parser.controls, 1)]
    tag_counts = Counter(control["tag"] for control in controls)
    role_counts = Counter(
        control["interactive_role"] for control in controls if control["interactive_role"]
    )
    recognition_counts = Counter(
        basis for control in controls for basis in control["recognized_by"]
    )
    state_counts = Counter(control["state"] for control in controls)
    suspicious_count = sum(bool(control["suspicious"]) for control in controls)
    enabled_total = sum(bool(control["enabled"]) for control in controls)
    disabled_total = len(controls) - enabled_total
    initially_visible_enabled = sum(
        control["enabled"] and control["visibility"] == "visible" for control in controls
    )
    conditional_enabled = sum(
        control["enabled"] and control["visibility"] == "conditional" for control in controls
    )
    initially_hidden_enabled = sum(
        control["enabled"] and control["visibility"] == "hidden" for control in controls
    )
    return {
        "schema_version": 1,
        "file": str(path.resolve()),
        "summary": {
            "total": len(controls),
            "by_tag": dict(sorted(tag_counts.items())),
            "by_role": dict(sorted(role_counts.items())),
            "by_recognition": dict(sorted(recognition_counts.items())),
            "by_state": dict(sorted(state_counts.items())),
            "enabled_total": enabled_total,
            "disabled_total": disabled_total,
            "initially_visible_enabled": initially_visible_enabled,
            "conditional_enabled": conditional_enabled,
            "initially_hidden_enabled": initially_hidden_enabled,
            "suspicious": suspicious_count,
        },
        "controls": controls,
        "scope_note": (
            "Static inventory only. Mapping clues and a zero-suspicion result do not prove "
            "runtime behavior; every reachable enabled control still requires actual clicking."
        ),
    }


def _render_human(report: dict[str, Any]) -> str:
    summary = report["summary"]
    tag_summary = ", ".join(
        f"{name}={count}" for name, count in summary["by_tag"].items()
    ) or "none"
    state_summary = ", ".join(
        f"{name}={count}" for name, count in summary["by_state"].items()
    ) or "none"
    role_summary = ", ".join(
        f"{name}={count}" for name, count in summary["by_role"].items()
    ) or "none"
    lines = [
        f"HTML control inventory: {report['file']}",
        f"Summary: total={summary['total']}; suspicious={summary['suspicious']}",
        (
            f"Review scope: enabled_total={summary['enabled_total']}; "
            f"disabled_total={summary['disabled_total']}; "
            f"initially_visible_enabled={summary['initially_visible_enabled']}; "
            f"conditional_enabled={summary['conditional_enabled']}; "
            f"initially_hidden_enabled={summary['initially_hidden_enabled']}"
        ),
        f"Tags: {tag_summary}",
        f"Interactive roles: {role_summary}",
        f"States: {state_summary}",
        "",
    ]

    for control in report["controls"]:
        qualifiers: list[str] = []
        if control["input_type"]:
            qualifiers.append(control["input_type"])
        if control["interactive_role"]:
            qualifiers.append(f"role={control['interactive_role']}")
        if control["contenteditable"]:
            qualifiers.append("contenteditable")
        type_suffix = f"[{', '.join(qualifiers)}]" if qualifiers else ""
        marker = " SUSPICIOUS" if control["suspicious"] else ""
        lines.append(
            f"{control['index']:03d} L{control['line']}:C{control['column']} "
            f"{control['tag']}{type_suffix} | {control['state'].upper()}{marker} | "
            f"{control['label']}"
        )
        behavior = control["native_action"] or "none"
        actions = ", ".join(control["action_clues"]) or "none"
        mappings = ", ".join(control["mapping_clues"]) or "none"
        state_sources = ", ".join(
            name for name, active in control["state_sources"].items() if active
        ) or "none"
        lines.append(f"    native={behavior}; action-clues={actions}")
        lines.append(f"    mapping-clues={mappings}")
        lines.append(f"    state-sources={state_sources}")
        if control["reason"]:
            lines.append(f"    static-warning={control['reason']}")

    lines.extend(["", f"NOTE: {report['scope_note']}"])
    return "\n".join(lines)


def main() -> int:
    argument_parser = argparse.ArgumentParser(
        description="Inventory HTML controls without executing or modifying the page."
    )
    argument_parser.add_argument("html", type=Path, help="HTML file to inspect")
    argument_parser.add_argument(
        "--json",
        action="store_true",
        help="emit deterministic JSON instead of the human-readable report",
    )
    args = argument_parser.parse_args()

    if not args.html.is_file():
        argument_parser.error(f"HTML file not found: {args.html}")

    report = inventory(args.html)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        print(_render_human(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
