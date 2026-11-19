// Mitra ART (housecleaner) side: sample jobs from the design + real orders booked with this mitra's ART.
// shortcut: WEEK/HISTORY earnings charts stay sample data; compute them from finished orders when there is history.
import { dayName, dayShort } from "./calendar";
import { PROMO, SERVICE_FEE, addTime } from "./order";
import type { Order, State } from "./store";

export type Job = {
  orderId?: string; orderCode?: string; // set when the job is a real customer order
  id: string; day: number; time: string; start: string; customer: string; initials: string; color: string; service: string;
  address: string; route: string; pay: number; next?: boolean; home: string; note: string; when: string;
};

export const jobs: Job[] = [
  {
    id: "piero", day: 20, time: "09.00–13.00", start: "09.00", customer: "Piero C.", initials: "PC", color: "#CFD8F6", service: "Rutin + Setrika",
    address: "Jl. Jalur Sutera Barat No. 12", route: "1,2 km • 6 mnt", pay: 180000, next: true,
    home: "70 m², 2 KT, 1 KM", note: "1 kucing • kunci di satpam", when: "Sel, 20 Okt 09.00",
  },
  {
    id: "maya", day: 20, time: "14.30–17.00", start: "14.30", customer: "Maya P.", initials: "MP", color: "#F5C1C9", service: "Bersih Rutin",
    address: "Cluster Sutera Onyx, Blok C3", route: "3,4 km dari order 1 • 12 mnt", pay: 112500,
    home: "45 m², 1 KT, 1 KM", note: "Tanpa hewan peliharaan", when: "Sel, 20 Okt 14.30",
  },
];
/** Jobs that appear once the matching Order baru request is accepted (key = request id). */
export const REQUEST_JOBS: Record<string, Job> = {
  booking: {
    id: "piero27", day: 27, time: "09.00–13.00", start: "09.00", customer: "Piero C.", initials: "PC", color: "#CFD8F6", service: "Bersih Rutin + Setrika",
    address: "Jl. Jalur Sutera Barat No. 12", route: "1,2 km • 6 mnt", pay: 180000, home: "70 m², 2 KT, 1 KM", note: "1 kucing • langganan", when: "Sel, 27 Okt 09.00",
  },
  pengganti: {
    id: "bahama", day: 20, time: "13.00–15.00", start: "13.00", customer: "Rani S.", initials: "RS", color: "#D4EBC4", service: "Pengganti • Bersih Rutin",
    address: "Cluster Bahama, Blok B2", route: "2,1 km • 8 mnt", pay: 95000, home: "60 m², 2 KT, 1 KM", note: "Bonus pengganti +Rp20.000", when: "Sel, 20 Okt 13.00",
  },
};

const COLORS = ["#CFD8F6", "#F5C1C9", "#D4EBC4", "#F8D98F", "#BFE3DC"];
/** A customer order as the mitra sees it. The ART wage is the order total without service fee/promo. */
export function orderJob(o: Order): Job {
  const name = (o.customer || "Pelanggan").trim();
  const parts = name.split(/\s+/);
  return {
    id: o.id, orderId: o.id, orderCode: o.code, day: o.day, start: o.time, time: `${o.time}–${addTime(o.time, o.minutes)}`,
    customer: parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0], initials: parts.map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    color: COLORS[o.code.charCodeAt(o.code.length - 1) % COLORS.length], service: o.service, address: o.address || "Alamat ada di chat",
    route: "Lihat peta", pay: o.total - SERVICE_FEE + PROMO.amount, home: o.home || "–", note: `Order ${o.code}`,
    when: `${dayName(o.day)}, ${dayShort(o.day)} ${o.time}`,
  };
}

type JobSource = Pick<State, "accepted" | "orders" | "live" | "myArtId">;
/** Live: only real orders for this mitra's ART. Demo: the design's sample jobs + orders booked on this device. */
export function allJobs(s: JobSource) {
  const real = s.orders.filter((o) => o.artId === s.myArtId && o.status !== "dibatalkan").map(orderJob);
  const sample = s.live ? [] : [...jobs, ...s.accepted.map((r) => REQUEST_JOBS[r]).filter(Boolean)];
  return [...sample, ...real].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
}
export const getJob = (id: string | undefined, s: JobSource) =>
  [...allJobs(s), ...Object.values(REQUEST_JOBS)].find((j) => j.id === id) ?? allJobs(s)[0] ?? jobs[0];

/** Checklist per room; `done` is the starting state shown in the design. */
export const TASKS: { room: string; items: { label: string; done: boolean }[] }[] = [
  { room: "Dapur", items: [{ label: "Cuci piring & lap kompor", done: true }, { label: "Lap meja & kabinet", done: true }, { label: "Bersihkan kulkas", done: false }] },
  { room: "Kamar mandi", items: [{ label: "Sikat lantai & kloset", done: true }, { label: "Lap kaca & wastafel", done: true }] },
  { room: "Kamar tidur (2)", items: [{ label: "Ganti sprei", done: false }, { label: "Sapu, pel & lap debu", done: false }] },
  { room: "Add-on", items: [{ label: "Setrika & lipat (1 jam)", done: false }, { label: "Foto hasil akhir", done: false }] },
];

export const WEEK = [
  { day: "Sen", h: 94.6 }, { day: "Sel", h: 58.2, today: true }, { day: "Rab", h: 72.8 }, { day: "Kam", h: 0 },
  { day: "Jum", h: 109.2 }, { day: "Sab", h: 72.8 }, { day: "Min", h: 0 },
];

export const HISTORY = [
  { title: "Piero C. • Sel, 20 Okt", status: "Menunggu konfirmasi", pending: true, amount: 180000 },
  { title: "Maya P. • Sen, 19 Okt", status: "Masuk saldo", amount: 112500 },
  { title: "Bonus ART pengganti", status: "Masuk saldo", amount: 20000 },
];
