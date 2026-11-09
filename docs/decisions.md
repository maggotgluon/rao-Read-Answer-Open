# Rao (เรา) — Decisions / การตัดสินใจ

> Result of the "grill me" planning interview, 2026-11-08.
> ผลจากการสัมภาษณ์วางแผน "grill me" วันที่ 8 พ.ย. 2026

## Concept / แนวคิด

**EN:** A calm, private space for two people to share moments and reconnect
through a daily ritual. Not a chat app — chat is for logistics, Rao is for _us_.
Primary users: couples living together who drift apart in busy lives;
second: long-distance couples. Personal use first, built so it can go public.

**TH:** พื้นที่ส่วนตัวที่สงบสำหรับคนสองคน ไว้แชร์ช่วงเวลาและกลับมาใกล้กัน
ผ่านกิจกรรมประจำวัน ไม่ใช่แอปแชท — แชทไว้คุยธุระ แต่ "เรา" มีไว้สำหรับ _เรา_
กลุ่มหลัก: คู่ที่อยู่ด้วยกันแต่ห่างกันเพราะชีวิตยุ่ง รองลงมา: คู่ทางไกล
ใช้เองก่อน แต่ออกแบบให้เปิดสาธารณะได้ในอนาคต

## v1 scope / ขอบเขต v1 (~4 weekends)

| Feature               | Decision / การตัดสินใจ                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Moments               | Shared timeline of photos + quotes/notes. Drafts private until posted, then shared. / ไทม์ไลน์รูป + ข้อความร่วมกัน ร่างเป็นส่วนตัวจนกว่าจะโพสต์                          |
| Reactions & comments  | 1 reaction per person per moment + simple comment thread / 1 รีแอคชันต่อคนต่อโพสต์ + คอมเมนต์                                                                      |
| Daily prompt + reveal | Same prompt for both; partner's answer hidden until you answer. Late answers OK up to 7 days. / คำถามเดียวกัน เห็นคำตอบอีกฝ่ายหลังตอบเอง ตอบย้อนหลังได้ 7 วัน          |
| Prompt content        | ~100 bilingual starter prompts (AI draft, Mag edits Thai), tagged fun/deep/memory/future + couples' own prompts / คำถามตั้งต้น ~100 ข้อ 2 ภาษา + คู่เขียนคำถามเองได้ |
| Streak                | 🔥 counts days both answered, 1–2 freeze days/week, never shaming / นับวันที่ตอบทั้งคู่ มีวันพัก 1–2 วัน/สัปดาห์ ไม่ทำให้รู้สึกผิด                                               |
| Notifications         | Web push: "partner answered/posted" + daily reminder; always shows which space. iOS needs Add to Home Screen. / แจ้งเตือนแบบ push ระบุ space เสมอ               |
| Language              | Thai + English UI from day 1 / ไทย + อังกฤษ ตั้งแต่วันแรก                                                                                                         |
| Login                 | Email + password, long remember-me / อีเมล + รหัสผ่าน (magic link ใช้ไม่ได้ดีกับ PWA บน iPhone)                                                                      |

## Space tabs / แท็บของ space (decided 2026-11-09)

| Tab | Content |
|---|---|
| **Overview / ภาพรวม** (default) | Month calendar: both answered / one answered / free miss ❄️ / missed; dots for events + moments. Tap a day → that day's prompt, answers, moments, events. Today / this week / this month stats. Upcoming dates. Manage dates. Settings. |
| **Daily / รายวัน** | Today's question or quest, streak, earlier days (late answers), "write one for us", today's events, activity feed (last 7 days). |
| **Moments / ช่วงเวลา** | Shared wall: compose (text + up to 4 photos), my drafts, feed, reactions, comments. |

- **Today card:** weekdays = question, Sat/Sun = quest (quests pulled forward from v1.5). Quest = each writes how it went; same reveal rule.
- **Prompt choice:** couple-written first, then random library; never repeats in a space. / คำถามที่คู่เขียนเองมาก่อน ไม่ซ้ำ
- **Editing answers:** allowed until the partner answers, then locked. / แก้ได้จนกว่าอีกฝ่ายจะตอบ
- **Looking back:** if you never answered a day, the partner's answer stays hidden **forever**. / ถ้าไม่ตอบ คำตอบอีกฝ่ายซ่อนตลอดไป
- **Events:** both partners add/edit/delete per space; optional yearly repeat; Feb 29 → Feb 28. Plus an "our anniversary" date in space settings (counts years). / วันสำคัญ ทั้งคู่จัดการได้ ซ้ำทุกปีได้ + วันครบรอบ
- **Activity:** says *that* something happened (answered / quest done / moment / date added) — never answer text or drafts. / บอกแค่ว่ามีอะไรเกิดขึ้น ไม่แสดงเนื้อหา
- **Moments:** up to 4 photos, private drafts, only the author deletes.
- **Photo caching:** `private, no-cache` + ETag — browser must re-check membership every time (found in testing: a year-long cache let a different user on the same browser reuse a photo after logout).

## Spaces & pairing / พื้นที่และการจับคู่

- A space has exactly **2 members** (DB allows N; v1 enforces 2). / 1 space มีสมาชิก 2 คน
- Pairing via invite link/code. / จับคู่ด้วยลิงก์หรือโค้ดเชิญ
- A user may be in **several pair spaces** (poly: A↔B, A↔C, B↔C) with
  **strict walls** — nothing from one space may leak into another
  (feeds, notifications, previews, media). / ผู้ใช้อยู่ได้หลาย space แต่ข้อมูลต้องไม่รั่วข้าม space
- The same two people can't have two active spaces together. / คู่เดิมเปิด space ซ้ำไม่ได้
- One timezone per space (default `Asia/Bangkok`) decides the "day". / แต่ละ space มีโซนเวลาเดียว
- **Unpair:** that space freezes (read-only) for 30 days with export, then is
  deleted. Only the person who froze it can restore it. Other spaces untouched.
  / เลิกจับคู่: space ถูกแช่แข็ง 30 วัน แล้วลบ คนที่กดแช่แข็งเท่านั้นที่กู้คืนได้
- Non-members get **404** (not 403) so a space's existence never leaks. / คนนอกเห็น 404

## Security / ความปลอดภัย

- Photos compressed in the browser (~300–500 KB) and stored **outside the
  public folder**; served only via a route that checks space membership; random filenames.
  / รูปบีบอัดในเบราว์เซอร์ เก็บนอก public เปิดดูได้ผ่าน route ที่เช็คสมาชิกเท่านั้น
- Every query is scoped to the current space. / ทุก query ต้องจำกัดอยู่ใน space ปัจจุบัน
- Public IDs are ULIDs (no guessable integer IDs in URLs). / ใช้ ULID ใน URL

## Tech & hosting / เทคโนโลยีและโฮสติ้ง

- Laravel 13 + Inertia + React (official React starter kit), MySQL, PWA.
- Plesk shared host, `rao.mag.codes`, document root → `/public`, 20 GB disk,
  no SSH / no Composer on host, cron available, Git available.
- **Deploy:** GitHub Actions builds (Composer + npm) → pushes built app to a
  `deploy` branch → Plesk Git pulls it → post-deploy step runs migrations + cache.
- **Cron:** Plesk scheduled task runs `php artisan schedule:run` every minute
  (queue, daily prompts, reminders, backups, purge of frozen spaces).
- **Mail:** Plesk host mail + SPF/DKIM/DMARC; via Laravel mail config so it can swap to Resend/Brevo.
- **Backup:** daily DB dump + photos, keep 7 days. Off-host copy target: **open**.

## Roadmap

- **v1.5:** Quests (do-together challenges), Google login, "Export our space" ZIP
- **v2:** Video moments, group spaces (triads)
- **Out of scope / ไม่ทำ:** chat, AI-generated prompts, native apps, payments

## Open items / เรื่องที่ยังเปิดอยู่

1. Off-host backup target (homelab / Google Drive / B2 / R2) — by weekend 3.
2. Brand direction: "soft & warm" agreed; mock 2–3 directions before UI polish.
3. PDPA / privacy policy — only if it goes public.
4. ~~Host PHP version~~ — resolved: Laravel 13 confirmed running on the server. / ยืนยันแล้วว่าเซิร์ฟเวอร์รัน Laravel 13 ได้
