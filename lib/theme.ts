// Shared by the server-rendered layout and the client toggle, so it must NOT
// live in a "use client" module: named exports of client modules resolve to
// undefined when a Server Component imports them.
export const THEME_KEY = "labs.notnick.io:theme";

export type Theme = "light" | "dark";
