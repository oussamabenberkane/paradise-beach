export interface Registration {
  id: string;
  eventId: string;
  tierName: string;
  quantity: number;
  name: string;
  email: string;
  bookedAt: string;
  confirmationCode: string;
}

const KEY = "pb_registrations";

function randomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "PB-" +
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getRegistrations(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Registration[];
  } catch {
    return [];
  }
}

export function addRegistration(
  data: Omit<Registration, "id" | "bookedAt" | "confirmationCode">
): Registration {
  const reg: Registration = {
    ...data,
    id: randomId(),
    bookedAt: new Date().toISOString(),
    confirmationCode: randomCode(),
  };
  const all = getRegistrations();
  all.push(reg);
  localStorage.setItem(KEY, JSON.stringify(all));
  return reg;
}

export function getRegistrationsByEmail(email: string): Registration[] {
  return getRegistrations().filter(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  );
}

export function getAvailableCount(
  eventId: string,
  tierName: string,
  originalTotal: number,
  originalSold: number
): number {
  const regs = getRegistrations().filter(
    (r) => r.eventId === eventId && r.tierName === tierName
  );
  const bookedLocally = regs.reduce((s, r) => s + r.quantity, 0);
  return originalTotal - originalSold - bookedLocally;
}
