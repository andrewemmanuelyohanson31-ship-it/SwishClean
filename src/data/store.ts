// App state shared by every screen, persisted on the device (AsyncStorage; localStorage on web).
// shortcut: local-only; when a backend exists, these become server reads/writes and the server enforces access rules.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type Role = "pelanggan" | "mitra";
export type OrderStatus = "aktif" | "selesai" | "dibatalkan";
export type Order = {
  id: string; code: string; artId: string; day: number; time: string; minutes: number; addons: string[];
  service: string; total: number; status: OrderStatus; reviewed?: boolean; complained?: boolean;
};
export type Address = { id: string; label: string; detail: string; area: string };
export type Notif = { id: string; title: string; body: string; at: string; read: boolean; href?: string; kind: "order" | "promo" | "chat" | "reminder" };
export type Home = { area: number; bed: number; bath: number; pets: boolean; type: string };
export type Filter = { query: string; tags: string[]; minRating: number; maxPrice: number; sort: "rating" | "jarak" | "harga" };
export type Payout = { id: string; amount: number; at: string };

export type State = {
  role: Role | null;
  profile: { name: string; phone: string; email: string };
  favorites: string[];
  addresses: Address[];
  addressId: string;
  payment: string;
  home: Home;
  filter: Filter;
  orders: Order[];
  notifs: Notif[];
  notifPrefs: { order: boolean; reminder: boolean; promo: boolean; chat: boolean };
  skipWeek: boolean;
  // Mitra ART
  online: boolean;
  days: string[];
  hours: { start: string; end: string; max: number };
  leaves: number[];
  requests: string[];
  accepted: string[];
  doneJobs: string[];
  balance: number;
  payouts: Payout[];
  skck: "wajib" | "review";
  signup: { ktp?: string; face?: string };
};

export const DEFAULT_FILTER: Filter = { query: "", tags: [], minRating: 0, maxPrice: 0, sort: "rating" };

const initial: State = {
  role: null,
  profile: { name: "Piero Christian", phone: "+62 812 •••• 4410", email: "" },
  favorites: ["siti", "rina", "nur"],
  addresses: [
    { id: "rumah", label: "Rumah", detail: "Jl. Jalur Sutera Barat No. 12", area: "Alam Sutera, Tangerang" },
    { id: "kantor", label: "Kantor", detail: "Jl. Boulevard Gading Serpong Blok M5", area: "Gading Serpong, Tangerang" },
  ],
  addressId: "rumah",
  payment: "qris",
  home: { area: 70, bed: 2, bath: 1, pets: true, type: "Rumah" },
  filter: { ...DEFAULT_FILTER, tags: ["Bersih Rutin", "Ramah Hewan"] },
  // Sample history from the design (Pesanan Saya).
  orders: [
    { id: "o1", code: "SC-26102-0917", artId: "siti", day: 20, time: "09.00", minutes: 240, addons: ["setrika"], service: "Bersih Rutin + Setrika", total: 162000, status: "aktif" },
    { id: "o2", code: "SC-26101-0844", artId: "siti", day: 13, time: "09.00", minutes: 240, addons: ["setrika"], service: "Bersih Rutin", total: 162000, status: "selesai" },
    { id: "o3", code: "SC-26100-0612", artId: "dewi", day: 6, time: "09.00", minutes: 240, addons: [], service: "Bersih Mendalam", total: 165000, status: "selesai", reviewed: true },
  ],
  notifs: [
    { id: "n1", kind: "reminder", title: "Besok Siti datang jam 09.00", body: "Pastikan kunci sudah dititip di satpam lobi.", at: "1 jam lalu", read: false, href: "/pesanan" },
    { id: "n2", kind: "chat", title: "Pesan baru dari Siti", body: "Kucingnya boleh di kamar dulu supaya tidak kabur?", at: "08.16", read: false, href: "/chat/siti" },
    { id: "n3", kind: "order", title: "Beri ulasan untuk Siti", body: "Bagaimana hasil kerja Sel, 13 Okt? Ulasanmu membantu ART lain.", at: "Kemarin", read: true, href: "/pesanan" },
    { id: "n4", kind: "promo", title: "Promo PERTAMA aktif", body: "Potongan Rp15.000 untuk order pertamamu bulan ini.", at: "2 hari lalu", read: true },
  ],
  notifPrefs: { order: true, reminder: true, promo: false, chat: true },
  skipWeek: false,
  online: true,
  days: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  hours: { start: "07.00", end: "16.00", max: 2 },
  leaves: [31],
  requests: ["booking", "ubah", "pengganti"],
  accepted: [],
  doneJobs: [],
  balance: 2340000,
  payouts: [],
  skck: "wajib",
  signup: {},
};

const KEY = "swishclean:v1";
let state: State = initial;
const listeners = new Set<() => void>();

export const getState = () => state;

/** Merge a patch into the store, notify screens and persist (fire-and-forget). */
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Read a slice. The selector must return a value already in the state (no new arrays/objects). */
export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

/** Load saved state once at startup; unknown/old keys fall back to defaults. */
export async function hydrate() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    state = initial; // corrupted storage: start fresh rather than crash
  }
  listeners.forEach((l) => l());
}

// ---- small helpers used by several screens ----
export const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const toggleFavorite = (artId: string) => setState((s) => ({ favorites: toggleIn(s.favorites, artId) }));

/** Save a new order (+ a notification) and return it. shortcut: id/code are made on the device; the server should issue them. */
export function createOrder(o: Omit<Order, "id" | "code" | "status">, artName: string, when: string): Order {
  const order: Order = {
    ...o,
    id: `o${Date.now()}`,
    code: `SC-2610${String(o.day).padStart(2, "0")}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    status: "aktif",
  };
  setState((s) => ({
    orders: [order, ...s.orders],
    notifs: [{ id: `n${Date.now()}`, kind: "order", title: `Order ${order.code} dikonfirmasi`, body: `${artName} • ${when}`, at: "Baru saja", read: false, href: "/pesanan" }, ...s.notifs],
  }));
  return order;
}

export function updateOrder(id: string, patch: Partial<Order>) {
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
}

export function logout() {
  setState({ role: null });
}

// ---- toast (not persisted) ----
let toast: string | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const toastListeners = new Set<() => void>();
export function showToast(msg: string) {
  toast = msg;
  toastListeners.forEach((l) => l());
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast = null;
    toastListeners.forEach((l) => l());
  }, 2600);
}
export const useToast = () =>
  useSyncExternalStore((l) => (toastListeners.add(l), () => toastListeners.delete(l)), () => toast, () => toast);
