# Rao theme kit / ชุดออกแบบธีม เรา

SVG sheets of everything a theme can change, built from the real files in `public/themes/`.
ไฟล์ SVG ของทุกอย่างที่ธีมเปลี่ยนได้ สร้างจากไฟล์ธีมจริง

| Sheet               | What / อะไร                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `00-overview.svg`   | How themes work, folder layout, current themes / ธีมทำงานอย่างไร        |
| `01-colours.svg`    | Colour tokens per theme with their roles / สีและหน้าที่ของแต่ละสี           |
| `02-logo.svg`       | `logo/stamp.png` at real sizes + wordmark / โลโก้                      |
| `03-icons.svg`      | UI icons on a 24-unit keyline / ไอคอน                                 |
| `04-moods.svg`      | 8 mood stamps / แสตมป์อารมณ์                                            |
| `05-faces.svg`      | Survey faces 1–5 / หน้าแบบสอบถาม                                       |
| `06-reactions.svg`  | Postcard reactions / ปฏิกิริยา                                           |
| `07-dates.svg`      | Date pictures / ภาพวันสำคัญ                                             |
| `08-decor.svg`      | Empty states, welcome / ภาพตอนว่าง                                     |
| `09-textures.svg`   | Desk, paper grain, worn-ink mask, ink transition sprite / พื้นผิว        |
| `10-buttons.svg`    | Button grain and wax seal / ปุ่มและตราครั่ง                               |
| `11-components.svg` | Paper, calendar stamps, labels, tab bar (drawn by the app) / ชิ้นส่วน UI |

## Delivering a theme / ส่งงานธีม

1. Send a folder named after the theme (lowercase, a-z 0-9 -) with `theme.json` and only the files you changed.
   ส่งโฟลเดอร์ชื่อธีม มี theme.json และเฉพาะไฟล์ที่เปลี่ยน
2. Keep every file name exactly as in the sheets. ใช้ชื่อไฟล์ตามในชีตทุกตัว
3. Single-colour SVG: draw in black on transparent; the app colours it. Keep colours: name it `*.color.svg`. Or deliver PNG @3x with the same name.
   SVG สีเดียววาดสีดำ · อยากคงสีใช้ `*.color.svg` · หรือส่ง PNG @3x ชื่อเดียวกัน
4. Textures: semi-transparent PNG tiles (seamless), small files (< 80 KB each). `grunge.png` is an alpha mask: mostly opaque.
   พื้นผิว: PNG โปร่งแสงต่อลายได้ ไฟล์เล็ก · grunge.png ส่วนใหญ่ต้องทึบ
5. Ink transition: `textures/ink.png`, frames in one row, black + transparency; set `ink-frames` in theme.json.
   หมึกซึม: เฟรมเรียงแถวเดียว ตั้ง ink-frames ให้ตรง

Rebuild the sheets: `python3 tools/theme-kit/build.py`
