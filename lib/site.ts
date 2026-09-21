// Plain (non-"use client") module: named exports here are read by the
// server-rendered layout, so they must resolve on the server.

export const SITE_URL = "https://labs.notnick.io";
export const SITE_NAME = "labs.notnick.io";

/** Who made the site. Deliberately not who made the labs. */
export const AUTHOR = {
  "@type": "Person",
  name: "notnick",
  url: "https://notnick.io",
} as const;

/** Shown in the footer and mirrored into the metadata, so it travels with
 * anything that scrapes the page. */
export const DISCLAIMER =
  "An independent, unofficial site. Not affiliated with or endorsed by Jeremy's IT Lab.";

export const COPYRIGHT = `© ${new Date().getFullYear()} | Nicholas Njoki`;

/**
 * Scoped to the code on purpose: the .pkt files in `labs/` are Jeremy's IT
 * Lab's work, not mine to license.
 */
export const LICENSE_NOTE =
  "The code for this site is open source under the MIT license.";

/** Brand green, used for the accent and for the social-embed colour. */
export const THEME_COLOR = "#30D158";

/**
 * Declared at the file's real pixel size. Scrapers lay the card out from these
 * numbers, so they have to match `public/og.png` — if that file is ever
 * replaced, update these too.
 */
export const OG_IMAGE = {
  url: "/og.png",
  width: 5632,
  height: 3232,
  alt: "labs.notnick.io — pick the day you're on and get a random Packet Tracer lab",
} as const;
