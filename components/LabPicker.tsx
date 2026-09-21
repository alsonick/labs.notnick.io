"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lab } from "@/lib/labs";

const STORAGE_KEY = "labs.notnick.io:day";

function pad(day: number): string {
  return String(day).padStart(2, "0");
}

function formatBytes(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function labHref(lab: Lab): string {
  return `/api/download?file=${encodeURIComponent(lab.file)}`;
}

function clickDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  clickDownload(url, filename);
  // Firefox and Safari can cancel the transfer if the URL is revoked in the
  // same tick as the click.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M7 2v8.5m0 0 3.2-3.2M7 10.5 3.8 7.3" />
    </svg>
  );
}

function Shuffle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M1.5 4h2.3c.9 0 1.7.5 2.1 1.3l2.2 3.4c.4.8 1.2 1.3 2.1 1.3h2.3" />
      <path d="M1.5 10h2.3c.9 0 1.7-.5 2.1-1.3l2.2-3.4c.4-.8 1.2-1.3 2.1-1.3h2.3" />
      <path d="m10.8 2.3 1.7 1.7-1.7 1.7" />
      <path d="m10.8 8.3 1.7 1.7-1.7 1.7" />
    </svg>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m3.5 5.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

export default function LabPicker({
  labs,
  maxDay,
}: {
  labs: Lab[];
  maxDay: number;
}) {
  const [day, setDay] = useState(maxDay);
  const [picked, setPicked] = useState<Lab | null>(null);
  const [zipping, setZipping] = useState(false);
  const [failed, setFailed] = useState(false);

  // Pick up where someone left off. Read after mount so the server render and
  // the first client render agree.
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isInteger(saved) && saved >= 1 && saved <= maxDay) {
        setDay(saved);
      }
    } catch {
      // Blocked storage: the default day is fine.
    }
  }, [maxDay]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(day));
    } catch {
      // Persistence is a convenience, not a requirement.
    }
  }, [day]);

  const labDays = useMemo(() => new Set(labs.map((lab) => lab.day)), [labs]);
  const included = useMemo(
    () => labs.filter((lab) => lab.day <= day),
    [labs, day],
  );
  const bytes = useMemo(
    () => included.reduce((total, lab) => total + lab.bytes, 0),
    [included],
  );

  // Held in a ref as well as state so choosing can skip the current lab without
  // making itself depend on it (which would re-fire the effect below forever).
  const pickedRef = useRef<Lab | null>(null);

  const choose = useCallback((pool: Lab[]) => {
    const current = pickedRef.current;
    // Always hand back something different, as long as there's a choice.
    const candidates =
      current && pool.length > 1
        ? pool.filter((lab) => lab.file !== current.file)
        : pool;
    const next =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : null;
    pickedRef.current = next;
    setPicked(next);
  }, []);

  /** Jump straight to one lab instead of taking whatever the shuffle gives. */
  function selectLab(file: string) {
    const lab = included.find((candidate) => candidate.file === file);
    if (!lab) return;
    pickedRef.current = lab;
    setPicked(lab);
  }

  // Choosing a day picks a lab straight away. Runs on mount too, which is also
  // why the first pick happens on the client: the server has no random pick to
  // render and hydration would mismatch.
  useEffect(() => {
    choose(included);
  }, [included, choose]);

  function downloadPicked() {
    if (!picked) return;
    setFailed(false);
    clickDownload(labHref(picked), picked.file);
  }

  async function downloadAll() {
    if (included.length === 0) return;
    setZipping(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/download?day=${day}`);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      downloadBlob(await response.blob(), `jitl-labs-day-01-to-${pad(day)}.zip`);
    } catch {
      setFailed(true);
    } finally {
      setZipping(false);
    }
  }

  const cursor = maxDay > 1 ? ((day - 1) / (maxDay - 1)) * 100 : 100;
  const tickLabels = [
    ...new Set([1, ...[10, 20, 30, 40, 50].filter((n) => n < maxDay), maxDay]),
  ];

  return (
    <>
      <section className="mt-12 border-t border-ink pt-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
          <div className="shrink-0">
            <p className="label">Current day</p>
            <p className="mt-1 text-[4rem] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">
              {pad(day)}
            </p>
          </div>

          <div className="ruler relative min-w-0 flex-1 pb-6">
            <div className="relative h-14">
              {/* Baseline, with the chosen range inked over it. */}
              <span className="absolute bottom-0 left-0 right-0 h-px bg-rule" />
              <span
                className="absolute bottom-0 left-0 h-[3px] bg-ink"
                style={{ width: `${cursor}%` }}
              />

              {/* One tick per day. Tall ticks are days that actually have a lab,
                  so the ruler doubles as a map of where the labs sit. */}
              {Array.from({ length: maxDay }, (_, index) => index + 1).map(
                (tickDay) => {
                  const hasLab = labDays.has(tickDay);
                  const inRange = tickDay <= day;
                  return (
                    <span
                      key={tickDay}
                      aria-hidden
                      className={`absolute bottom-0 w-px -translate-x-1/2 ${
                        !hasLab
                          ? "bg-rule"
                          : inRange
                            ? "bg-ink"
                            : "bg-soft opacity-40"
                      }`}
                      style={{
                        left: `${maxDay > 1 ? ((tickDay - 1) / (maxDay - 1)) * 100 : 0}%`,
                        height: hasLab ? 26 : 9,
                      }}
                    />
                  );
                },
              )}

              {/* Where you are. */}
              <span
                aria-hidden
                className="absolute bottom-0 top-1.5 w-[2px] -translate-x-1/2 bg-ink"
                style={{ left: `${cursor}%` }}
              />
              <span
                aria-hidden
                className="absolute top-0 size-2.5 -translate-x-1/2 rotate-45 bg-ink"
                style={{ left: `${cursor}%` }}
              />

              <input
                type="range"
                min={1}
                max={maxDay}
                step={1}
                value={day}
                onChange={(event) => setDay(Number(event.target.value))}
                className="ruler-input"
                aria-label="Current day"
                aria-valuetext={`Day ${day}, ${included.length} labs in range`}
              />
            </div>

            <div className="relative mt-2 h-3">
              {tickLabels.map((tickDay) => {
                const left = maxDay > 1 ? ((tickDay - 1) / (maxDay - 1)) * 100 : 0;
                const isFirst = tickDay === 1;
                const isLast = tickDay === maxDay;
                return (
                  <span
                    key={tickDay}
                    aria-hidden
                    className="label absolute top-0 tabular-nums"
                    style={{
                      left: isLast ? undefined : `${left}%`,
                      right: isLast ? 0 : undefined,
                      transform: isFirst || isLast ? undefined : "translateX(-50%)",
                    }}
                  >
                    {pad(tickDay)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-rule pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="label text-ink">Your lab</h2>
            <p className="label tabular-nums">
              {picked ? formatBytes(picked.bytes) : null}
            </p>
          </div>

          <p
            aria-live="polite"
            className="mt-2 min-h-8 text-2xl font-semibold leading-tight tracking-[-0.02em]"
          >
            {picked ? (
              <>
                <span className="tabular-nums text-soft">
                  Day {pad(picked.day)}
                </span>{" "}
                <span className="marked">{picked.title}</span>
              </>
            ) : (
              <span className="text-soft">Picking one&hellip;</span>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadPicked}
              disabled={!picked}
              className="flex items-center gap-2 bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-marker hover:text-[var(--marker-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
            >
              <Arrow className="size-4" />
              Download it
            </button>

            <button
              type="button"
              onClick={() => choose(included)}
              disabled={included.length < 2}
              title={
                included.length < 2
                  ? "Only one lab in range"
                  : "Pick a different lab"
              }
              className="flex items-center gap-2 border border-ink px-5 py-3 text-[15px] font-semibold transition-colors hover:bg-marker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
            >
              <Shuffle className="size-4" />
              Different one
            </button>

            <div className="relative w-full sm:w-[20.5rem]">
              <select
                value={picked?.file ?? ""}
                onChange={(event) => selectLab(event.target.value)}
                aria-label="Choose a specific day in range"
                className="w-full appearance-none border border-rule bg-paper py-3 pl-4 pr-9 text-[15px] text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {!picked && (
                  <option value="" disabled>
                    Pick a day&hellip;
                  </option>
                )}
                {included.map((lab) => (
                  <option key={lab.file} value={lab.file}>
                    Day {pad(lab.day)} &middot; {lab.title}
                  </option>
                ))}
              </select>
              <Chevron className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-soft" />
            </div>
          </div>

          <p className="mt-3.5 text-sm tabular-nums text-soft">
            {failed ? (
              <span>That download didn&rsquo;t go through. Try it again.</span>
            ) : (
              <>
                {included.length} labs in range &middot;{" "}
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={zipping}
                  className="underline decoration-rule underline-offset-[3px] transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
                >
                  {zipping ? "zipping…" : `take all ${formatBytes(bytes)} as a zip`}
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between border-b border-ink pb-2.5">
          <h2 className="label text-ink">Every lab</h2>
          <p className="label">Tap a row to set your day</p>
        </div>

        <ol>
          {labs.map((lab) => {
            const inRange = lab.day <= day;
            const isPicked = picked?.file === lab.file;
            return (
              <li
                key={lab.file}
                className="group relative flex items-center gap-3 border-b border-rule sm:gap-4"
              >
                <button
                  type="button"
                  onClick={() => setDay(lab.day)}
                  aria-label={`Set current day to day ${lab.day}`}
                  className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
                />
                <span
                  className={`pointer-events-none relative w-8 shrink-0 py-2.5 text-center text-xs font-semibold tabular-nums transition-colors ${
                    inRange
                      ? "bg-marker text-[var(--marker-text)]"
                      : "text-soft opacity-50"
                  }`}
                >
                  {pad(lab.day)}
                </span>
                <span
                  className={`pointer-events-none relative min-w-0 flex-1 truncate py-2.5 text-[15px] transition-opacity ${
                    inRange ? "" : "opacity-45"
                  } ${isPicked ? "font-semibold" : ""}`}
                >
                  {lab.title}
                </span>
                <span
                  className={`pointer-events-none relative hidden shrink-0 text-xs tabular-nums text-soft sm:block ${
                    inRange ? "" : "opacity-45"
                  }`}
                >
                  {formatBytes(lab.bytes)}
                </span>
                <a
                  href={labHref(lab)}
                  download={lab.file}
                  title={`Download ${lab.title}`}
                  aria-label={`Download ${lab.title}`}
                  className="relative -mr-1 grid size-8 shrink-0 place-items-center text-soft opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink group-hover:opacity-100 max-sm:opacity-100"
                >
                  <Arrow className="size-3.5" />
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper">
        <div className="mx-auto flex max-w-[44rem] items-center gap-3 px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-sm tabular-nums">
            {picked ? (
              <>
                <span className="text-soft">Day {pad(picked.day)}</span>{" "}
                <span className="font-semibold">{picked.title}</span>
              </>
            ) : (
              <span className="text-soft">Picking one&hellip;</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => choose(included)}
            disabled={included.length < 2}
            aria-label="Pick a different lab"
            title="Pick a different lab"
            className="grid size-10 shrink-0 place-items-center border border-ink transition-colors hover:bg-marker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            <Shuffle className="size-4" />
          </button>
          <button
            type="button"
            onClick={downloadPicked}
            disabled={!picked}
            className="flex shrink-0 items-center gap-2 bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-marker hover:text-[var(--marker-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            <Arrow className="size-3.5" />
            Download
          </button>
        </div>
      </div>
    </>
  );
}
