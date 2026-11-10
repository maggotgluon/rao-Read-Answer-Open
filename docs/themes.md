# Themes / ธีม

Every theme is a folder in `public/themes/<id>/`. Edit files there on the server — no rebuild needed.
ทุกธีมคือโฟลเดอร์ใน `public/themes/<id>/` แก้ไฟล์บนเซิร์ฟเวอร์ได้เลย ไม่ต้อง build ใหม่

## Folder layout / โครงสร้างโฟลเดอร์

```
public/themes/
  dusk/                  default theme (always on) / ธีมเริ่มต้น (เปิดเสมอ)
    theme.json           names, colours, images / ชื่อ สี รูป
    logo/stamp.png       the stamp logo / โลโก้แสตมป์
    icons/*.svg          UI icons (envelope, seal, check, plus, …) / ไอคอนในแอป
    moods/*.svg          8 mood stamps: happy loved excited calm tired stressed sad sick
    faces/1-5.svg        survey faces / หน้าในแบบสอบถาม
    reactions/*.svg      love sweet aww crush yay melting / ปฏิกิริยาบนโปสการ์ด
    dates/*.svg          anniversary birthday special other valentine + extras for special days
    decor/*.svg          empty states & welcome / ภาพตอนยังไม่มีข้อมูล
    textures/  buttons/  optional images used by theme.json / รูปเสริม
  daytime/  theme.json   { "extends": "dusk" } + only what changes / เฉพาะส่วนที่ต่าง
  night/    theme.json   + logo/stamp.png
```

## Rules / กติกา

1. **Pictures by name.** The app asks for `group.name` (e.g. `moods.tired` → `moods/tired.svg`). Keep the file name, change the drawing.
   แอปเรียกภาพตามชื่อ เปลี่ยนรูปได้แต่ให้ชื่อไฟล์เหมือนเดิม
2. **Fallback.** A theme with `"extends": "dusk"` uses dusk's file for anything it doesn't have.
   ธีมที่ extends จะใช้ไฟล์ของธีมแม่ถ้าไม่มีของตัวเอง
3. **SVG → PNG.** Put `icons/envelope.png` next to (or instead of) `icons/envelope.svg`: PNG/WebP/JPG win over SVG in the same folder.
   วาง PNG ชื่อเดียวกัน PNG จะถูกใช้แทน SVG
4. **Colour.** Single-colour SVGs in `icons moods faces reactions dates decor` are recoloured with the theme's ink (CSS mask), so draw them in black. To keep an SVG's own colours, name it `*.color.svg`. PNGs always show as drawn.
   SVG สีเดียววาดเป็นสีดำ แอปจะลงสีตามธีม ถ้าอยากคงสีเดิมตั้งชื่อ `*.color.svg`
5. **theme.json**
    - `name`, `description`: `{ "th": "…", "en": "…" }`
    - `dark`: true for dark themes; `status_bar`: phone status-bar colour
    - `tokens`: colours (`ground paper paper-2 ink ink-soft rule rule-strong stamp stamp-ink stamp-soft wax airmail airmail-ink airmail-soft postmark kraft`), `paper-shadow`, `lift-shadow`, `radius`
    - `images` (optional, paths inside the theme folder): `ground` (desk background), `paper` (letter sheets), `button` (main buttons), `seal` (the wax seal button), `airmail-edge` (stripe)
    - `mono`: which groups are recoloured (default above)
6. **New theme.** Copy `daytime/`, rename the folder (lowercase, a-z 0-9 -), edit `theme.json`. It appears in Settings → Theme and in Admin → Features → Themes, where you can switch it off or make it premium.
   คัดลอกโฟลเดอร์ เปลี่ยนชื่อ แก้ theme.json แล้วจะเห็นในหน้าตั้งค่าและหน้าแอดมิน
7. **Cache.** Changes are picked up automatically (file times); browsers get new files because URLs carry `?v=`.

## Credits / ที่มา

See `public/themes/dusk/CREDITS.md`. Valentine pictures: SVG Repo "Saint Valentine Outline", CC0 (full set in `brand/`). UI glyphs: Lucide (ISC).
