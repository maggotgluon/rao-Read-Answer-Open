# Share images / ภาพตัวอย่างลิงก์

`public/og/rao-default.png` (every page) and `public/og/rao-invite.png` (invite links), 1200×630.
Used by `App\Support\Seo` for `og:image` / `twitter:image`.

Rebuild after changing `cards.js` (needs the dev server, so the real fonts and textures load):
สร้างใหม่หลังแก้ `cards.js` (ต้องเปิด dev server ไว้)

1. Open `http://127.0.0.1:8000/?lang=th` in Chrome with the window at exactly 1200×630
   (DevTools → device toolbar → Responsive 1200×630, zoom 100%).
2. Paste the contents of `cards.js` into the console, then run `raoOgCard('default')`
   (or `raoOgCard('invite')`).
3. DevTools → ⋮ → **Capture screenshot** → save over `public/og/rao-<kind>.png`.

Keep important content away from the edges (some apps crop to a square or 1.91:1).
The `?v=` on the image URL changes by itself when the file changes, so chat apps fetch the new one
(LINE/Facebook may still cache old previews for a while; Facebook's Sharing Debugger can refresh).
