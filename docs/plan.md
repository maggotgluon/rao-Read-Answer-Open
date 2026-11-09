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

## Weekend 2 — Moments + Daily + Overview / ช่วงเวลา รายวัน ภาพรวม (done early, 2026-11-09)
- [x] 3 tabs per space: Overview (calendar) · Daily · Moments; bottom tab bar on phones
- [x] Moments: text + up to 4 photos, private drafts, browser compression + server re-encode (EXIF/GPS stripped)
- [x] Private photo route (members only, drafts author-only, `no-cache` + ETag), reactions (1/person), comments
- [x] Today card: weekday question / weekend quest, reveal, edit-until-partner-answers, 7-day late window
- [x] Prompt library seed (80 questions + 26 quests, th/en — **Thai needs Mag's edit pass**) + couple-written prompts
- [x] Streak with 2 free misses/week; month calendar with day detail
- [x] Events (yearly repeat) + anniversary; upcoming list; activity feed
- [x] Demo history seed (3 weeks) for local testing

## Weekend 3 — Polish & safety / ปรับแต่งและความปลอดภัย
- [ ] UI consistency pass (Mag noted inconsistencies) + brand direction (soft & warm)
- [ ] Moments wall: pagination / "load more" beyond 50
- [ ] Daily backup (DB + photos, keep 7) + off-host copy
- [ ] Mag edits the Thai prompt library

## Weekend 4 — Push, polish, ship / แจ้งเตือนและเปิดใช้

- [ ] Web push (VAPID): partner answered/posted + daily reminder; iOS "Add to Home Screen" onboarding
- [ ] Brand pass (soft & warm), Thai typography check
- [ ] SPF/DKIM/DMARC for host mail; password reset verified end-to-end
- [ ] Ship to `rao.mag.codes` and use it for real
