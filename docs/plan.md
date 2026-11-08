# Rao — v1 Plan / แผน v1 (4 weekends)

## Weekend 1 — Foundation / พื้นฐาน

- [x] Scaffold Laravel 13 + React starter kit (auth: email + password)
- [x] Thai + English UI (per-user locale, guest switch) / ภาษาไทย + อังกฤษ
- [x] Spaces, members, invites (link + code), pairing rules / ระบบ space และการเชิญ
- [x] Strict walls: membership middleware, 404 for outsiders, tests / กำแพงระหว่าง space + เทสต์
- [x] Unpair → freeze 30 days → purge (scheduled), restore by freezer / เลิกจับคู่ แช่แข็ง กู้คืน
- [x] PWA shell: manifest, icons, service worker, offline page
- [x] Deploy pipeline (CI side): GitHub Actions tests → builds → `deploy` branch (see `docs/deploy.md`)
- [ ] Deploy pipeline (server side): Plesk Git pulls `deploy`, `.env`, migrations, cron — first real deploy

## Weekend 2 — Moments / ช่วงเวลา

- [ ] Photo + quote moments; drafts private until posted
- [ ] Client-side image compression; private storage; membership-checked media route
- [ ] Timeline per space; reactions (1/person); comments

## Weekend 3 — Daily prompt + reveal / คำถามประจำวัน

- [ ] Prompt library seed (~100, th/en, tags) + custom prompts per space
- [ ] Daily assignment per space timezone (scheduler)
- [ ] Answer + reveal; late answers ≤ 7 days
- [ ] Streak with 1–2 freeze days/week
- [ ] Daily backup (DB + photos, keep 7) + off-host copy

## Weekend 4 — Push, polish, ship / แจ้งเตือนและเปิดใช้

- [ ] Web push (VAPID): partner answered/posted + daily reminder; iOS "Add to Home Screen" onboarding
- [ ] Brand pass (soft & warm), Thai typography check
- [ ] SPF/DKIM/DMARC for host mail; password reset verified end-to-end
- [ ] Ship to `rao.mag.codes` and use it for real
