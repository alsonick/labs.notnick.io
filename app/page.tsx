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
    <main className="mx-auto w-full max-w-[44rem] px-4 pb-32 pt-8 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center justify-between gap-4 border-b border-ink pb-2.5">
        <p className="label text-ink">Packet Tracer Labs</p>
        <div className="flex items-center gap-3">
          <p className="label">
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

      <footer className="mt-16 border-t border-rule pt-4">
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
      </footer>
    </main>
  );
}
