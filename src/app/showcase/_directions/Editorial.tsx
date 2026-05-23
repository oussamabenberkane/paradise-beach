"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BEACH_EVENTS, type BeachEvent } from "./paradise-events";
import "./editorial.css";

/* ──────────────────────────────────────────────────────────
   Direction D — elrow-style maximalist editorial
   Translation: pure black canvas, jumbo uppercase, square cards
   in carousels, rotated stickers, offset-shadow CTAs, marquees,
   color-cycling animations. Terracotta as the hot-pink equivalent.
   Hard constraints: no alcohol, no bar, daytime + evening.
   Fraunces stands in for GT Alpina (paid font) at 900 UPPERCASE.
────────────────────────────────────────────────────────── */

type Filter = "all" | "music" | "yoga" | "food" | "cinema";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "music", label: "Music" },
  { key: "yoga", label: "Yoga" },
  { key: "food", label: "Food" },
  { key: "cinema", label: "Cinema" },
];

function genreToFilter(g: BeachEvent["genre"]): Exclude<Filter, "all"> {
  switch (g) {
    case "DJ Set":
    case "Live Band":
      return "music";
    case "Sunset Yoga":
      return "yoga";
    case "Food Festival":
      return "food";
    case "Beach Cinema":
      return "cinema";
  }
}

const PHOTO_BY_GENRE: Record<BeachEvent["genre"], string> = {
  "DJ Set":
    "/beach-assets/sourced/event-dj/dj-01-golden-silhouettes.jpg",
  "Live Band":
    "/beach-assets/sourced/event-band/band-01-sax-golden-hour.jpg",
  "Sunset Yoga":
    "/beach-assets/sourced/essay-palm/palm-02-sunset-silhouette.jpg",
  "Beach Cinema": "/beach-assets/night-time.webp",
  "Food Festival":
    "/beach-assets/sourced/essay-detail/detail-01-rope-wooden-post-beach.jpg",
};

const GENRE_PILL: Record<BeachEvent["genre"], { className: string; label: string }> = {
  "DJ Set":        { className: "elr-pill--terra", label: "Music" },
  "Live Band":     { className: "elr-pill--terra", label: "Music" },
  "Sunset Yoga":   { className: "elr-pill--shade", label: "Yoga" },
  "Beach Cinema":  { className: "elr-pill--sea",   label: "Cinema" },
  "Food Festival": { className: "elr-pill--dusk",  label: "Food" },
};

const EVENING_FRAMES = [
  {
    time: "Five",
    src: "/beach-assets/sourced/essay-palm/palm-01-orange-sky.jpg",
    text: "Light goes long. First arrivals walk in along the coast road.",
  },
  {
    time: "Seven",
    src: "/beach-assets/sourced/essay-water/water-02-wave-formations-coast.jpg",
    text: "Doors. The shoreline begins to fill. Sound check, distant.",
  },
  {
    time: "Eight",
    src: "/beach-assets/sourced/essay-detail/detail-01-rope-wooden-post-beach.jpg",
    text: "Sun on the horizon. Whatever happens tonight has begun.",
  },
  {
    time: "Nine",
    src: "/beach-assets/sourced/essay-palm/palm-02-sunset-silhouette.jpg",
    text: "Last light. The sky does what it does and the music takes over.",
  },
  {
    time: "Late",
    src: "/beach-assets/night-time.webp",
    text: "Quiet. People walk back along the same road, slower than they came.",
  },
];

const STATS = [
  { num: "15", label: "Evenings" },
  { num: "1", label: "Shoreline" },
  { num: "5", label: "Programs" },
  { num: "200m", label: "Of sand" },
];

/* ──────────────────────────────────────────────────────────
   Main
────────────────────────────────────────────────────────── */
export function Editorial() {
  const [filter, setFilter] = useState<Filter>("all");
  const [modalEvent, setModalEvent] = useState<BeachEvent | null>(null);

  const visible = useMemo(() => {
    if (filter === "all") return BEACH_EVENTS;
    return BEACH_EVENTS.filter((e) => genreToFilter(e.genre) === filter);
  }, [filter]);

  return (
    <div className="elr-root">
      <Header />
      <Hero />
      <Marquee
        items={[
          "The Season 2026",
          "Twelve evenings on the shore",
          "By the water from sundown",
          "Open June through October",
        ]}
      />
      <Season
        filter={filter}
        setFilter={setFilter}
        events={visible}
        onReserve={setModalEvent}
      />
      <Marquee
        variant="straw"
        items={[
          "Reserve now",
          "Few places per evening",
          "Tide schedule on arrival",
          "By the water from sundown",
        ]}
      />
      <Stats />
      <Evening />
      <Place />
      <Return />
      {modalEvent && (
        <ReserveModal ev={modalEvent} onClose={() => setModalEvent(null)} />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Header
────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header className="elr-header">
      <a href="#" className="elr-wordmark">
        paradise
      </a>
      <nav className="elr-header-nav" aria-label="Primary">
        <a href="#season">The Season</a>
        <a href="#evening">An Evening</a>
        <a href="#place">The Place</a>
        <a href="#return">Find Us</a>
      </nav>
      <button
        type="button"
        className="elr-header-cta"
        onClick={() => scrollTo("season")}
      >
        See the season
      </button>
    </header>
  );
}

function scrollTo(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ──────────────────────────────────────────────────────────
   Hero
────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="elr-hero">
      <div className="elr-hero-bg" aria-hidden="true" />
      <div className="elr-hero-inner">
        <div>
          <div className="elr-hero-eyebrow">Summer 2026 · By the water</div>
          <h1 className="elr-hero-title">
            The
            <br />
            Season.
          </h1>
          <p className="elr-hero-sub">
            Fifteen evenings on the shore. Music, yoga, cinema, food. One
            stretch of sand. From June until the season closes.
          </p>
        </div>
        <div className="elr-hero-meta">
          <div className="elr-hero-meta-line">Opening</div>
          <div className="elr-hero-meta-big">22.05</div>
          <div className="elr-hero-meta-line">Closing 18.07</div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Marquee
────────────────────────────────────────────────────────── */
function Marquee({
  items,
  variant = "terra",
}: {
  items: string[];
  variant?: "terra" | "straw" | "sea" | "shade";
}) {
  /* duplicate items for seamless loop */
  const doubled = [...items, ...items, ...items, ...items];
  const className =
    variant === "terra"
      ? "elr-marquee"
      : `elr-marquee elr-marquee--${variant}`;
  return (
    <div className={className} aria-hidden="true">
      <div className="elr-marquee-track">
        {doubled.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   The Season — event carousel
────────────────────────────────────────────────────────── */
function Season({
  filter,
  setFilter,
  events,
  onReserve,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  events: BeachEvent[];
  onReserve: (e: BeachEvent) => void;
}) {
  return (
    <section id="season" className="elr-season">
      <div className="elr-season-header">
        <h2 className="elr-jumbo elr-jumbo--terra">
          The <em>season</em>.
        </h2>
        <div className="elr-filters" role="tablist" aria-label="Filter the season">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`elr-filter ${filter === f.key ? "is-active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="elr-empty">Nothing matching that, this year.</div>
      ) : (
        <div className="elr-carousel" tabIndex={0} aria-label="Events carousel">
          {events.map((ev) => (
            <EventCard key={ev.id} ev={ev} onReserve={() => onReserve(ev)} />
          ))}
        </div>
      )}
    </section>
  );
}

function EventCard({
  ev,
  onReserve,
}: {
  ev: BeachEvent;
  onReserve: () => void;
}) {
  const { dayNum, monthAbbr, dow } = splitDate(ev.date);
  const remaining = useMemo(
    () => ev.tiers.reduce((acc, t) => acc + (t.total - t.sold), 0),
    [ev.tiers]
  );
  const total = useMemo(
    () => ev.tiers.reduce((acc, t) => acc + t.total, 0),
    [ev.tiers]
  );
  const sold = remaining <= 0;
  const filling = !sold && remaining / total < 0.2;
  const pill = GENRE_PILL[ev.genre];

  return (
    <article className="elr-card" onClick={onReserve}>
      <img
        className="elr-card-photo"
        src={PHOTO_BY_GENRE[ev.genre]}
        alt=""
        loading="lazy"
      />
      <div className="elr-card-shade" />
      {sold && <div className="elr-sticker elr-sticker--full">Full</div>}
      {filling && (
        <div className="elr-sticker elr-sticker--filling">Few left</div>
      )}
      <div className="elr-card-content">
        <div className="elr-card-top">
          <span className={`elr-pill ${pill.className}`}>{pill.label}</span>
          <div style={{ textAlign: "right" }}>
            <div className="elr-card-date-day">{dayNum}</div>
            <div className="elr-card-date-meta">
              {dow} · {monthAbbr}
            </div>
          </div>
        </div>
        <div className="elr-card-bottom">
          <h3 className="elr-card-title">{cardTitle(ev)}</h3>
          <p className="elr-card-sub">{cardSub(ev)}</p>
          {sold ? (
            <span
              className="elr-pill elr-pill--cream"
              style={{ alignSelf: "flex-start" }}
            >
              This evening is full
            </span>
          ) : (
            <div className="elr-btn-wrap">
              <button
                type="button"
                className="elr-btn elr-btn--terra"
                onClick={(e) => {
                  e.stopPropagation();
                  onReserve();
                }}
              >
                {filling ? "Hold a place" : "Reserve a place"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function cardTitle(ev: BeachEvent) {
  switch (ev.genre) {
    case "DJ Set":
      return `${ev.artist}`;
    case "Live Band":
      return `${ev.artist}`;
    case "Sunset Yoga":
      return `Practice with ${ev.artist}`;
    case "Beach Cinema":
      return `${ev.title}`;
    case "Food Festival":
      return `${ev.title}`;
  }
}

function cardSub(ev: BeachEvent) {
  const [hh, mm] = ev.time.split(":");
  const startH = parseInt(hh, 10);
  const human =
    startH === 0
      ? "midnight"
      : startH < 12
        ? `${startH}${mm !== "00" ? `:${mm}` : ""} morning`
        : startH === 12
          ? "noon"
          : `${startH - 12}${mm !== "00" ? `:${mm}` : ""} evening`;
  switch (ev.genre) {
    case "Sunset Yoga":
      return `Begins at ${human}. Mats provided.`;
    case "Beach Cinema":
      return `Screen lights at ${human}. Bring something to sit on.`;
    case "Food Festival":
      return `Open from ${human}. Bring an appetite.`;
    case "DJ Set":
      return `Doors at ${human}. Music until late.`;
    case "Live Band":
      return `Doors at ${human}. One set, into the night.`;
  }
}

function splitDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    dayNum: String(d).padStart(2, "0"),
    monthAbbr: date
      .toLocaleDateString("en-GB", { month: "short" })
      .toUpperCase(),
    dow: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
    year: y,
  };
}

/* ──────────────────────────────────────────────────────────
   Stats
────────────────────────────────────────────────────────── */
function Stats() {
  return (
    <section className="elr-stats">
      <h2 className="elr-jumbo elr-jumbo--straw">
        One season, <em>by the numbers.</em>
      </h2>
      <div className="elr-stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="elr-stat">
            <div className="elr-stat-num">{s.num}</div>
            <div className="elr-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   An Evening
────────────────────────────────────────────────────────── */
function Evening() {
  return (
    <section id="evening" className="elr-evening">
      <h2 className="elr-jumbo elr-jumbo--dusk">
        An <em>evening</em>.
      </h2>
      <div className="elr-evening-stack">
        {EVENING_FRAMES.map((f, i) => (
          <EveningFrame key={i} frame={f} />
        ))}
      </div>
    </section>
  );
}

function EveningFrame({
  frame,
}: {
  frame: { time: string; src: string; text: string };
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="elr-evening-frame">
      <div className="elr-evening-img-wrap">
        <img
          ref={ref}
          className={`elr-evening-img ${visible ? "is-visible" : ""}`}
          src={frame.src}
          alt=""
          loading="lazy"
        />
      </div>
      <div className="elr-evening-cap">
        <div className="elr-evening-time">{frame.time}</div>
        <p className="elr-evening-text">{frame.text}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   The Place
────────────────────────────────────────────────────────── */
function Place() {
  return (
    <section id="place" className="elr-place">
      <div className="elr-place-grid">
        <div>
          <h2 className="elr-jumbo elr-jumbo--straw">
            The <em>place</em>.
          </h2>
        </div>
        <div className="elr-place-body">
          <p>
            A private stretch of shore. One season a year. No resort, no
            programme of activities, no schedule we keep that the sea
            does not.
          </p>
          <p>
            We open in summer and close in autumn. The rest of the year
            the shore rests. When the season returns, so does the season.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Return / Footer
────────────────────────────────────────────────────────── */
function Return() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setSubmitted(true);
    },
    [email]
  );

  return (
    <footer id="return" className="elr-return">
      <div className="elr-return-grid">
        <div>
          <div className="elr-return-label">How to find us</div>
          <div className="elr-return-text">
            {`Along the coast road.\nWalk the last stretch.\nWe are at the end of it.`}
          </div>
        </div>
        <div>
          <div className="elr-return-label">The season</div>
          <div className="elr-return-text">
            {`Opens in June.\nCloses in October.\nQuiet in between.`}
          </div>
        </div>
        <div>
          <div className="elr-return-label">Stay close</div>
          {submitted ? (
            <div className="elr-newsletter-hint">
              Held. We&apos;ll write when the season opens.
            </div>
          ) : (
            <form className="elr-newsletter" onSubmit={submit}>
              <div className="elr-newsletter-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email"
                  aria-label="Email for season updates"
                />
                <button type="submit">Stay close</button>
              </div>
              <div className="elr-newsletter-hint">
                Hear from us when the season opens.
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="elr-return-bottom">
        <span>paradise · beach</span>
        <span>Made for the long summer.</span>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────
   Reservation Modal
────────────────────────────────────────────────────────── */
function ReserveModal({
  ev,
  onClose,
}: {
  ev: BeachEvent;
  onClose: () => void;
}) {
  const [tier, setTier] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "confirmed">("idle");
  const { dayNum, monthAbbr, dow } = splitDate(ev.date);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const confirm = () => {
    if (state !== "idle") return;
    setState("loading");
    window.setTimeout(() => setState("confirmed"), 1200);
  };

  return (
    <div
      className="elr-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="elr-modal">
        <div className="elr-modal-close">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {state === "confirmed" ? (
          <div className="elr-confirm">
            <div className="elr-confirm-eyebrow">Held</div>
            <p className="elr-confirm-line">
              We&apos;ll see you on the {dayNum}.
            </p>
            <button
              type="button"
              className="elr-modal-cta"
              onClick={onClose}
            >
              Back to the season
            </button>
          </div>
        ) : (
          <>
            <div className="elr-modal-eyebrow">
              {dow} · {monthAbbr} {dayNum} · {ev.genre.toUpperCase()}
            </div>
            <h3 className="elr-modal-title">{cardTitle(ev)}</h3>
            <p className="elr-modal-sub">{cardSub(ev)}</p>
            <div className="elr-modal-tiers">
              {ev.tiers.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  className={`elr-tier ${tier === i ? "is-selected" : ""}`}
                  onClick={() => setTier(i)}
                >
                  <div>
                    <div className="elr-tier-name">{t.name}</div>
                    <div className="elr-tier-desc">{t.description}</div>
                  </div>
                  <div className="elr-tier-price">
                    {t.price === 0 ? "free" : `€${t.price}`}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="elr-modal-cta"
              onClick={confirm}
              disabled={state === "loading"}
            >
              {state === "loading"
                ? "Holding your place…"
                : "Confirm your return"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
