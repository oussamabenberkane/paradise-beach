import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const EVENT_GRADIENTS = [
  "linear-gradient(135deg, #E8580C 0%, #F5A623 100%)",
  "linear-gradient(135deg, #E53935 0%, #E8580C 100%)",
  "linear-gradient(135deg, #F5A623 0%, #2D9E5F 100%)",
  "linear-gradient(135deg, #1E88E5 0%, #2D9E5F 100%)",
  "linear-gradient(135deg, #7B1FA2 0%, #E8580C 100%)",
  "linear-gradient(135deg, #E8580C 0%, #E53935 100%)",
  "linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)",
  "linear-gradient(135deg, #C94008 0%, #F5A623 100%)",
  "linear-gradient(135deg, #E53935 0%, #F5A623 100%)",
  "linear-gradient(135deg, #1E88E5 0%, #E8580C 100%)",
  "linear-gradient(135deg, #2D9E5F 0%, #E8580C 100%)",
  "linear-gradient(135deg, #7B1FA2 0%, #E53935 100%)",
];

export function getEventGradient(id: string): string {
  const num = parseInt(id.replace("e", ""), 10);
  return EVENT_GRADIENTS[num % EVENT_GRADIENTS.length];
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
}
