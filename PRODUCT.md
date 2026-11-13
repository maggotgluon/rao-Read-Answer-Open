# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Couples in a relationship, Thai first (Thai + English UI from day one). Mostly couples who live together; long-distance couples are a close second. Poly people can be in several pair spaces (A–B, A–C), each a separate private space.

They use Rao on their phone, mostly as an installed PWA, in short check-ins: in the morning (today's question), in the evening in bed (answer, see the partner's answer, look at moments). Desktop works but is secondary.

Their job: stay close and keep exploring each other: answer one small question or quest a day, share moments, remember dates, and feel the other person's presence even when apart.

## Product Purpose

A private shared space for two people, not a chat app and not a social network. Each day a question (weekdays) or quest (weekends) arrives; the partner's answer is revealed only after you answer. Moments form a shared wall; dates (anniversary, birthdays, special days) and "On this day" memories bring the past back. Success = couples coming back on their own, most days, because it feels good, not because they're nagged.

## Positioning

"Our private little place." Only the two of you are ever inside a space (strict walls; others get a 404). The reveal-after-you-answer mechanic, gentle streaks with 2 free misses a week, and memories tied to your own dates make it about the two of you, not about an audience or productivity.

## Operating Context

- Morning push: today's question/quest (+ date reminders). Evening push only if you haven't answered.
- Three tabs per space: Overview (month calendar, streak, dates), Daily (today's card, streak, activity), Moments (shared wall).
- Long-distance mode: distance, partner's city and local time; long-distance prompts.
- Admin area (Mag only): dashboard, users, prompt library, schedule, feature switches. Operate surface, numbers only.

## Capabilities and Constraints

- Laravel 13 + Inertia + React + Tailwind v4 + shadcn/ui; PWA; deployed on Plesk shared hosting (no SSH, no Node at runtime: all assets built in CI).
- Bilingual TH/EN everywhere; Thai text runs longer and needs a Thai-capable font (currently Noto Sans Thai / Mali for blush).
- Per-person themes: blush (default), paper, candle (dark). The themes may be reworked, the idea of 3 per-person themes stays.
- Privacy is a product feature: partner answers hidden until you answer, private photos, rounded locations, private ratings, admin sees counts only.
- Feature switches may hide photos, quests, couple prompts, location, memories, themes, multiple spaces: UI must degrade cleanly when a feature is off.

## Brand Commitments

- Name: "เรา" (Thai, "we/us") / "Rao". Fixed.
- No logo exists yet; a new one is wanted.
- Voice: warm, personal, playful but calm. Never guilt-tripping (streaks forgive), never salesy. Emoji are welcome as part of the voice.
- Not like a social network, not like a productivity tool.

## Evidence on Hand

- Real copy in `lang/th.json`, `lang/en.json`; 360 bilingual prompts in `database/data/prompts.php`.
- Demo data via `php artisan migrate:fresh --seed` (dev only).
- No testimonials, users, metrics or press exist. Don't invent any.

## Product Principles

1. Two people, one private place: every screen should feel like it belongs to "us", never to an audience.
2. Small daily ritual over big features: the daily card is the heart; everything else supports coming back tomorrow.
3. Gentle, never guilt: streaks forgive, reminders are soft, missing a day is fine.
4. Privacy you can feel: say plainly what the partner/admin can and can't see.
5. Thai first, bilingual always.

## Accessibility & Inclusion

Phone-first touch targets; respects reduced motion; Thai and English text both readable at small sizes; dark theme (candle) for night use.
