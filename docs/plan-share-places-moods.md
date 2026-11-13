# Plan: sharing, places, together/apart log, mood history

# แผน: แชร์ออกโซเชียล สถานที่ บันทึกใกล้/ไกล ประวัติอารมณ์

Status: approved; phase 1 done. / อนุมัติแล้ว เสร็จเฟส 1

Decisions (Mag, 2026-11-12) / สิ่งที่ตัดสินใจแล้ว:

- Sharing = a picture card made on the phone + an optional public link the owner can turn off.
- Shareable: your own postcards and shared achievements. A letter pair or the partner's postcard
  needs the partner's OK first.
- Places = pinned places (where we met, first date…) on postcards and dates, plus an optional
  automatic city list.
- Together/apart log = timeline of periods + distance on each day both shared their location.
- Past moods = on calendar days, in the day's details, and a small monthly summary.

Order: small and fixes confusion first; the most privacy-sensitive last.
ลำดับ: งานเล็กที่แก้ความสับสนก่อน งานที่อ่อนไหวเรื่องความเป็นส่วนตัวที่สุดไว้ท้าย

---

## Phase 1: Mood history / ประวัติอารมณ์ (small) ✅ done (0.14.0)

Data already exists (`moods`, one per person per day). Only UI + one query.

- Calendar: two tiny mood marks on each day (you + partner).
- Day details: "You: tired · Partner: loved".
- Monthly summary under the calendar: most common mood for each of you, number of days stamped.
- Partner sees your past moods (they already see today's). Hidden when the mood feature is off.
- Tests: month query is space-scoped; outsider 404.

## Phase 2: Together / apart log / บันทึกช่วงอยู่ใกล้–ไกล (medium)

New tables:

- `space_mode_changes` (space, long_distance on/off, changed_at, changed_by). The first row is
  created from today's mode when the migration runs (we don't know the past).
- `space_distance_days` (space, date, km rounded to 10 km). Written at most once a day, only on
  days **both** partners share their location (same rule as today).

UI (Calendar tab or a "Our story" section):

- Timeline: "Together since 3 Mar · 8 months", "Apart 12 Jan – 2 Mar · 7 weeks".
- Small distance line for the month (days with no data are left empty, not zero).
- Totals: days together / days apart.

Privacy: only km between you (no places, no coordinates). Deleted with the space; in export.

## Phase 3: Places / สถานที่ของเรา (medium–large)

3a. Pinned places (both partners can add/edit):

- `places` (space, name, kind: met / first-date / home / trip / food / other, city, optional
  lat/lng rounded to ~100 m, note, date, created_by).
- Find a place by search (OpenStreetMap Nominatim, already used for city names), "here" (one-time
  location), or just type a name with no map point.
- Attach a place to a postcard or a date (`moments.place_id`, `space_events.place_id`).
- "Our places" list grouped by kind, each with its postcards and dates.
- Map view: optional, OpenStreetMap tiles; this sends the viewer's IP to OSM, so the list works
  without it. (Decide later: map yes/no.)

3b. Automatic city history (off by default, a separate switch from "share location"):

- `city_visits` (user, city, country, from, to). A new row only when the city changes; city
  level only, never coordinates.
- Shown as "Places we've been" next to the together/apart timeline. Turning the switch off
  offers to delete the history.

Legal: privacy policy + consent text need an update (location history is new personal data;
pinned places are content). / ต้องแก้นโยบายความเป็นส่วนตัวและข้อความยินยอม

## Phase 4: Achievements / ความสำเร็จ (medium)

Stored when earned (`achievements`: space, key, earned_at), so a broken streak never takes
one away (fits "never shame"). No "lost" or "missed" badges.

- Stamps in a row: 7, 30, 100, 365
- Letters together: 10, 50, 100, 365
- Postcards: 10, 50, 100
- Days since pairing: 100, 365, 1000, and each anniversary year
- Firsts: first letter pair, first postcard, first place pinned
  Shown as a stamp sheet; a new one gets a small celebration + push (setting).
  Pictures: `achievements/<key>.svg` in the theme folder (dusk first; others fall back).

## Phase 5: Sharing / แชร์ออกโซเชียล (large)

5a. Picture card (no server involvement):

- Made on the phone (canvas): 1080×1350 (feed) and 1080×1920 (story).
- Postcard card: photo + caption + date + small "เรา" mark. Achievement card: badge + number.
- Names hidden by default (switch to show first names).
- Phone share sheet (Web Share API with the image); "Save image" where sharing files isn't
  supported (some Android/desktop browsers).

5b. Public link (optional, per item):

- `share_links` (random token, owner, item, card image, created_at, revoked_at, views).
- `/p/<token>` shows ONLY the card image + caption, never the original photo, comments or the
  space. noindex; preview card = the same picture.
- "My shared links" in settings: see all, turn off any. Turned-off link = 404 and the image file
  is deleted. Deleting the postcard/account turns its links off.

5c. Partner's OK (letter pair, partner's postcard):

- "Ask to share" → partner gets a push → Allow / Not now. Allow is for one item, one time.
- Without OK the share button for that item isn't shown (hide, don't grey out).

Legal: terms + privacy (public links make content public by the owner's choice; we don't
post anything ourselves).

---

## Open questions for later / ค้างตัดสินใจ

- Map view in 3a: yes (OSM tiles) or list only?
- Share card style per theme, or one fixed style?
- Feature switches for each phase in Admin → Features (default on)?

## Not in scope / ไม่ทำ

- Posting directly to Facebook/IG via their APIs (needs app review; the share sheet covers it).
- Public profiles, public feeds, likes from strangers.
