import LabPicker from "@/components/LabPicker";
import ThemeToggle from "@/components/ThemeToggle";
import { getLabs } from "@/lib/labs";
import {
  AUTHOR,
  COPYRIGHT,
  DISCLAIMER,
  LICENSE_NOTE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/** Mirror of the download arrow in LabPicker, pointing the other way. */
function ArrowUp({ className }: { className?: string }) {
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
      <path d="M7 12V3.5m0 0 3.2 3.2M7 3.5 3.8 6.7" />
    </svg>
  );
}

export default function Home() {
  const labs = getLabs();
  const maxDay = labs.length > 0 ? labs[labs.length - 1].day : 1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: `A random Packet Tracer lab picker for Jeremy's IT Lab's CCNA course: choose the day you're on and download one of the ${labs.length} labs from days 1 to ${maxDay}.`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    disambiguatingDescription: DISCLAIMER,
    author: AUTHOR,
    publisher: AUTHOR,
    about: {
      "@type": "Course",
      name: "Jeremy's IT Lab — Free CCNA Course",
      url: "https://www.jeremysitlab.com",
      provider: {
        "@type": "Organization",
        name: "Jeremy's IT Lab",
        url: "https://www.jeremysitlab.com",
      },
    },
  };

  return (
    <main id="top" className="mx-auto w-full max-w-[44rem] px-4 pb-32 pt-8 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center justify-between gap-4 border-b border-ink pb-2.5">
        <p className="label text-ink">Packet Tracer Labs</p>
        <div className="flex items-center gap-3">
          {/* Dropped on narrow screens: the header only has room for the
              site name and the toggle there. */}
          <p className="label hidden sm:block">
            Jeremy&rsquo;s IT Lab &middot; {labs.length} labs
          </p>
          <ThemeToggle />
        </div>
      </div>

      <h1 className="ink-fade mt-10 w-fit text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-[3.5rem]">
        Go back and
        <br />
        redo an old one.
      </h1>
      <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed text-soft">
        The CCNA course from Jeremy&rsquo;s IT Lab covers a lot of ground, and
        as you work through it, it&rsquo;s easy to forget the early labs. Set
        the day you&rsquo;re on and get a random one from anything you&rsquo;ve
        already covered, so you can go back and practice it. REPETITION IS KEY.
      </p>

      <LabPicker labs={labs} maxDay={maxDay} />

      <footer className="mt-16 flex items-start justify-between gap-6 border-t border-rule pt-4">
        <div className="min-w-0">
          <p className="text-xs leading-relaxed text-soft">
            Labs are by{" "}
            <a
              className="marked text-ink"
              href="https://www.jeremysitlab.com"
              target="_blank"
              rel="noreferrer"
            >
              Jeremy&rsquo;s IT Lab
            </a>
            . Open the .pkt files with Cisco Packet Tracer.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-soft">{DISCLAIMER}</p>
          <p className="mt-2 text-xs leading-relaxed text-soft">{LICENSE_NOTE}</p>
          <p className="mt-2 text-xs leading-relaxed text-soft">{COPYRIGHT}</p>
        </div>

        {/* A plain anchor, so it works without JS and the smooth scroll is the
            browser's own (and drops to a jump under reduced motion). */}
        <a
          href="#top"
          className="label to-top group flex shrink-0 items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ArrowUp className="size-3 transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5" />
          Top
        </a>
      </footer>
    </main>
  );
}
