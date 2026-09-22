# labs.notnick.io

A single page for Jeremy's IT Lab Packet Tracer labs. Set the day you're on and
it picks a random lab from everything up to that day, so the early topics stay
in rotation instead of getting left behind.

## Running it

```bash
npm install
npm run dev
```

Don't run `next build` while `next dev` is up — they share `.next` and the
build clobbers the dev server. Typecheck with `npx tsc --noEmit` instead.

## Adding a lab

Drop a file into `labs/` named `Day <nn> Lab - <title>.pkt`. File names are the
source of truth, so there's no code or config to touch. A day can hold more
than one lab (day 11 does).

## Where things are

| Path | What it does |
| --- | --- |
| [`lib/labs.ts`](lib/labs.ts) | Parses `labs/` into a cached manifest |
| [`components/LabPicker.tsx`](components/LabPicker.tsx) | Ruler, picker, and lab index — all client-side |
| [`app/api/download/route.ts`](app/api/download/route.ts) | `?file=<name>` for one lab, `?day=<n>` for a zip of everything up to that day |
| [`lib/site.ts`](lib/site.ts) | Domain, theme colour, OG image — the single source for all metadata |
| [`lib/theme.ts`](lib/theme.ts) | The `localStorage` key for the dark-mode toggle |

## Gotchas

- **Picking runs on the client, on mount.** A random pick during render would
  fail hydration.
- **`lib/theme.ts` has to stay a non-client module.** Named exports of a
  `"use client"` module resolve to `undefined` when a Server Component imports
  them, which would silently ship a script reading `localStorage.getItem(undefined)`.
- **Vercel caps a function response at 4.5 MB.** The full zip is ~3.0 MB today,
  leaving room for roughly 20 more labs. Single downloads are ~50 KB.
- **`next.config.ts` traces `labs/**` into the download bundle.** The `.pkt`
  files sit outside `public/` and are read at request time; keep the trace if
  you move them.
- **`public/og.png` is 5632 x 3232, over X/Twitter's 4096 limit,** so that card
  may render without an image. A 2400 x 1378 copy would fix it. The dimensions
  in `lib/site.ts` must always match the real file.
- **Replacing the icon means regenerating both copies** —
  [`app/favicon.ico`](app/favicon.ico) and [`app/icon.png`](app/icon.png).
  Only the hashed `icon.png` reliably beats the browser's favicon cache.

## License

The code is MIT licensed.

**That does not extend to `labs/`.** Those `.pkt` files are Jeremy's IT Lab's
work, redistributed under their own terms — they aren't mine to license. If you
fork this, that distinction comes with you.
