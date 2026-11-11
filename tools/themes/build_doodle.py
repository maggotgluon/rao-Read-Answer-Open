#!/usr/bin/env python3
"""
Build the "doodle" theme's pictures from the Drawicons hand-drawn set (brand/…, CC BY 4.0).
สร้างภาพของธีม doodle จากชุดไอคอนวาดมือ Drawicons

    python3 tools/themes/build_doodle.py

Cleans each SVG for the app (drops SVG Repo headers and the white inner fills, which would
show as solid in a CSS mask), optionally mirrors/rotates it, and writes it under the picture
name the app asks for. Anything not mapped here falls back to the dusk theme.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "brand" / "svgrepo-drawicons-line-hand-drawn"
OUT = ROOT / "public" / "themes" / "doodle"

# picture name in the app → (source icon, transform)
MAP: dict[str, tuple[str, str | None]] = {
    # UI icons / ไอคอน
    "icons/chevron-right": ("arrow7", None),
    "icons/chevron-left": ("arrow7", "flip"),
    "icons/chevron-down": ("arrow7", "rot90"),
    "icons/chevron-up": ("arrow7", "rot270"),
    "icons/x": ("maths7", None),
    "icons/plus": ("maths5", None),
    "icons/square-plus": ("maths6", None),
    "icons/heart": ("heart1", None),
    "icons/envelope": ("letter1", None),
    "icons/pen": ("pen1", None),
    "icons/pencil": ("pen1", None),
    "icons/settings": ("cog1", None),
    "icons/lightbulb": ("lamp1", None),
    "icons/library": ("book1", None),
    "icons/shield": ("shield1", None),
    "icons/shield-check": ("shield1", None),
    "icons/circle-alert": ("excalamation1", None),
    "icons/sparkles": ("shape16", None),
    "icons/gift": ("bow1", None),
    "icons/share": ("arrow5", None),
    "icons/share-2": ("arrow5", None),
    "icons/log-out": ("arrow3", "flip"),
    "icons/star": ("award1", None),
    # moods / แสตมป์อารมณ์
    "moods/happy": ("flower3", None),
    "moods/loved": ("heart3", None),
    "moods/excited": ("explode4", None),
    "moods/calm": ("cloud3", None),
    "moods/tired": ("moon1", None),
    "moods/stressed": ("bolt3", None),
    "moods/sad": ("drop2", None),
    "moods/sick": ("ghost1", None),
    # postcard reactions / ปฏิกิริยา
    "reactions/love": ("heart1", None),
    "reactions/sweet": ("lolly1", None),
    "reactions/aww": ("flower1", None),
    "reactions/crush": ("lip1", None),
    "reactions/yay": ("shape16", None),
    "reactions/melting": ("drop1", None),
    # dates / วันสำคัญ
    "dates/anniversary": ("diamond1", None),
    "dates/birthday": ("bow1", None),
    "dates/special": ("award1", None),
    "dates/other": ("heart2", None),
    "dates/valentine": ("heart4", None),
    "dates/flower": ("flower2", None),
    "dates/cloud": ("cloud1", None),
    "dates/ice-cream": ("lolly1", None),
    "dates/dinner": ("glass3", None),
    "dates/call": ("device1", None),
    # empty states / ภาพตอนว่าง
    "decor/welcome": ("heart2", None),
    "decor/moments-empty": ("bubble2", None),
    "decor/spaces-empty": ("letter1", None),
    "decor/activity-empty": ("cloud4", None),
    "decor/waiting-partner": ("mug1", None),
    "decor/memories": ("book1", None),
}


def source(name: str) -> Path:
    hits = sorted(SRC.glob(f"{name}-*.svg"))
    if not hits:
        raise SystemExit(f"missing source icon: {name}")
    return hits[0]


def clean(svg: str, transform: str | None) -> str:
    svg = re.sub(r"<\?xml.*?\?>|<!--.*?-->", "", svg, flags=re.S)
    # Classes painted white are inner fills; in a mask they'd be solid, so drop them.
    # ส่วนที่เติมสีขาวคือพื้นด้านใน ถ้าเป็น mask จะทึบ จึงลบออก
    white = set(re.findall(r"\.(cls-\d+)\{[^}]*fill:\s*(?:#fff(?:fff)?|white)\s*;?[^}]*\}", svg, flags=re.I))
    for cls in white:
        svg = re.sub(rf'<(path|rect|circle|ellipse|polygon|polyline)\b[^>]*class="{cls}"[^>]*/>', "", svg)
    svg = re.sub(r"<defs>\s*<style>.*?</style>\s*</defs>", "", svg, flags=re.S)
    svg = re.sub(r'\s(width|height)="[^"]*"', "", svg, count=2)
    svg = re.sub(r'\s(id|data-name)="[^"]*"', "", svg)
    svg = re.sub(r">\s+<", "><", svg).strip()

    m = re.search(r'viewBox="([^"]+)"', svg)
    if not m:
        raise SystemExit("source SVG has no viewBox")
    x, y, w, h = (float(v) for v in m.group(1).split())
    cx, cy = x + w / 2, y + h / 2
    t = {
        "flip": f"translate({2 * cx:g} 0) scale(-1 1)",
        "rot90": f"rotate(90 {cx:g} {cy:g})",
        "rot270": f"rotate(-90 {cx:g} {cy:g})",
    }.get(transform or "")
    if t:
        svg = re.sub(r"(<svg\b[^>]*>)(.*)(</svg>)", lambda mm: f'{mm.group(1)}<g transform="{t}">{mm.group(2)}</g>{mm.group(3)}', svg, flags=re.S)
    # black ink, so the app can recolour it / สีดำ แอปลงสีเอง
    svg = svg.replace("<svg ", '<svg fill="#000" ', 1)

    return svg + "\n"


def main() -> None:
    for target, (name, transform) in MAP.items():
        out = OUT / f"{target}.svg"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(clean(source(name).read_text(), transform))
    print(f"{len(MAP)} pictures → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
