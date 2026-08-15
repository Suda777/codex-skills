#!/usr/bin/env python3
"""Capture a fresh anonymous browser session without using a persistent profile."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse


async def capture(url: str, output: Path, wait_seconds: float, headed: bool) -> None:
    from playwright.async_api import async_playwright

    observed_tokens: list[str] = []
    observed_cookie_headers: list[str] = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(channel="chrome", headless=not headed)
        context = await browser.new_context()
        page = await context.new_page()

        def observe_request(request) -> None:
            try:
                query = parse_qs(urlparse(request.url).query)
                if query.get("msToken"):
                    observed_tokens.append(query["msToken"][0])
                cookie_header = (request.headers or {}).get("cookie")
                if cookie_header:
                    observed_cookie_headers.append(cookie_header)
            except Exception:
                return

        page.on("request", observe_request)
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=120_000)
        except Exception as exc:
            if "Timeout" not in exc.__class__.__name__ and "Timeout" not in str(exc):
                await context.close()
                await browser.close()
                raise
        await page.wait_for_timeout(int(wait_seconds * 1000))
        final_url = page.url
        cookies = await context.cookies()
        await context.close()
        await browser.close()

    cookie_dict = {item["name"]: item["value"] for item in cookies}
    if not cookie_dict.get("msToken"):
        for token in reversed(observed_tokens):
            if token:
                cookie_dict["msToken"] = token
                break
    if not cookie_dict.get("msToken"):
        for header in reversed(observed_cookie_headers):
            for part in header.split(";"):
                name, separator, value = part.strip().partition("=")
                if separator and name == "msToken" and value:
                    cookie_dict["msToken"] = value
                    break
            if cookie_dict.get("msToken"):
                break

    payload = {
        "requested_url": url,
        "final_url": final_url,
        "cookies": cookies,
        "cookie_dict": cookie_dict,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    if os.name != "nt":
        output.chmod(0o600)
    print(f"Captured an anonymous session with {len(cookies)} cookie(s); values were not printed.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--wait-seconds", type=float, default=8.0)
    parser.add_argument("--headed", action="store_true")
    args = parser.parse_args()
    asyncio.run(capture(args.url, args.output, args.wait_seconds, args.headed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
