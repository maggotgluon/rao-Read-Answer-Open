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

## Weekend 3 — Push, themes, library / แจ้งเตือน ธีม คลังคำถาม (2026-11-09)

- [x] Web push: morning question, evening reminder (only if unanswered), partner answered, new moment, comments/reactions, date reminders; per-person switches + times; iPhone install guide
- [x] 3 themes per person (blush default, paper, candle)
- [x] Birthday on profile (+ show age choice); shown in all of a person's spaces
- [x] Moments ↔ our dates + "On this day" memories; anniversary as a date
- [x] Prompt library to 300 + admin page; add-only seeder
- [ ] UI consistency pass (settings pages still partly English, blush background flatter than the mock-up)
- [ ] Mag edits the Thai prompt library (now possible in the admin page)
- [ ] Moments wall: "load more" beyond 50

## Weekend 3b — Long-distance, ratings, admin tools (2026-11-09)

- [x] Feature switches (on/off + free/premium) + premium per space
- [x] Location (auto on open, ~5 km rounding) + distance/city/local time + long-distance mode
- [x] Private 👍/👎 on daily prompts
- [x] Admin: dashboard, users, schedule (prompts for dates + special days), features
- [ ] ~60 long-distance prompts + tag remote-friendly quests (in progress)

## Weekend 4 — Push, polish, ship / แจ้งเตือนและเปิดใช้

- [ ] First real deploy (Plesk) + VAPID keys on the server
- [ ] Daily backup (DB + photos, keep 7) + off-host copy
- [ ] SPF/DKIM/DMARC for host mail; password reset verified end-to-end
- [ ] Ship to `rao.mag.codes` and use it for real
