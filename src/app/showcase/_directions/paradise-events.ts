export type EventGenre =
  | "Live Band"
  | "DJ Set"
  | "Sunset Yoga"
  | "Beach Cinema"
  | "Food Festival";

export const GENRE_COLORS: Record<EventGenre, string> = {
  "Live Band":     "#C66B3D",
  "DJ Set":        "#2C5F5D",
  "Sunset Yoga":   "#E8A93C",
  "Beach Cinema":  "#6B4F3E",
  "Food Festival": "#E89B7C",
};

export interface EventTier {
  name: string;
  price: number;
  description: string;
  total: number;
  sold: number;
}

export interface BeachEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  genre: EventGenre;
  description: string;
  image: string;
  tiers: EventTier[];
}

export const BEACH_EVENTS: BeachEvent[] = [
  {
    id: "ev-01",
    title: "Night Markets at the Shore",
    artist: "Mariana Sol",
    date: "2026-05-22",
    time: "22:00",
    genre: "DJ Set",
    description: "Miami-born Mariana Sol brings her signature blend of Afro-house and balearic deep beats to the shoreline. Expect a journey from golden hour grooves to after-midnight swells, with sound washing out past the waves.",
    image: "/showcase/events/stage-lights.webp",
    tiers: [
      { name: "General Admission", price: 15,  description: "Full beach access, standing",          total: 300,  sold: 214 },
      { name: "Beach Lounge",      price: 35,  description: "Reserved deck chair, 1 welcome drink", total: 80,   sold: 72  },
      { name: "VIP Cabana",        price: 90,  description: "Private cabana for 4, bottle service", total: 12,   sold: 8   },
    ],
  },
  {
    id: "ev-02",
    title: "Sunset Sessions",
    artist: "The Saltines",
    date: "2026-05-23",
    time: "18:30",
    genre: "Live Band",
    description: "The Saltines play their dreamy brand of surf-pop with a hint of reggae, perfectly timed to the hour the sky goes orange. Their second Paradise residency — they sold out the first in 48 hours.",
    image: "/showcase/events/sunset-crowd.webp",
    tiers: [
      { name: "General Admission", price: 20,  description: "Full beach access, standing",          total: 250, sold: 189 },
      { name: "Beach Lounge",      price: 45,  description: "Reserved table, sea-facing row",       total: 60,  sold: 44  },
      { name: "VIP Cabana",        price: 110, description: "Private cabana, 2-bottle package",     total: 10,  sold: 6   },
    ],
  },
  {
    id: "ev-03",
    title: "Morning Tide Practice",
    artist: "Rosa Fontaine",
    date: "2026-05-24",
    time: "07:30",
    genre: "Sunset Yoga",
    description: "Certified vinyasa instructor Rosa Fontaine leads an hour of slow-flow practice on the sand, feet near the surf, eyes on the horizon. Mats provided. All levels welcome.",
    image: "/beach-assets/day-time.webp",
    tiers: [
      { name: "General Admission", price: 12, description: "Mat included, beachside class", total: 40, sold: 28 },
    ],
  },
  {
    id: "ev-04",
    title: "Late Night Sands",
    artist: "Daka & Friends",
    date: "2026-05-29",
    time: "22:00",
    genre: "DJ Set",
    description: "Daka heads a revolving cast of West African-influenced electronic artists, each playing 30-minute b2b sets until the small hours. Genre-agnostic — amapiano to Afro-tech, no set lists.",
    image: "/showcase/events/stage-lights.webp",
    tiers: [
      { name: "General Admission", price: 18,  description: "Beach access, standing",           total: 350, sold: 201 },
      { name: "Beach Lounge",      price: 40,  description: "Reserved seating + drinks rail",   total: 70,  sold: 38  },
      { name: "VIP Cabana",        price: 100, description: "Private cabana, host service",     total: 15,  sold: 11  },
    ],
  },
  {
    id: "ev-05",
    title: "Film Under the Stars",
    artist: "Outdoor Cinema Night",
    date: "2026-05-30",
    time: "20:30",
    genre: "Beach Cinema",
    description: "A 30-foot inflatable screen and a restored print of Blue Crush (2002). Sound via personal FM receiver — tune your phone to 88.7 and bury your feet in the sand.",
    image: "/beach-assets/night-time.webp",
    tiers: [
      { name: "General Admission", price: 14, description: "Picnic blanket area",              total: 200, sold: 155 },
      { name: "Beach Lounge",      price: 32, description: "Deckchair + popcorn + drink",      total: 60,  sold: 48  },
      { name: "VIP Cabana",        price: 80, description: "Private cabana, 2 drinks included", total: 8,   sold: 5   },
    ],
  },
  {
    id: "ev-06",
    title: "Paradise Food Market",
    artist: "16 Vendors",
    date: "2026-05-31",
    time: "12:00",
    genre: "Food Festival",
    description: "Sixteen local vendors across the beachfront: ceviche stations, fresh-grilled fish tacos, handmade aguas frescas, and two craft cocktail bars. Entry is free — eat your way along the shore.",
    image: "/showcase/events/golden-watchers.webp",
    tiers: [
      { name: "Free Entry",        price: 0,  description: "Open beach, pay per dish",         total: 1000, sold: 0  },
      { name: "Tasting Wristband", price: 25, description: "6-dish credits + 1 cocktail",      total: 150,  sold: 97 },
    ],
  },
  {
    id: "ev-07",
    title: "Sunset on the Deck",
    artist: "Coral Drive",
    date: "2026-06-06",
    time: "18:00",
    genre: "Live Band",
    description: "Three-piece Coral Drive play original bossa-influenced coastal folk from their debut album Tideline. Intimate PA setup, acoustic bass, and two sets of originals with a few well-chosen covers.",
    image: "/showcase/events/sunset-crowd.webp",
    tiers: [
      { name: "General Admission", price: 22,  description: "Standing area, beach access",      total: 200, sold: 134 },
      { name: "Beach Lounge",      price: 50,  description: "Reserved table, sea view",         total: 50,  sold: 29  },
      { name: "VIP Cabana",        price: 120, description: "Private cabana + meet & greet",    total: 8,   sold: 3   },
    ],
  },
  {
    id: "ev-08",
    title: "Electric Shore",
    artist: "Luna Vega",
    date: "2026-06-12",
    time: "22:00",
    genre: "DJ Set",
    description: "Luna Vega's four-hour marathon sets have become legend on the Ibiza circuit. She arrives at Paradise with an extended late-night residency slot — no opener, no support, just four hours of peak-time house.",
    image: "/showcase/events/stage-lights.webp",
    tiers: [
      { name: "General Admission", price: 25,  description: "Beach access, standing",                   total: 400, sold: 352 },
      { name: "Beach Lounge",      price: 55,  description: "Reserved seating + drinks tab credit",      total: 60,  sold: 58  },
      { name: "VIP Cabana",        price: 150, description: "Private cabana, premium bottle service",    total: 12,  sold: 10  },
    ],
  },
  {
    id: "ev-09",
    title: "Afternoon Sessions",
    artist: "The Beachcombers",
    date: "2026-06-13",
    time: "15:00",
    genre: "Live Band",
    description: "A loose collective of seven musicians playing blues-tinged soul, built for long sunny afternoons. Brass section, two vocalists, and a drummer who finishes every set with sand in his snare.",
    image: "/showcase/events/golden-watchers.webp",
    tiers: [
      { name: "General Admission", price: 18, description: "Beach access, open standing",   total: 250, sold: 98 },
      { name: "Beach Lounge",      price: 42, description: "Reserved deckchair row",        total: 50,  sold: 21 },
    ],
  },
  {
    id: "ev-10",
    title: "Solstice Sound Bath",
    artist: "Ama & the Ocean Choir",
    date: "2026-06-21",
    time: "18:30",
    genre: "Sunset Yoga",
    description: "Midsummer on the beach — an immersive ceremony using Himalayan bowls, frame drums, and voice, timed to the exact sunset. Part concert, part meditation, entirely sea air.",
    image: "/beach-assets/day-time.webp",
    tiers: [
      { name: "General Admission", price: 20, description: "Mat included, beach ceremony",           total: 60, sold: 41 },
      { name: "Premium Spot",      price: 38, description: "Front-row mat, herbal tea ceremony",     total: 20, sold: 14 },
    ],
  },
  {
    id: "ev-11",
    title: "Outdoor Cinema: Point Break",
    artist: "Cinema Night",
    date: "2026-06-27",
    time: "20:00",
    genre: "Beach Cinema",
    description: "The 1991 classic projected onto the 30-foot screen with surround-sound via personal FM. Pre-show DJ from 19:00, film begins at sunset. Fancy dress strongly encouraged.",
    image: "/beach-assets/night-time.webp",
    tiers: [
      { name: "General Admission", price: 14, description: "Blanket area, bring your own cushion", total: 200, sold: 88 },
      { name: "Beach Lounge",      price: 30, description: "Deckchair + nachos + drink",           total: 60,  sold: 27 },
      { name: "VIP Cabana",        price: 80, description: "Cabana for 4, drinks package",         total: 8,   sold: 2  },
    ],
  },
  {
    id: "ev-12",
    title: "Midsummer Beach Party",
    artist: "Palms & Sons",
    date: "2026-07-04",
    time: "18:00",
    genre: "Live Band",
    description: "Five-piece Palms & Sons blur the line between afrobeat and disco with an explosive live show that's half-concert, half-party. Two lead singers, a four-piece brass, and a rhythm section built for open-air volumes.",
    image: "/showcase/events/sunset-crowd.webp",
    tiers: [
      { name: "General Admission", price: 24,  description: "Full beach access, standing",      total: 300, sold: 187 },
      { name: "Beach Lounge",      price: 55,  description: "Reserved table, welcome drink",    total: 70,  sold: 43  },
      { name: "VIP Cabana",        price: 140, description: "Private cabana, bottle of champagne", total: 10, sold: 6  },
    ],
  },
  {
    id: "ev-13",
    title: "Tropical Friday",
    artist: "Tropicalia",
    date: "2026-07-10",
    time: "22:00",
    genre: "DJ Set",
    description: "Tropicalia's sound is deceptively simple: Brazilian rhythms at 128bpm, mixed with precision and played until dawn. Their Paradise debut last summer is still talked about at the beach bars.",
    image: "/showcase/events/stage-lights.webp",
    tiers: [
      { name: "General Admission", price: 20,  description: "Beach access, standing",           total: 350, sold: 162 },
      { name: "Beach Lounge",      price: 45,  description: "Reserved seating + drink credit",  total: 70,  sold: 34  },
      { name: "VIP Cabana",        price: 110, description: "Private cabana, bottle service",   total: 12,  sold: 7   },
    ],
  },
  {
    id: "ev-14",
    title: "Seafood & Sangria Market",
    artist: "12 Vendors",
    date: "2026-07-11",
    time: "13:00",
    genre: "Food Festival",
    description: "Twelve vendors, one long table the length of the beach. Fresh prawns, charcoal octopus, homemade sangria by the carafe, and an oyster bar at each end. A jazz trio takes over from 17:00.",
    image: "/showcase/events/golden-watchers.webp",
    tiers: [
      { name: "Free Entry",      price: 0,  description: "Open beach, pay at each stall",        total: 800, sold: 0  },
      { name: "Seafood Tasting", price: 30, description: "8 tasting credits + carafe of sangria", total: 120, sold: 62 },
    ],
  },
  {
    id: "ev-15",
    title: "Summer Finale",
    artist: "Harbour Lights",
    date: "2026-07-18",
    time: "19:00",
    genre: "Live Band",
    description: "Paradise's season-closer is always a Harbour Lights set — the six-piece band who've closed every summer for eight years. Expect classics, an extended encore, and fireworks at 22:00.",
    image: "/showcase/events/sunset-crowd.webp",
    tiers: [
      { name: "General Admission", price: 28,  description: "Beach access, standing",                                  total: 500, sold: 341 },
      { name: "Beach Lounge",      price: 65,  description: "Reserved table with sea view",                            total: 80,  sold: 60  },
      { name: "VIP Cabana",        price: 180, description: "Private cabana, premium bottles + fireworks seating",     total: 15,  sold: 12  },
    ],
  },
];
