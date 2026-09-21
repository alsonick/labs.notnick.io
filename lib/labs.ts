import fs from "node:fs";
import path from "node:path";

export type Lab = {
  /** The course day this lab belongs to, e.g. 11. */
  day: number;
  /** Lab topic, e.g. "Configuring Static Routes". */
  title: string;
  /** File name on disk, used as the id and as the entry name inside the zip. */
  file: string;
  /** Size in bytes, so the UI can show how big a download will be. */
  bytes: number;
};

export const LABS_DIR = path.join(process.cwd(), "labs");

// "Day 11 Lab - Configuring Static Routes.pkt" -> day 11, "Configuring Static Routes"
const LAB_FILE = /^Day\s+(\d+)\s+Lab\s*-\s*(.+)\.pkt$/i;

let cached: Lab[] | null = null;

export function getLabs(): Lab[] {
  if (cached) return cached;

  const labs: Lab[] = [];
  for (const file of fs.readdirSync(LABS_DIR)) {
    const match = LAB_FILE.exec(file);
    if (!match) continue;
    labs.push({
      day: Number(match[1]),
      title: match[2].trim(),
      file,
      bytes: fs.statSync(path.join(LABS_DIR, file)).size,
    });
  }

  labs.sort((a, b) => a.day - b.day || a.title.localeCompare(b.title));
  cached = labs;
  return labs;
}

/** Every day that actually has at least one lab, ascending. */
export function getLabDays(labs: Lab[] = getLabs()): number[] {
  return [...new Set(labs.map((lab) => lab.day))].sort((a, b) => a - b);
}

/**
 * Resolves a lab file name to an absolute path inside LABS_DIR, or null if it
 * escapes the directory or is not a known lab.
 */
export function resolveLabPath(file: string): string | null {
  const lab = getLabs().find((candidate) => candidate.file === file);
  return lab ? path.join(LABS_DIR, lab.file) : null;
}
