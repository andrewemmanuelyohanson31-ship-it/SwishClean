// Order pricing shared by Detail Rumah (step 2) and Konfirmasi (step 3).
import { dayLong } from "./calendar";

export const ADDONS = [
  { id: "setrika", label: "Setrika & lipat", short: "Setrika", minutes: 60, price: 30000 },
  { id: "kulkas", label: "Bersihkan kulkas", short: "Kulkas", minutes: 30, price: 25000 },
  { id: "jendela", label: "Lap kaca jendela", short: "Jendela", minutes: 30, price: 20000 },
] as const;
export type AddonId = (typeof ADDONS)[number]["id"];

export const BASE_HOURS = 3; // shortcut: fixed estimate from the design; derive from rooms/area once pricing rules exist.
export const SERVICE_FEE = 12000;
export const PROMO = { code: "PERTAMA", amount: 15000 };
export const ORDER_CODE = "SC-26102-0917"; // shortcut: static order number until orders are stored server-side.

export function quote(pricePerHour: number, addons: string[]) {
  const picked = ADDONS.filter((a) => addons.includes(a.id));
  const base = BASE_HOURS * pricePerHour;
  const minutes = BASE_HOURS * 60 + picked.reduce((m, a) => m + a.minutes, 0);
  const subtotal = base + picked.reduce((p, a) => p + a.price, 0);
  return { picked, base, minutes, subtotal, total: subtotal + SERVICE_FEE - PROMO.amount };
}

/** 240 → "4 jam", 210 → "3,5 jam" */
export const hoursLabel = (minutes: number) => `${String(minutes / 60).replace(".", ",")} jam`;

/** "09.00" + 240 min → "13.00" */
export function addTime(start: string, minutes: number) {
  const [h, m] = start.split(".").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}.${String(t % 60).padStart(2, "0")}`;
}

export const dateLong = (day: number) => `${dayLong(day)}, ${day} Oktober 2026`;

// self-check: the design's numbers (Siti, Rp45.000/jam, Setrika) must reproduce.
const q = quote(45000, ["setrika"]);
if (q.subtotal !== 165000 || q.total !== 162000 || hoursLabel(q.minutes) !== "4 jam" || addTime("09.00", q.minutes) !== "13.00") {
  throw new Error("order.ts pricing self-check failed");
}
