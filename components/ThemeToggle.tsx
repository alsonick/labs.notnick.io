"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";

function Sun({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <circle cx="7" cy="7" r="2.6" />
      <path d="M7 .9v1.5M7 11.6v1.5M.9 7h1.5M11.6 7h1.5M2.7 2.7l1.1 1.1M10.2 10.2l1.1 1.1M11.3 2.7l-1.1 1.1M3.8 10.2l-1.1 1.1" />
    </svg>
  );
}

function Moon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12.1 8.7A5.5 5.5 0 0 1 5.3 1.9a5.5 5.5 0 1 0 6.8 6.8Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  // Starts light to match the server render; the effect below syncs it to what
  // the pre-paint script in the layout already applied.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Blocked storage: the choice just won't survive a reload.
    }
  }

  const goingDark = theme === "light";
  const iconClass =
    "size-3.5 transition-transform group-hover:scale-125 group-focus-visible:scale-125";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${goingDark ? "dark" : "light"} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${goingDark ? "dark" : "light"} theme`}
      className="group grid size-7 shrink-0 place-items-center border border-rule text-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {goingDark ? (
        <Moon className={iconClass} />
      ) : (
        <Sun className={iconClass} />
      )}
    </button>
  );
}
