// Order pricing shared by Beranda (Cek harga), Detail Rumah (step 2) and Konfirmasi (step 3).
import { LAST_DAY, dayFull, dayLong } from "./calendar";

export const ADDONS = [
  { id: "setrika", label: "Setrika & lipat", short: "Setrika", minutes: 60, price: 30000 },
  { id: "kulkas", label: "Bersihkan kulkas", short: "Kulkas", minutes: 30, price: 25000 },
  { id: "jendela", label: "Lap kaca jendela", short: "Jendela", minutes: 30, price: 20000 },
] as const;
export type AddonId = (typeof ADDONS)[number]["id"];

export const SERVICE_FEE = 12000;
export const PROMO = { code: "PERTAMA", amount: 15000 };
export const AREAS = [30, 45, 70, 100, 150];
export const MIN_MINUTES = 120; // ART profile says "min. 2 jam"

/**
 * Cleaning time from house size, rounded up to 30 min ("dihitung otomatis per 30 menit").
 * 30 min base + 60 min per 70 m² + 30 min per bedroom + 30 min per bathroom → design default (70 m², 2 KT, 1 KM) = 3 jam.
 */
export function estimateMinutes(home: { area: number; bed: number; bath: number }) {
  const raw = 30 + (home.area / 70) * 60 + home.bed * 30 + home.bath * 30;
  return Math.max(MIN_MINUTES, Math.ceil(raw / 30) * 30);
}

export function quote(pricePerHour: number, addons: string[], baseMinutes = 180) {
  const picked = ADDONS.filter((a) => addons.includes(a.id));
  const base = (baseMinutes / 60) * pricePerHour;
  const minutes = baseMinutes + picked.reduce((m, a) => m + a.minutes, 0);
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

export const dateLong = (day: number) => `${dayLong(day)}, ${dayFull(day)}`;


const TIME_RE = /^([01]\d|2[0-3])\.[0-5]\d$/;
const int = (v: string | undefined, min: number, max: number, dflt: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : dflt;
};
/**
 * Booking params arrive via the URL (and the swishclean:// deep link), so treat them as untrusted:
 * anything invalid falls back to the design's defaults. Re-validate server-side once orders are real.
 */
export function parseBooking(p: { day?: string; time?: string; addons?: string; area?: string; bed?: string; bath?: string }) {
  return {
    day: int(p.day, 1, LAST_DAY, 20),
    time: p.time && TIME_RE.test(p.time) ? p.time : "09.00",
    addons: (p.addons ?? "").split(",").filter((a) => ADDONS.some((x) => x.id === a)),
    home: { area: AREAS.includes(Number(p.area)) ? Number(p.area) : 70, bed: int(p.bed, 0, 10, 2), bath: int(p.bath, 0, 10, 1) },
  };
}

// self-check: the design's numbers (Siti, Rp45.000/jam, 70 m² 2 KT 1 KM, Setrika) must reproduce.
const base = estimateMinutes({ area: 70, bed: 2, bath: 1 });
const q = quote(45000, ["setrika"], base);
if (base !== 180 || q.subtotal !== 165000 || q.total !== 162000 || hoursLabel(q.minutes) !== "4 jam" || addTime("09.00", q.minutes) !== "13.00") {
  throw new Error("order.ts pricing self-check failed");
}
if (estimateMinutes({ area: 30, bed: 0, bath: 0 }) !== MIN_MINUTES || estimateMinutes({ area: 150, bed: 4, bath: 3 }) !== 390) {
  throw new Error("order.ts estimate self-check failed");
}
const bad = parseBooking({ day: "abc", time: "<script>", addons: "x,setrika,../", area: "999", bed: "-1" });
const good = parseBooking({ day: "22", time: "14.00", addons: "setrika,kulkas", area: "100", bed: "3", bath: "2" });
if (bad.day !== 20 || bad.time !== "09.00" || bad.addons.join() !== "setrika" || bad.home.area !== 70 || bad.home.bed !== 2 ||
    good.day !== 22 || good.time !== "14.00" || good.addons.length !== 2 || good.home.area !== 100 || good.home.bath !== 2) {
  throw new Error("order.ts parseBooking self-check failed");
}
