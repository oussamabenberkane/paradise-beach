export interface Singer {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  photo: string;
  nationality: string;
  eventIds: string[];
  socialLinks?: { instagram?: string; spotify?: string };
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  headlinerId: string;
  supportIds: string[];
  venueSection: string;
  totalCapacity: number;
  description: string;
  coverImage: string;
  tags?: string[];
}

export interface TicketTier {
  name: string;
  price: number;
  total: number;
  sold: number;
}

export interface EventTickets {
  eventId: string;
  tiers: TicketTier[];
}
