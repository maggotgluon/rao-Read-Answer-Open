---
version: 1
slug: 'resources-js-pages-spaces-daily-tsx'
primary_target: 'resources/js/pages/spaces/daily.tsx'
related_targets:
    [
        'resources/js/pages/spaces/show.tsx',
        'resources/js/pages/spaces/moments.tsx',
        'resources/js/components/space/space-shell.tsx',
    ]
---

# Surface brief: Rao app shell + space tabs (Daily leads)

Scope: every signed-in screen (space Overview / Daily / Moments, spaces list, invites, settings, admin) plus auth and welcome. Mode: Operate. Phone-first PWA (iOS Safari standalone + Android Chrome), Thai first.

## Direction contract

THESIS: Every day is a letter between two people. You write and seal yours; only then does your partner's letter open. Refuses the SaaS card-kit (identical bordered cards, stat triads, sidebar chrome) and the chat-app look.

OWN-WORLD: Thai mail and love-letter stationery. Rose letter paper (dusk), white airmail paper with red/blue airmail stripes (daytime), ink-blue desk at night. Roles: wax/stamp red = you and "your move"; airmail blue = your partner; blue-black ink = text; postmark grey-violet = past/quiet. Perforated postage-stamp edges, postmarks, wax seals, postcards. Faces: Itim (handwritten: questions, answers, logo, headings) + Anuphan (UI, labels, body).

STORY: Open the app, see today's letter waiting. Write, press the wax seal, watch your partner's envelope open (or see it still on its way). Look back: the calendar is a sheet of stamps, cancelled with a postmark on days you both wrote. Moments are postcards.

FIRST VIEWPORT (Daily, 390 px): top bar with stamp logo + space switcher + distance postmark chip; streak as a stamp count; today's envelope owns the screen: question in handwriting, answer paper, wax-seal button bottom right; bottom tabs (envelope / stamp sheet / postcard).

FORM: sealed letters (pick card; assigned was string lights, position 5). seed:320157a2ae296967

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
