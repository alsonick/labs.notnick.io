# labs.notnick.io

A single page for Jeremy's IT Lab Packet Tracer labs. Set the day you're on
and it picks one random lab from everything up to that day — so the early
topics stay in rotation instead of getting left behind. Download that one, or
hit "different one" until you get a lab you feel like redoing.

## Running it

```bash
npm install
npm run dev
```

Don't run `next build` while `next dev` is up: they share `.next` and the build
will clobber the dev server's artifacts. Use `npx tsc --noEmit` to typecheck
while developing.

## How it works

- `labs/` holds the `.pkt` files. File names are the source of truth and are
  parsed as `Day <nn> Lab - <title>.pkt`, so **adding a lab is just dropping a
  correctly named file into `labs/`** — no code or config to touch. A day can
  have more than one lab (day 11 does).
- [`lib/labs.ts`](lib/labs.ts) reads that directory once and caches the
  manifest (day, title, file name, byte size).
- [`app/api/download/route.ts`](app/api/download/route.ts) serves two things:
  - `?file=<name>` — a single `.pkt`. This is what the download button sends, and what
    the per-row arrows in the index use.
  - `?day=24` — a zip of every lab up to day 24, behind the secondary "take all
    as a zip" link.
- [`components/LabPicker.tsx`](components/LabPicker.tsx) holds the ruler, the
  pick, and the index. Changing the day re-picks immediately; "different one"
  re-picks on demand; the dropdown beside them jumps to one specific lab and is
  scoped to the labs in range, so it rebuilds whenever the day moves. It's a
  native `<select>` (styled with `appearance-none` plus our own chevron) so the
  option list stays keyboard- and touch-native. Its value is bound to the
  current pick, which keeps it in sync when the shuffle or the day changes it.
  Days with two labs list both, since picking "day 11" alone is ambiguous. Both go through the same `choose()`, which never returns
  the lab that's already showing as long as there's more than one in range.
  Picking happens on the client (it already has the full manifest) and on mount
  rather than during render, since a random server pick would fail hydration.
  The selected day is kept in `localStorage`.

## Design notes

Warm paper and near-black ink, hairline rules instead of cards, and one
accent — the brand green `#30D158` — used as a highlighter: it flags which labs
are in range and marks the one currently picked. Dark text on the green clears
9:1 in both themes. The ruler's tall ticks are days that actually have a lab,
so it doubles as a map of where the labs sit.

Light is the default and dark is opt-in through the header toggle — system
`prefers-color-scheme` is deliberately not followed. The choice lives in
`localStorage` under the key in [`lib/theme.ts`](lib/theme.ts) and is re-applied
by a small inline script in [`app/layout.tsx`](app/layout.tsx) that runs before
paint, so a saved dark choice doesn't flash light first. That key has to live in
its own non-client module: named exports of a `"use client"` module resolve to
`undefined` when a Server Component imports them, which silently ships a script
reading `localStorage.getItem(undefined)`.

Dark isn't a straight inversion. `--highlight` (the marker pen behind text) goes
translucent so ink-coloured text stays readable through it, while `--marker`
(the solid day chips) stays opaque with its own dark `--marker-text`.

## SEO and social

[`lib/site.ts`](lib/site.ts) is the single source for the domain, the theme
colour and the OG image; [`app/layout.tsx`](app/layout.tsx) builds the metadata
from it, counting the labs at build time so the description can't go stale.
`metadataBase` is what makes the relative image paths come out absolute, which
every scraper requires. There's also JSON-LD (`WebApplication`) on the page, a
generated [`robots.txt`](app/robots.ts) that keeps crawlers out of `/api/`, and
a [`sitemap.xml`](app/sitemap.ts).

`public/og.png` is served at its native **5632 x 3232**, and `og:image:width` /
`og:image:height` declare exactly that — scrapers lay the card out from those
numbers, so they must match the file. Worth knowing:

- **X/Twitter caps card images at 4096 x 4096.** At 5632 wide this one is over
  that limit, so the `summary_large_image` card may render without an image.
  A 2400 x 1378 copy (same 1.74:1 crop, well inside every limit) would fix it.
- The aspect ratio is 1.74:1 rather than the 1.91:1 that Facebook and LinkedIn
  prefer, so expect a little letterboxing there.

The icon ships twice, on purpose:

- [`app/favicon.ico`](app/favicon.ico) — 16/32/48 px, served at `/favicon.ico`
  for anything that requests that path by convention. It lives in `app/` rather
  than `public/` because the two would collide on the same route.
- [`app/icon.png`](app/icon.png) — 48 px, generated from the .ico's largest
  frame. **This is the one that matters in practice.** Next content-hashes it
  (`/icon.png?e265e1ba…`) while `favicon.ico` is served at a bare path, and
  browsers cache favicons hard, in a store separate from normal page caching.
  The hashed URL is what actually gets a changed icon in front of people.

If you replace the icon, regenerate both so they don't drift. A browser still
showing the old one (or the generic globe, which it will latch onto if the site
ever 500s) can be forced by loading `/icon.png` directly, or by hard-refreshing;
the tab icon often only updates on the next fresh navigation.

## Deploying

The `.pkt` files live outside `public/` and are read at request time, so
`next.config.ts` traces `labs/**` into the `/api/download` function bundle.
That's needed for Vercel-style deployments; keep it if you move the files.

One thing to watch: on Vercel, a serverless function response is capped at
4.5 MB. The full day 1–58 zip is currently ~3.0 MB, so there's headroom for
roughly another 20 labs. Single-lab downloads (the common path now) are ~50 KB
and nowhere near the limit.

## License

The source code is [MIT licensed](LICENSE).

**That does not extend to `labs/`.** The `.pkt` files there are Jeremy's IT
Lab's work, redistributed under their own terms — they aren't mine to license,
so the MIT grant covers the code in this repository only. If you fork this,
that distinction comes with you.
