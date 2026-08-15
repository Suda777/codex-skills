#!/usr/bin/env python3
"""Audit flowchart semantics, branch consistency, and avoidable routing bends.

This complements validate.py. It intentionally enforces the personalized
flowchart rules in references/flowchart-quality.md and exits non-zero when it
finds a quality issue that should be reviewed before delivery.
"""

import argparse
import html
import re
import sys
import xml.etree.ElementTree as ET

from validate import abs_rect, edge_waypoints


BRANCH_WORDS = {"是", "否", "yes", "no", "true", "false"}
STYLE_KEYS = ("fontColor", "fontSize", "fontStyle", "labelBackgroundColor")
RETURN_RE = re.compile(r"返回\s*步骤\s*(\d+)", re.I)
PREFIX_RE = re.compile(r"^\s*(\d{1,3})[\s.、:：-]+")


def style_dict(style):
    result = {}
    for item in (style or "").split(";"):
        if "=" in item:
            key, value = item.split("=", 1)
            result[key] = value
        elif item:
            result[item] = "1"
    return result


def text_value(cell):
    value = html.unescape(cell.get("value") or "")
    value = value.replace("&#xa;", " ").replace("\n", " ")
    value = re.sub(r"<[^>]+>", " ", value)
    return " ".join(value.split())


def page_cells(diagram):
    model = diagram.find("mxGraphModel")
    if model is None:
        return None
    root = model.find("root")
    if root is None:
        return []
    cells = []
    for child in root:
        if child.tag == "mxCell":
            cells.append(child)
        elif child.tag in ("UserObject", "object"):
            inner = child.find("mxCell")
            if inner is not None:
                inner.set("id", child.get("id", inner.get("id", "")))
                cells.append(inner)
    return cells


def centers(cell, by_id):
    box = abs_rect(cell, by_id)
    if box is None:
        return None
    x, y, w, h = box
    return (x + w / 2, y + h / 2, x, y, w, h)


def is_return_edge(edge, by_id):
    if style_dict(edge.get("style")).get("dashed") == "1":
        return True
    if RETURN_RE.search(text_value(edge)):
        return True
    source = by_id.get(edge.get("source"))
    return source is not None and RETURN_RE.search(text_value(source)) is not None


def audit_page(diagram):
    name = diagram.get("name", "?")
    cells = page_cells(diagram)
    if cells is None:
        return [f"page {name!r}: compressed page cannot be audited"]

    by_id = {c.get("id"): c for c in cells if c.get("id")}
    vertices = [c for c in cells if c.get("vertex") == "1"]
    edges = [c for c in cells if c.get("edge") == "1"]
    outgoing = {}
    for edge in edges:
        outgoing.setdefault(edge.get("source"), []).append(edge)

    findings = []
    decisions = [
        c for c in vertices
        if "rhombus" in (c.get("style") or "")
        and "legend" not in (c.get("id") or "").lower()
    ]
    branch_edges = []

    for decision in decisions:
        did = decision.get("id")
        if not text_value(decision).rstrip().endswith(("?", "？")):
            findings.append(f"decision {did!r} is not worded as a question: {text_value(decision)!r}")
        outs = outgoing.get(did, [])
        if len(outs) < 2:
            findings.append(f"decision {did!r} has fewer than two outgoing branches")
        labels = []
        for edge in outs:
            label = text_value(edge).lower()
            if label in BRANCH_WORDS:
                labels.append(label)
                branch_edges.append(edge)
            elif not is_return_edge(edge, by_id):
                findings.append(f"decision edge {edge.get('id')!r} has missing or nonstandard branch label {text_value(edge)!r}")
        if len(labels) >= 2 and len(set(labels)) != len(labels):
            findings.append(f"decision {did!r} repeats a branch label: {labels}")

    if branch_edges:
        signatures = {}
        for edge in branch_edges:
            style = style_dict(edge.get("style"))
            sig = tuple(style.get(key, "") for key in STYLE_KEYS)
            signatures.setdefault(sig, []).append(edge.get("id"))
        if len(signatures) > 1:
            details = "; ".join(f"{ids}: {sig}" for sig, ids in signatures.items())
            findings.append(f"branch label styles are inconsistent: {details}")

    for edge in edges:
        style = style_dict(edge.get("style"))
        eid = edge.get("id")
        if style.get("curved") == "1" or style.get("rounded") == "1":
            findings.append(f"edge {eid!r} uses a curved or rounded route; use square straight/orthogonal routing")

        points = edge_waypoints(edge)
        for a, b in zip(points, points[1:]):
            if a[0] != b[0] and a[1] != b[1]:
                findings.append(f"edge {eid!r} contains a diagonal waypoint segment {a} -> {b}")

        if is_return_edge(edge, by_id):
            if style.get("dashed") != "1":
                findings.append(f"return edge {eid!r} is not dashed")
            continue

        source = by_id.get(edge.get("source"))
        target = by_id.get(edge.get("target"))
        if source is None or target is None:
            continue
        sc, tc = centers(source, by_id), centers(target, by_id)
        if sc is None or tc is None:
            continue
        sx, sy, *_ = sc
        tx, ty, *_ = tc
        dx, dy = tx - sx, ty - sy
        if abs(dy) > abs(dx) and abs(dx) > 1:
            findings.append(f"edge {eid!r} is primarily vertical but node centers differ by {dx:g}px")
        elif abs(dx) > abs(dy) and abs(dy) > 1:
            findings.append(f"edge {eid!r} is primarily horizontal but node centers differ by {dy:g}px")
        if points and (abs(dx) <= 1 or abs(dy) <= 1):
            if abs(dx) <= 1 and any(abs(px - sx) > 1 for px, _ in points):
                findings.append(f"edge {eid!r} has an unnecessary bend between vertically aligned nodes")
            if abs(dy) <= 1 and any(abs(py - sy) > 1 for _, py in points):
                findings.append(f"edge {eid!r} has an unnecessary bend between horizontally aligned nodes")

    numbered_steps = []
    numeric_badges = []
    for cell in vertices:
        if (cell.get("id") or "").endswith("_header"):
            continue
        value = text_value(cell)
        match = PREFIX_RE.match(value)
        style = style_dict(cell.get("style"))
        is_ellipse = "ellipse" in style
        if match and not is_ellipse:
            numbered_steps.append((cell.get("id"), int(match.group(1))))
        if value.isdigit() and is_ellipse:
            numeric_badges.append((cell.get("id"), int(value)))
    all_markers = numbered_steps + numeric_badges
    if all_markers:
        by_number = {}
        for cid, number in all_markers:
            by_number.setdefault(number, []).append(cid)
        duplicates = {number: ids for number, ids in by_number.items() if len(ids) > 1}
        if duplicates:
            details = "; ".join(f"{number}: {ids}" for number, ids in sorted(duplicates.items()))
            findings.append(f"step numbers are duplicated across labels or badges: {details}")
        nums = sorted(by_number)
        expected = list(range(nums[0], nums[-1] + 1))
        if nums != expected:
            findings.append(f"step numbering is not contiguous: {nums}")

    for cell in vertices:
        value = text_value(cell)
        if not value.isdigit():
            continue
        style = style_dict(cell.get("style"))
        box = abs_rect(cell, by_id)
        if "ellipse" not in style:
            findings.append(f"numeric marker {cell.get('id')!r} is not a circle badge")
        elif box is not None and abs(box[2] - box[3]) > 1:
            findings.append(f"numeric badge {cell.get('id')!r} is not circular: {box[2]:g}x{box[3]:g}")

    for cell in vertices:
        match = RETURN_RE.search(text_value(cell))
        if not match:
            continue
        outs = outgoing.get(cell.get("id"), [])
        if not outs:
            findings.append(f"return node {cell.get('id')!r} says step {match.group(1)} but has no outgoing return edge")
            continue
        for edge in outs:
            target = by_id.get(edge.get("target"))
            target_text = text_value(target) if target is not None else ""
            step = match.group(1).lstrip("0") or "0"
            target_id = edge.get("target") or ""
            if not (PREFIX_RE.match(target_text) and (PREFIX_RE.match(target_text).group(1).lstrip("0") or "0") == step) and not target_id.endswith(step):
                findings.append(f"return edge {edge.get('id')!r} does not visibly target step {match.group(1)}")

    return findings


def main():
    parser = argparse.ArgumentParser(description="Audit a flowchart for semantic and routing consistency.")
    parser.add_argument("file")
    args = parser.parse_args()
    try:
        tree = ET.parse(args.file)
    except (ET.ParseError, OSError) as exc:
        sys.exit(f"error: cannot parse {args.file}: {exc}")

    pages = tree.getroot().findall("diagram") or [tree.getroot()]
    findings = []
    for page in pages:
        findings.extend(audit_page(page))
    for finding in findings:
        print(f"issue: {finding}")
    print(f"{len(findings)} flowchart quality issue(s)")
    if findings:
        sys.exit(1)


if __name__ == "__main__":
    main()
