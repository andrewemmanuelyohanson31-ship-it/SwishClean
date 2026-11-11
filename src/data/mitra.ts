// Mitra ART (housecleaner) side sample data from the design.
// shortcut: static; replace with the logged-in mitra's jobs/earnings from a backend.
export type Job = {
  id: string; time: string; start: string; customer: string; initials: string; color: string; service: string;
  address: string; route: string; pay: number; next?: boolean; home: string; note: string; when: string;
};

export const jobs: Job[] = [
  {
    id: "piero", time: "09.00–13.00", start: "09.00", customer: "Piero C.", initials: "PC", color: "#CFD8F6", service: "Rutin + Setrika",
    address: "Jl. Jalur Sutera Barat No. 12", route: "1,2 km • 6 mnt", pay: 180000, next: true,
    home: "70 m², 2 KT, 1 KM", note: "1 kucing • kunci di satpam", when: "Sel, 20 Okt 09.00",
  },
  {
    id: "maya", time: "14.30–17.00", start: "14.30", customer: "Maya P.", initials: "MP", color: "#F5C1C9", service: "Bersih Rutin",
    address: "Cluster Sutera Onyx, Blok C3", route: "3,4 km dari order 1 • 12 mnt", pay: 112500,
    home: "45 m², 1 KT, 1 KM", note: "Tanpa hewan peliharaan", when: "Sel, 20 Okt 14.30",
  },
];
export const getJob = (id?: string) => jobs.find((j) => j.id === id) ?? jobs[0];

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
