#!/usr/bin/env python3
"""
Build the designer theme kit: SVG sheets of every themeable element.
สร้างชุดไฟล์ SVG สำหรับนักออกแบบธีม: ทุกชิ้นที่เปลี่ยนได้ในธีม

    python3 tools/theme-kit/build.py            # -> design/theme-kit/*.svg

Reads public/themes/* (theme.json + pictures) and lang/{en,th}.json, so re-run it after
changing a theme and the kit stays true. Stdlib only.
อ่านจากโฟลเดอร์ธีมจริง แก้ธีมแล้วรันใหม่ ชุดไฟล์จะตรงเสมอ
"""

from __future__ import annotations

import base64
import html
import json
import math
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
THEMES = ROOT / "public" / "themes"
OUT = ROOT / "design" / "theme-kit"
EN = json.loads((ROOT / "lang" / "en.json").read_text())
TH = json.loads((ROOT / "lang" / "th.json").read_text())

SANS = "IBM Plex Sans Thai, Anuphan, system-ui, sans-serif"
HAND = "Itim, Anuphan, sans-serif"
W = 1200  # sheet width / ความกว้างแผ่น


# ── theme data / ข้อมูลธีม ───────────────────────────────────────────────
def load_themes() -> dict[str, dict]:
    raw = {d.name: json.loads((d / "theme.json").read_text()) for d in sorted(THEMES.iterdir()) if (d / "theme.json").is_file()}

    def resolve(tid: str) -> dict:
        own = raw[tid]
        parent = resolve(own["extends"]) if own.get("extends") in raw else {"tokens": {}, "images": {}}
        images = dict(parent["images"])
        for k, v in (own.get("images") or {}).items():
            if not k.startswith("_") and v:
                images[k] = f"{tid}/{v}"
        return {
            "id": tid,
            "extends": own.get("extends"),
            "name": own.get("name", {}),
            "description": own.get("description", {}),
            "dark": own.get("dark", parent.get("dark", False)),
            "tokens": {**parent["tokens"], **own.get("tokens", {})},
            "images": images,
            "mono": own.get("mono", parent.get("mono", [])),
        }

    default = next((k for k, v in raw.items() if v.get("default")), "dusk")
    order = [default] + [k for k in raw if k != default]
    return {k: resolve(k) for k in order}


T = load_themes()
DUSK = T["dusk"]
C = DUSK["tokens"]


def files(group: str, theme: str = "dusk") -> list[Path]:
    """Pictures of a group; PNG/WebP/JPG win over SVG of the same name. / ภาพในกลุ่ม"""
    found: dict[str, Path] = {}
    for p in sorted((THEMES / theme / group).glob("*.*")):
        ext = p.suffix.lower()
        if ext not in (".svg", ".png", ".webp", ".jpg", ".jpeg"):
            continue
        key = p.name[: -len(".color.svg")] if p.name.endswith(".color.svg") else p.stem
        if key in found and ext == ".svg":
            continue
        found[key] = p
    return list(found.values())


# ── svg helpers / ตัวช่วย svg ────────────────────────────────────────────
def esc(s: str) -> str:
    return html.escape(str(s), quote=True)


def text(x, y, s, size: float = 14, fill=None, weight=400, family=SANS, anchor="start", extra=""):
    return (
        f'<text x="{x}" y="{y}" font-family="{esc(family)}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill or C["ink"]}" text-anchor="{anchor}" {extra}>{esc(s)}</text>'
    )


def data_uri(p: Path) -> str:
    mime = {".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml"}[p.suffix.lower()]
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


def image(p: Path, x, y, w, h, extra=""):
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="{data_uri(p)}" preserveAspectRatio="xMidYMid meet" {extra}/>'


_n = 0
KEEP = ("fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "fill-rule", "clip-rule")


def inline_svg(p: Path, x, y, size, colour: str | None = None) -> str:
    """Nest a theme SVG file; ids are prefixed so files don't clash. / ฝัง svg และกัน id ชนกัน"""
    global _n
    _n += 1
    src = p.read_text(errors="ignore")
    src = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<!--.*?-->", "", src, flags=re.S)
    m = re.search(r"<svg\b([^>]*)>(.*)</svg>", src, flags=re.S)
    if not m:
        return ""
    attrs, inner = m.group(1), m.group(2)
    vb = re.search(r'viewBox="([^"]+)"', attrs)
    if vb:
        viewbox = vb.group(1)
    else:
        w = re.search(r'width="([\d.]+)', attrs)
        h = re.search(r'height="([\d.]+)', attrs)
        viewbox = f"0 0 {w.group(1) if w else 24} {h.group(1) if h else 24}"
    kept = " ".join(f'{k}="{v}"' for k, v in re.findall(r'([\w:-]+)="([^"]*)"', attrs) if k in KEEP)
    pfx = f"k{_n}-"
    inner = re.sub(r'id="([^"]+)"', lambda mm: f'id="{pfx}{mm.group(1)}"', inner)
    inner = re.sub(r"url\(#([^)]+)\)", lambda mm: f"url(#{pfx}{mm.group(1)})", inner)
    inner = re.sub(r'href="#([^"]+)"', lambda mm: f'href="#{pfx}{mm.group(1)}"', inner)
    body = f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{viewbox}" {kept}>{inner}</svg>'
    if colour:
        body = re.sub(r'(fill|stroke)="(#000000|#000|black|currentColor)"', rf'\1="{colour}"', body)
        if 'fill="' not in kept:  # default fill is black / ค่าเริ่มต้นเป็นสีดำ
            body = body.replace("<svg ", f'<svg fill="{colour}" ', 1)
    return body


def picture(p: Path, x, y, size, colour=None):
    return inline_svg(p, x, y, size, colour) if p.suffix == ".svg" else image(p, x, y, size, size)


class Sheet:
    def __init__(self, slug: str, title_en: str, title_th: str, intro: list[str]):
        self.slug, self.parts = slug, []
        self.y: float = 0
        self.defs: list[str] = []
        self.parts.append(text(48, 64, title_th, 34, family=HAND))
        self.parts.append(text(48, 94, title_en, 16, C["ink-soft"]))
        self.parts.append(text(W - 48, 64, "เรา · Rao theme kit", 13, C["ink-soft"], anchor="end"))
        self.parts.append(text(W - 48, 84, f"sheet {slug}", 12, C["postmark"], anchor="end"))
        y = 128
        for line in intro:
            self.parts.append(text(48, y, line, 13, C["ink-soft"]))
            y += 20
        self.y = y + 16

    def heading(self, s: str, sub: str = ""):
        self.y += 18
        self.parts.append(f'<line x1="48" y1="{self.y}" x2="{W - 48}" y2="{self.y}" stroke="{C["rule"]}" />')
        self.y += 30
        self.parts.append(text(48, self.y, s, 20, weight=600))
        if sub:
            self.y += 22
            self.parts.append(text(48, self.y, sub, 12, C["ink-soft"]))
        self.y += 20

    def add(self, s: str):
        self.parts.append(s)

    def save(self):
        h = self.y + 48
        bg = f'<rect width="{W}" height="{h}" fill="{C["ground"]}"/>'
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{W}" height="{h}" viewBox="0 0 {W} {h}">'
            f'<defs>{"".join(self.defs)}</defs>{bg}{"".join(self.parts)}</svg>'
        )
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"{self.slug}.svg").write_text(svg)
        return self.slug


def card(x, y, w, h, fill=None, r=10):
    return (
        f'<rect x="{x}" y="{y + 3}" width="{w}" height="{h}" rx="{r}" fill="{C["ink"]}" opacity="0.06"/>'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill or C["paper"]}"/>'
    )


def grid(sheet: Sheet, items: list[tuple[Path, str, str]], cell=128, icon=56, colour=None, cols=None):
    """Picture cells with file name + label. / ช่องภาพพร้อมชื่อไฟล์"""
    cols = cols or (W - 96) // cell
    for i, (p, label, sub) in enumerate(items):
        cx, cy = 48 + (i % cols) * cell, sheet.y + (i // cols) * (cell + 34)
        sheet.add(card(cx + 4, cy, cell - 8, cell - 8))
        # 24-unit keyline grid behind mono icons / เส้นกริดช่วยวาด
        if colour:
            k = icon
            ox, oy = cx + (cell - k) / 2, cy + (cell - 8 - k) / 2
            sheet.add(f'<rect x="{ox}" y="{oy}" width="{k}" height="{k}" fill="none" stroke="{C["rule"]}" stroke-dasharray="2 3"/>')
            sheet.add(f'<circle cx="{ox + k / 2}" cy="{oy + k / 2}" r="{k * 10 / 24}" fill="none" stroke="{C["rule"]}" stroke-dasharray="2 3"/>')
        sheet.add(picture(p, cx + (cell - icon) / 2, cy + (cell - 8 - icon) / 2, icon, colour))
        sheet.add(text(cx + cell / 2, cy + cell + 8, label, 12, weight=500, anchor="middle"))
        if sub:
            sheet.add(text(cx + cell / 2, cy + cell + 24, sub, 11, C["ink-soft"], anchor="middle"))
    rows = math.ceil(len(items) / cols)
    sheet.y += rows * (cell + 34) + 8


RULES_MONO = [
    "Draw in BLACK on a transparent background; the app recolours single-colour SVGs with the theme ink (CSS mask).",
    "วาดเป็นสีดำบนพื้นโปร่งใส แอปจะลงสีตามธีมเอง · อยากคงสีเดิม ตั้งชื่อ *.color.svg · ใส่ PNG ชื่อเดียวกันเพื่อแทน SVG",
]


# ── 01 colours / สี ──────────────────────────────────────────────────────
ROLES = {
    "ground": ("Desk behind everything", "พื้นโต๊ะด้านหลัง"),
    "paper": ("Letter paper, cards", "กระดาษจดหมาย การ์ด"),
    "paper-2": ("Second sheet, inputs", "กระดาษแผ่นที่สอง ช่องกรอก"),
    "ink": ("Main text, mono icons", "ตัวหนังสือหลัก ไอคอน"),
    "ink-soft": ("Secondary text", "ตัวหนังสือรอง"),
    "rule": ("Lines, dividers", "เส้นบรรทัด เส้นคั่น"),
    "rule-strong": ("Strong borders", "ขอบเข้ม"),
    "stamp": ("Primary action, seal, 'you'", "ปุ่มหลัก ตราครั่ง ฝั่งเธอ"),
    "stamp-ink": ("Text on stamp colour", "ตัวหนังสือบนสีแสตมป์"),
    "stamp-soft": ("Selected, pale stamp", "เลือกอยู่ แสตมป์จาง"),
    "wax": ("Pressed / hover stamp", "ตอนกดปุ่มหลัก"),
    "airmail": ("Partner, links, focus", "ฝั่งคู่ ลิงก์ โฟกัส"),
    "airmail-ink": ("Text on airmail", "ตัวหนังสือบนสีแอร์เมล"),
    "airmail-soft": ("Partner sheet, rest day", "กระดาษของคู่ วันพัก"),
    "postmark": ("Past, quiet, missed", "อดีต เงียบ วันที่พลาด"),
    "kraft": ("Envelopes, moments dot", "ซองกระดาษ จุดช่วงเวลา"),
}


def sheet_colours():
    s = Sheet("01-colours", "Colours per theme (theme.json → tokens)", "สีของแต่ละธีม", [
        "Every theme is a folder in public/themes/<id>. Colours live in theme.json → \"tokens\". Themes that \"extends\": \"dusk\" only list what changes.",
        "ทุกธีมคือโฟลเดอร์ใน public/themes · สีอยู่ใน theme.json → tokens · ธีมลูกใส่เฉพาะค่าที่ต่างจากธีมแม่",
    ])
    sw = 66
    for tid, t in T.items():
        name = f'{t["name"].get("th", tid)} · {t["name"].get("en", tid)}'
        s.heading(f"{name}   (public/themes/{tid})", (t["description"].get("en", "") + "  ·  " + t["description"].get("th", "")) + ("   [dark]" if t["dark"] else ""))
        tok = t["tokens"]
        s.add(f'<rect x="48" y="{s.y}" width="{W - 96}" height="212" rx="14" fill="{tok["ground"]}" stroke="{C["rule"]}"/>')
        for i, (k, (en, th)) in enumerate(ROLES.items()):
            x = 64 + (i % 8) * ((W - 128) / 8)
            y = s.y + 16 + (i // 8) * 98
            v = tok.get(k, "#fff")
            s.add(f'<rect x="{x}" y="{y}" width="{sw}" height="40" rx="8" fill="{v}" stroke="{tok["rule-strong"]}"/>')
            s.add(text(x, y + 56, k, 12, tok["ink"], 600))
            s.add(text(x, y + 70, v if len(v) < 22 else v[:20] + "…", 10.5, tok["ink-soft"]))
            s.add(text(x, y + 84, th, 10.5, tok["ink-soft"]))
        s.y += 230
    s.heading("Other tokens", "โทเค็นอื่น ๆ")
    other = [
        ("radius", "Corner radius of paper / มุมโค้ง"),
        ("paper-shadow", "Shadow under paper / เงาใต้กระดาษ"),
        ("lift-shadow", "Shadow when lifted / เงาตอนยก"),
        ("ground-size", "Desk texture tile size, or cover / ขนาดลายพื้นโต๊ะ"),
        ("paper-size", "Paper grain tile size / ขนาดลายกระดาษ"),
        ("button-size", "Button texture tile size / ขนาดลายปุ่ม"),
        ("grunge-size", "Worn-ink mask tile size / ขนาดลายหมึกซีด"),
        ("ink-frames", "Frames in textures/ink.png / จำนวนเฟรมหมึก"),
    ]
    for i, (k, d) in enumerate(other):
        s.add(text(64, s.y + i * 22, k, 13, weight=600))
        s.add(text(220, s.y + i * 22, str(C.get(k, "—")), 13, C["airmail"]))
        s.add(text(560, s.y + i * 22, d, 12, C["ink-soft"]))
    s.y += len(other) * 22
    return s.save()


# ── 02 logo ────────────────────────────────────────────────────────────
def sheet_logo():
    s = Sheet("02-logo", "Logo: logo/stamp.png (per theme)", "โลโก้แสตมป์", [
        "logo/stamp.png · 2x/3x PNG, transparent, ratio 48:56 (e.g. 288×336). Used in the top bar (32px tall), welcome page (48px) and app icon.",
        "PNG โปร่งใส อัตราส่วน 48:56 ใช้ที่แถบบน (สูง 32px) หน้าแรก (48px) · ธีมไหนไม่มีไฟล์นี้จะใช้ของ dusk",
    ])
    x = 48
    for tid, t in T.items():
        p = THEMES / tid / "logo" / "stamp.png"
        if not p.exists():
            continue
        tok = t["tokens"]
        s.add(f'<rect x="{x}" y="{s.y}" width="360" height="300" rx="14" fill="{tok["ground"]}" stroke="{C["rule"]}"/>')
        s.add(image(p, x + 30, s.y + 30, 144, 168))
        s.add(image(p, x + 210, s.y + 60, 48, 56))
        s.add(image(p, x + 280, s.y + 72, 27, 32))
        tilt = 'transform="rotate(-6 12 14)"'
        mark = image(p, 0, -24, 24, 28, tilt)
        word = text(32, 0, "เรา", 26, tok["ink"], family=HAND)
        s.add(f'<g transform="translate({x + 210} {s.y + 170})">{mark}{word}</g>')
        s.add(text(x + 20, s.y + 240, f"{tid}/logo/stamp.png", 13, tok["ink"], 600))
        s.add(text(x + 20, s.y + 262, "144 · 48 · 32 px  +  wordmark", 11.5, tok["ink-soft"]))
        x += 384
    s.y += 320
    s.heading("Wordmark", "ชื่อแอปใช้ฟอนต์ลายมือ Itim และพื้นผิวหมึกซีด (textures/grunge.png)")
    s.add(text(64, s.y + 50, "เรา", 64, C["ink"], family=HAND, extra='mask="url(#wm-grunge)"'))
    s.defs.append(
        f'<pattern id="wm-grunge-p" width="240" height="240" patternUnits="userSpaceOnUse">'
        f'{image(THEMES / "dusk/textures/grunge.png", 0, 0, 240, 240)}</pattern>'
        f'<mask id="wm-grunge" maskContentUnits="userSpaceOnUse" style="mask-type:alpha"><rect width="{W}" height="4000" fill="url(#wm-grunge-p)"/></mask>'
    )
    s.y += 80
    return s.save()


# ── picture group sheets / แผ่นกลุ่มภาพ ─────────────────────────────────
def sheet_group(slug, group, title_en, title_th, intro, label=None, size_note="", cell=128, icon=56):
    s = Sheet(slug, title_en, title_th, intro + RULES_MONO)
    items = []
    for p in files(group):
        key = p.name[: -len(".color.svg")] if p.name.endswith(".color.svg") else p.stem
        en, th = label(key) if label else (key, "")
        items.append((p, p.name, f"{en} · {th}" if th else en))
    s.heading(f"public/themes/dusk/{group}/  ·  {len(items)} files", size_note)
    grid(s, items, cell=cell, icon=icon, colour=C["ink"])
    s.heading("On paper, in context", "ตัวอย่างบนกระดาษ ขนาดจริงในแอป")
    s.add(card(48, s.y, W - 96, 96))
    for i, (p, *_rest) in enumerate(items[:24]):
        s.add(picture(p, 72 + i * 44, s.y + 22, 24, C["ink"]))
        if i < 12:
            s.add(picture(p, 72 + i * 88, s.y + 56, 28, C["stamp"] if i % 2 else C["airmail"]))
    s.y += 112
    return s.save()


def lang(prefix):
    return lambda k: (EN.get(f"{prefix}.{k}", k), TH.get(f"{prefix}.{k}", ""))


# ── 09 textures / พื้นผิว ─────────────────────────────────────────────────
def sheet_textures():
    s = Sheet("09-textures", "Textures & images (theme.json → images)", "พื้นผิวและรูปภาพ", [
        "Semi-transparent PNGs laid over the theme colours, so one texture works for light and dark themes. Tile sizes are tokens (ground-size …).",
        "PNG โปร่งแสงวางทับสีของธีม ใช้ได้ทั้งธีมสว่างและมืด · ใช้รูปถ่ายเต็มจอได้ ตั้ง ground-size เป็น cover",
    ])
    tx = [
        ("textures/desk.png", "ground", "Desk behind everything · tiles at ground-size", "พื้นโต๊ะ ปูซ้ำ", C["ground"]),
        ("textures/paper-grain.png", "paper", "Fibres on every sheet of paper · paper-size", "เส้นใยบนกระดาษทุกแผ่น", C["paper"]),
        ("textures/grunge.png", "grunge", "ALPHA MASK for worn stamp ink (stamps, calendar, labels, wordmark). Opaque = ink stays.", "หน้ากากหมึกซีด ทึบ = หมึกอยู่ โปร่ง = หมึกลอก ให้ทึบเป็นส่วนใหญ่", C["stamp"]),
    ]
    for path, key, en, th, under in tx:
        p = THEMES / "dusk" / path
        s.heading(f"{path}   →  images.{key}", f"{en}  ·  {th}")
        pid = f"pat-{key}"
        s.defs.append(f'<pattern id="{pid}" width="200" height="200" patternUnits="userSpaceOnUse">{image(p, 0, 0, 200, 200)}</pattern>')
        if key == "grunge":
            s.defs.append(f'<mask id="m-{key}" maskContentUnits="userSpaceOnUse" style="mask-type:alpha"><rect width="{W}" height="9000" fill="url(#{pid})"/></mask>')
            s.add(f'<rect x="48" y="{s.y}" width="300" height="200" fill="#bbb"/>{image(p, 48, s.y, 300, 200)}')
            s.add(f'<g mask="url(#m-{key})"><rect x="380" y="{s.y + 30}" width="300" height="140" rx="10" fill="none" stroke="{under}" stroke-width="8"/>'
                  f'{text(530, s.y + 122, "ปิดผนึก", 54, under, 600, anchor="middle")}</g>')
            s.add(text(720, s.y + 60, "Method 4 (mask-image): the PNG's alpha", 13, weight=600))
            s.add(text(720, s.y + 80, "cuts holes in whatever it is applied to.", 13))
            s.add(text(720, s.y + 104, "หน้ากากตัดหมึกตามความโปร่งใสของ PNG", 12, C["ink-soft"]))
        else:
            s.add(f'<rect x="48" y="{s.y}" width="300" height="200" fill="url(#{pid})" stroke="{C["rule"]}"/>')
            s.add(f'<rect x="380" y="{s.y}" width="300" height="200" rx="10" fill="{under}"/><rect x="380" y="{s.y}" width="300" height="200" rx="10" fill="url(#{pid})"/>')
            night = T["night"]["tokens"]["paper" if key == "paper" else "ground"]
            s.add(f'<rect x="712" y="{s.y}" width="300" height="200" rx="10" fill="{night}"/><rect x="712" y="{s.y}" width="300" height="200" rx="10" fill="url(#{pid})"/>')
            s.add(text(380, s.y + 220, "on dusk", 11, C["ink-soft"]))
            s.add(text(712, s.y + 220, "on night", 11, C["ink-soft"]))
        s.y += 236

    # ink sprite
    p = THEMES / "dusk/textures/ink.png"
    frames = int(C.get("ink-frames", 25))
    import struct
    pw, ph = struct.unpack(">II", p.read_bytes()[16:24])
    fr = pw / frames / ph  # frame width / height
    s.heading("textures/ink.png   →  ink transition sprite", f"{frames} frames in ONE row, any frame shape (this one: {pw}×{ph} px = {frames} × {pw // frames}×{ph}). Only the alpha is used; the app paints it in the theme ink. Frame 1 = a drop, last = fully covered.")
    s.add(text(48, s.y, "แอนิเมชันหมึกซึมตอนเปลี่ยนหน้า: เฟรมเรียงแถวเดียว สีดำ+โปร่งใส เฟรมแรกหยดเล็ก เฟรมสุดท้ายเต็มจอ", 12, C["ink-soft"]))
    s.y += 16
    fw = (W - 96) / 5
    cw, chh = fw - 10, (fw - 10) / fr
    # embed the sprite once, reuse it per frame; shown as a mask in the ink colour
    # ฝังภาพครั้งเดียว ใช้เป็นหน้ากากสีหมึกเหมือนในแอป
    s.defs.append(f'<image id="ink-sprite" width="{frames * cw}" height="{chh}" href="{data_uri(p)}" preserveAspectRatio="none"/>')
    picks = [round(j * (frames - 1) / 9) for j in range(10)]
    for i, f in enumerate(picks):
        x = 48 + (i % 5) * fw
        y = s.y + (i // 5) * (chh + 30)
        s.defs.append(f'<clipPath id="ink-c{i}"><rect x="{x}" y="{y}" width="{cw}" height="{chh}"/></clipPath>'
                      f'<mask id="ink-m{i}" style="mask-type:alpha" maskUnits="userSpaceOnUse"><use href="#ink-sprite" x="{x - f * cw}" y="{y}"/></mask>')
        s.add(f'<rect x="{x}" y="{y}" width="{cw}" height="{chh}" fill="{C["paper"]}" stroke="{C["rule"]}"/>')
        s.add(f'<g clip-path="url(#ink-c{i})"><rect x="{x}" y="{y}" width="{cw}" height="{chh}" fill="{C["ink"]}" mask="url(#ink-m{i})"/></g>')
        s.add(text(x + cw / 2, y + chh + 16, f"frame {f + 1}", 11, C["ink-soft"], anchor="middle"))
    s.y += 2 * (chh + 30) + 8
    return s.save()


# ── 10 buttons & seal / ปุ่มและตราครั่ง ──────────────────────────────────
def sheet_buttons():
    s = Sheet("10-buttons", "Buttons & wax seal (buttons/)", "ปุ่มและตราครั่ง", [
        "buttons/primary.png tiles over the stamp colour on main buttons (button-size). buttons/seal.png covers the round wax seal (64px, shown 2x here).",
        "ผิวปุ่มหลักปูทับสีแสตมป์ · ผิวตราครั่งคลุมวงกลม 64px · PNG โปร่งแสง ใช้สีของธีมด้านล่าง",
    ])
    bp, sp = THEMES / "dusk/buttons/primary.png", THEMES / "dusk/buttons/seal.png"
    s.defs.append(f'<pattern id="btn-p" width="128" height="128" patternUnits="userSpaceOnUse">{image(bp, 0, 0, 128, 128)}</pattern>')
    s.heading("buttons/primary.png  →  images.button", "Primary · pressed (wax) · secondary · ghost · disabled — height 40 (sm 32), radius 999")
    x = 48
    for label, fill, ink, tex, op in [
        ("ปิดผนึกแล้วส่ง", C["stamp"], C["stamp-ink"], True, 1),
        ("pressed", C["wax"], C["stamp-ink"], True, 1),
        ("รอง · secondary", C["paper-2"], C["ink"], False, 1),
        ("ghost", "none", C["ink"], False, 1),
        ("disabled", C["stamp"], C["stamp-ink"], True, 0.5),
    ]:
        w = 200
        s.add(f'<g opacity="{op}"><rect x="{x}" y="{s.y}" width="{w}" height="44" rx="22" fill="{fill}" stroke="{C["rule"] if fill == "none" else "none"}"/>'
              + (f'<rect x="{x}" y="{s.y}" width="{w}" height="44" rx="22" fill="url(#btn-p)"/>' if tex else "")
              + f'<rect x="{x}" y="{s.y + 40}" width="{w}" height="4" rx="2" fill="#000" opacity="{0.14 if tex else 0}"/>'
              + text(x + w / 2, s.y + 28, label, 15, ink, 600, anchor="middle") + "</g>")
        x += w + 18
    s.y += 64
    s.add(f'<rect x="48" y="{s.y}" width="256" height="256" fill="#bbb"/>{image(bp, 48, s.y, 256, 256)}')
    s.add(text(330, s.y + 24, "Texture alone (128×128, shown 2x) · โปร่งแสง ไม่มีสี", 12, C["ink-soft"]))
    s.y += 276

    s.heading("buttons/seal.png  →  images.seal", "Round wax seal: send button (64px) and the small seal on your letter (40px). Draw a full circle; the app clips it round.")
    for i, (size, fill) in enumerate([(128, C["stamp"]), (64, C["stamp"]), (40, C["stamp"]), (128, T["night"]["tokens"]["stamp"])]):
        cx = 48 + [0, 170, 260, 340][i]
        s.add(f'<circle cx="{cx + size / 2}" cy="{s.y + 64}" r="{size / 2}" fill="{fill}"/>{image(sp, cx, s.y + 64 - size / 2, size, size)}')
        icon = THEMES / "dusk/icons/seal.svg"
        if icon.exists():
            s.add(inline_svg(icon, cx + size * 0.3, s.y + 64 - size * 0.2, size * 0.4, T["night"]["tokens"]["stamp-ink"] if i == 3 else C["stamp-ink"]))
    s.add(text(520, s.y + 50, "128 · 64 · 40 px, and on the night theme colour", 12, C["ink-soft"]))
    s.add(text(520, s.y + 70, "ขนาดจริง 64 และ 40 px · ตัวอย่างบนสีธีมกลางคืน", 12, C["ink-soft"]))
    s.y += 150
    return s.save()


# ── 11 components / ชิ้นส่วน UI ──────────────────────────────────────────
def perforated(x, y, w, h, face, hole: float = 2, gap: float = 7, pid="perf"):
    """Postage-stamp edge drawn as a face with holes punched round the border."""
    holes = []
    n_x, n_y = max(2, int(w // gap)), max(2, int(h // gap))
    for i in range(n_x + 1):
        hx = x + i * w / n_x
        holes += [(hx, y), (hx, y + h)]
    for j in range(1, n_y):
        hy = y + j * h / n_y
        holes += [(x, hy), (x + w, hy)]
    mask = f'<mask id="{pid}"><rect x="{x - 4}" y="{y - 4}" width="{w + 8}" height="{h + 8}" fill="#fff"/>' + "".join(
        f'<circle cx="{a:.1f}" cy="{b:.1f}" r="{hole}" fill="#000"/>' for a, b in holes) + "</mask>"
    return mask, f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{face}" mask="url(#{pid})"/>'


def sheet_components():
    s = Sheet("11-components", "Components built from the theme", "ชิ้นส่วน UI ที่ประกอบจากธีม", [
        "Not files: these are drawn by the app from the colours and textures above. Shown so the designer can judge the theme as a whole.",
        "ส่วนนี้แอปวาดเองจากสีและพื้นผิวของธีม แสดงไว้ให้เห็นภาพรวมเวลาออกแบบธีม",
    ])
    g = THEMES / "dusk/textures/grunge.png"
    s.defs.append(f'<pattern id="gr" width="240" height="240" patternUnits="userSpaceOnUse">{image(g, 0, 0, 240, 240)}</pattern>'
                  f'<mask id="inked" maskContentUnits="userSpaceOnUse" style="mask-type:alpha"><rect width="{W}" height="9000" fill="url(#gr)"/></mask>')
    pg = THEMES / "dusk/textures/paper-grain.png"
    s.defs.append(f'<pattern id="pg" width="256" height="256" patternUnits="userSpaceOnUse">{image(pg, 0, 0, 256, 256)}</pattern>')
    s.defs.append(
        f'<pattern id="airmail" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
        f'<rect width="9" height="30" fill="{C["stamp"]}"/><rect x="15" width="9" height="30" fill="{C["airmail"]}"/></pattern>')

    s.heading("Letter paper + airmail edge", ".paper · .airmail-edge · radius token · paper-shadow")
    y = s.y
    s.add(card(48, y, 520, 220, r=11) + f'<rect x="48" y="{y}" width="520" height="220" rx="11" fill="url(#pg)"/>')
    s.add(f'<clipPath id="ae"><rect x="48" y="{y}" width="520" height="220" rx="11"/></clipPath><rect x="48" y="{y}" width="520" height="6" fill="url(#airmail)" clip-path="url(#ae)"/>')
    s.add(text(72, y + 40, "จดหมายวันนี้ · today's letter", 12, C["ink-soft"]))
    s.add(text(72, y + 80, "ปีนี้อยากลองกินอาหารชาติไหน", 26, family=HAND))
    s.add(f'<rect x="72" y="{y + 104}" width="472" height="92" rx="8" fill="{C["paper-2"]}"/>')
    s.add(text(90, y + 128, "คุณ", 12, C["stamp"], 600))
    s.add(text(90, y + 162, "ญี่ปุ่น! ไปด้วยกันนะ", 22, family=HAND))
    s.add(f'<g mask="url(#inked)" transform="rotate(-5 480 {y + 178})"><rect x="440" y="{y + 166}" width="80" height="24" rx="5" fill="none" stroke="{C["stamp"]}" stroke-width="2"/>'
          f'{text(480, y + 183, "ปิดผนึก", 12, C["stamp"], 700, anchor="middle")}</g>')
    s.add(f'<circle cx="536" cy="{y + 104}" r="20" fill="{C["stamp"]}"/>{image(THEMES / "dusk/buttons/seal.png", 516, y + 84, 40, 40)}')
    # partner sheet
    s.add(card(600, y, 552, 220, r=11) + f'<rect x="600" y="{y}" width="552" height="6" rx="3" fill="{C["airmail"]}"/>')
    s.add(f'<rect x="624" y="{y + 30}" width="504" height="160" rx="8" fill="{C["airmail-soft"]}"/>')
    s.add(text(642, y + 58, "Partner", 12, C["airmail"], 600))
    s.add(text(642, y + 96, "อิตาเลียน แต่ทำเองที่บ้าน", 22, family=HAND))
    s.y += 248

    s.heading("Calendar: a sheet of stamps", "complete (red + postmark) · partial (pale) · rest day (blue) · missed (dashed) · today. Each stamp gets its own tilt, nudge and worn ink, seeded by the date.")
    rnd = random.Random(7)
    states = ["complete", "complete", "partial", "complete", "forgiven", "missed", "complete", "partial", "complete", "today", "future", "future", "future", "future"]
    face = {"complete": C["stamp"], "partial": C["stamp-soft"], "forgiven": C["airmail-soft"]}
    s.add(card(48, s.y, 7 * 70 + 40, 2 * 84 + 30, r=11))
    for i, st in enumerate(states):
        cx, cy = 68 + (i % 7) * 70, s.y + 16 + (i // 7) * 84
        rot, dx, dy = rnd.uniform(-6, 6), rnd.uniform(-1.6, 1.6), rnd.uniform(-1.6, 1.6)
        day = str(i + 1)
        tf = f'transform="translate({dx:.1f} {dy:.1f}) rotate({rot:.1f} {cx + 28} {cy + 34})"'
        if st in face:
            m, r = perforated(cx, cy, 56, 68, face[st], pid=f"pf{i}")
            s.defs.append(m)
            ink = C["stamp-ink"] if st == "complete" else C["ink"]
            pm = ""
            if st == "complete":
                pr = rnd.uniform(-35, 35)
                pm = (f'<g transform="rotate({pr:.0f} {cx + 40} {cy + 20})" opacity="0.6" fill="none" stroke="{C["stamp-ink"]}" stroke-width="1.6">'
                      f'<circle cx="{cx + 40}" cy="{cy + 20}" r="13" stroke-dasharray="3 3"/><path d="M{cx + 18} {cy + 38}c4-3 9 3 13 0s9 3 13 0 9 3 13 0"/></g>')
            s.add(f'<g {tf} mask="url(#inked)">{r}{pm}{text(cx + 28, cy + 40, day, 15, ink, 600 if st == "complete" else 400, anchor="middle")}</g>')
        elif st in ("missed", "today"):
            col = C["postmark"] if st == "missed" else C["stamp"]
            s.add(f'<g {tf} mask="url(#inked)"><rect x="{cx}" y="{cy}" width="56" height="68" rx="3" fill="none" stroke="{col}" stroke-width="{1.5 if st == "missed" else 2.5}" stroke-dasharray="4 3"/>'
                  f'{text(cx + 28, cy + 40, day, 15, col, 600 if st == "today" else 400, anchor="middle")}</g>')
        else:
            s.add(text(cx + 28, cy + 40, day, 15, C["ink-soft"], anchor="middle", extra='opacity="0.6"'))
    s.add(text(600, s.y + 40, "Organic placement: rotate ±6°, nudge ±1.6px,", 13))
    s.add(text(600, s.y + 60, "postmark rotated ±35°, grunge offset per day.", 13))
    s.add(text(600, s.y + 86, "วางแบบติดด้วยมือ: เอียง ±6° เลื่อน ±1.6px", 12, C["ink-soft"]))
    s.add(text(600, s.y + 106, "ตราประทับเอียงคนละมุม รอยหมึกต่างกันทุกวัน", 12, C["ink-soft"]))
    s.y += 2 * 84 + 52

    s.heading("Mood stamps, rubber-stamp labels, tab bar", "moods/*.svg inside perforated stamps · .stamp-text · bottom navigation (icons/envelope, stamps, postcard)")
    moods = files("moods")
    for i, p in enumerate(moods):
        cx = 48 + i * 82
        on = i == 2
        m, r = perforated(cx, s.y, 66, 74, C["stamp-soft"] if on else C["paper"], hole=1.6, gap=6, pid=f"mp{i}")
        s.defs.append(m)
        rot = -3 if on else 0
        s.add(f'<g transform="rotate({rot} {cx + 33} {s.y + 37})" mask="url(#inked)">{r}{inline_svg(p, cx + 19, s.y + 10, 28, C["stamp"] if on else C["ink"])}'
              f'{text(cx + 33, s.y + 60, TH.get("mood." + p.stem, p.stem), 11, C["stamp"] if on else C["ink-soft"], anchor="middle")}</g>')
    s.y += 100
    for i, (lbl, col) in enumerate([("ปิดผนึก", C["stamp"]), ("SEALED", C["stamp"]), ("แช่แข็ง", C["postmark"]), ("AIRMAIL", C["airmail"])]):
        cx = 48 + i * 170
        rot = [-4, 3, -6, 2][i]
        s.add(f'<g mask="url(#inked)" transform="rotate({rot} {cx + 60} {s.y + 20})"><rect x="{cx}" y="{s.y}" width="120" height="40" rx="6" fill="none" stroke="{col}" stroke-width="2.5"/>'
              + text(cx + 60, s.y + 27, lbl, 17, col, 700, anchor="middle", extra='letter-spacing="1.5"') + "</g>")
    s.y += 70
    s.add(f'<rect x="48" y="{s.y}" width="390" height="64" fill="{C["paper"]}" stroke="{C["rule"]}"/>')
    for i, (ic, lbl) in enumerate([("envelope", "tabs.daily"), ("stamps", "tabs.overview"), ("postcard", "tabs.moments")]):
        p = THEMES / "dusk/icons" / f"{ic}.svg"
        cx = 48 + i * 130 + 65
        col = C["stamp"] if i == 0 else C["ink-soft"]
        if p.exists():
            s.add(inline_svg(p, cx - 12, s.y + 10, 24, col))
        s.add(text(cx, s.y + 52, TH.get(lbl, lbl), 12, col, 600 if i == 0 else 400, anchor="middle"))
    s.y += 80
    return s.save()


# ── 00 overview / ภาพรวม ─────────────────────────────────────────────────
def sheet_overview(sheets):
    s = Sheet("00-overview", "Theme kit for designers", "ชุดออกแบบธีม เรา", [
        "Rao (เรา) is a private letter-writing app for couples: sealed letters, stamps, airmail. Calm, warm, phone-first, Thai-first.",
        "แอปจดหมายส่วนตัวของคู่รัก: จดหมายปิดผนึก แสตมป์ แอร์เมล · อบอุ่น สงบ ใช้บนมือถือเป็นหลัก ภาษาไทยก่อน",
    ])
    s.heading("How a theme works", "ธีมทำงานอย่างไร")
    lines = [
        ("1", "A theme is a folder: public/themes/<id>/ with theme.json + picture folders.", "ธีม = โฟลเดอร์ 1 โฟลเดอร์"),
        ("2", "Pictures are found by NAME (moods/tired.svg). Keep file names; change the drawing.", "แอปหาภาพจากชื่อไฟล์ เปลี่ยนรูปได้ แต่ชื่อต้องเหมือนเดิม"),
        ("3", "\"extends\": \"dusk\" → anything missing comes from dusk. Ship only what you change.", "ไฟล์ที่ไม่มี จะใช้ของธีมแม่"),
        ("4", "PNG/WebP/JPG beat an SVG with the same name in the same folder.", "PNG ชนะ SVG ชื่อเดียวกัน"),
        ("5", "Single-colour SVGs are drawn in BLACK; the app paints them in the theme ink. *.color.svg keeps colours.", "SVG สีเดียววาดสีดำ · *.color.svg คงสีเดิม"),
        ("6", "Textures are semi-transparent PNGs over the theme colours (see 09). Ink transition = one-row sprite.", "พื้นผิวเป็น PNG โปร่งแสงวางทับสี"),
    ]
    for i, (n, en, th) in enumerate(lines):
        y = s.y + i * 44
        s.add(f'<circle cx="62" cy="{y - 5}" r="12" fill="{C["stamp"]}"/>' + text(62, y, n, 13, C["stamp-ink"], 700, anchor="middle"))
        s.add(text(88, y, en, 14))
        s.add(text(88, y + 18, th, 12, C["ink-soft"]))
    s.y += len(lines) * 44 + 8

    s.heading("Folder", "โครงสร้างโฟลเดอร์ (dusk = ธีมเริ่มต้น)")
    tree = [("theme.json", "names, colours, images, sizes")]
    for d in sorted((THEMES / "dusk").iterdir()):
        if d.is_dir():
            fs = files(d.name)
            sample = ", ".join(p.name for p in fs[:4]) + (" …" if len(fs) > 4 else "")
            tree.append((f"{d.name}/", f"{len(fs)} files · {sample}"))
    for i, (a, b) in enumerate(tree):
        s.add(text(72, s.y + i * 22, a, 13, C["airmail"], 600, family="ui-monospace, Menlo, monospace"))
        s.add(text(240, s.y + i * 22, b, 12, C["ink-soft"]))
    s.y += len(tree) * 22 + 8

    s.heading("Themes", "ธีมที่มีตอนนี้")
    for i, (tid, t) in enumerate(T.items()):
        x = 48 + i * 372
        tok = t["tokens"]
        s.add(f'<rect x="{x}" y="{s.y}" width="352" height="130" rx="14" fill="{tok["ground"]}" stroke="{C["rule"]}"/>')
        s.add(f'<rect x="{x + 18}" y="{s.y + 18}" width="200" height="94" rx="10" fill="{tok["paper"]}"/>')
        s.add(text(x + 32, s.y + 56, "วันนี้อะไรทำให้ยิ้ม?", 15, tok["ink"], family=HAND))
        s.add(f'<circle cx="{x + 190}" cy="{s.y + 90}" r="13" fill="{tok["stamp"]}"/>')
        s.add(text(x + 236, s.y + 50, t["name"].get("th", tid), 18, tok["ink"], 600))
        s.add(text(x + 236, s.y + 72, t["name"].get("en", tid), 12, tok["ink-soft"]))
        s.add(text(x + 236, s.y + 92, f"themes/{tid}" + (" (default)" if i == 0 else ""), 11, tok["ink-soft"]))
    s.y += 150

    s.heading("Sheets in this kit", "ไฟล์ในชุดนี้")
    for i, sl in enumerate(sheets):
        s.add(text(72, s.y + i * 22, f"{sl}.svg", 13, C["airmail"], 600, family="ui-monospace, Menlo, monospace"))
    s.y += len(sheets) * 22
    return s.save()


def main():
    sheets = [
        sheet_colours(),
        sheet_logo(),
        sheet_group("03-icons", "icons", "UI icons (icons/)", "ไอคอนในแอป", [
            "24×24 viewBox, 1.75 stroke, round caps/joins, ~2px padding (Lucide-style). Shown at 56px on a 24-unit keyline.",
            "viewBox 24×24 เส้นหนา 1.75 ปลายมน เว้นขอบ ~2px",
        ], size_note="Shown at 56px; used at 16–24px", icon=48, cell=112),
        sheet_group("04-moods", "moods", "Mood stamps (moods/)", "แสตมป์อารมณ์", [
            "8 moods, one per file. Drawn inside a perforated stamp at 28px, label below. Same face shape, different expression.",
            "8 อารมณ์ วาดในแสตมป์ขนาด 28px ใช้หน้ารูปทรงเดียวกัน เปลี่ยนแค่สีหน้า",
        ], label=lang("mood"), size_note="Used at 20–28px"),
        sheet_group("05-faces", "faces", "Survey faces (faces/1–5)", "หน้าแบบสอบถาม 1–5", [
            "1 = not good … 5 = love it. Used in the 14-day survey and admin insights.",
            "1 = ไม่ดี … 5 = ชอบมาก ใช้ในแบบสอบถาม 14 วัน",
        ], label=lambda k: (EN.get(f"survey.score_{k}", k), TH.get(f"survey.score_{k}", "")), size_note="Used at 32px"),
        sheet_group("06-reactions", "reactions", "Postcard reactions (reactions/)", "ปฏิกิริยาบนโปสการ์ด", [
            "Tap reactions under a moment. Keys are fixed (love, sweet, aww, crush, yay, melting); the drawing is free.",
            "ชื่อไฟล์ตายตัว รูปเปลี่ยนได้อิสระ",
        ], label=lang("reaction"), size_note="Used at 20px"),
        sheet_group("07-dates", "dates", "Date pictures (dates/)", "ภาพวันสำคัญ", [
            "anniversary, birthday, special, other are required. The rest are choices admins can pick for special days (e.g. Valentine's).",
            "anniversary birthday special other ต้องมี ที่เหลือเป็นตัวเลือกสำหรับวันพิเศษ",
        ], size_note="Used at 20px in lists, 24px in the admin picker"),
        sheet_group("08-decor", "decor", "Empty states & welcome (decor/)", "ภาพตอนยังไม่มีข้อมูล", [
            "Bigger, friendlier drawings shown when a list is empty, while waiting for a partner, and on the welcome page.",
            "ภาพใหญ่ขึ้น ใช้ตอนรายการว่าง รอคู่ และหน้าต้อนรับ",
        ], size_note="Used at 40–64px", icon=72, cell=144),
        sheet_textures(),
        sheet_buttons(),
        sheet_components(),
    ]
    sheets.insert(0, sheet_overview(sheets))
    print("\n".join(f"design/theme-kit/{s}.svg" for s in sheets))


if __name__ == "__main__":
    main()
