// Supabase backend (schema: supabase/migrations). Every function is a no-op / returns null when
// EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY are unset, so the app still runs on local sample data.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import { Art, arts } from "./arts";
import { fromIsoDate, toIsoDate } from "./calendar";
import type { Address, Order, Role, State } from "./store";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key
  ? createClient(url, key, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
  : null;

// Refresh the session only while the app is in the foreground (Supabase's recommended RN setup).
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (s) => (s === "active" ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()));
}

/** "0812-3456 7890" / "+62 812..." → "+6281234567890"; null if it isn't an Indonesian mobile number. */
export function toE164(phone: string): string | null {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return /^628\d{7,11}$/.test(d) ? "+" + d : null;
}
if (toE164("0812-3456 7890") !== "+6281234567890" || toE164("+62 812 3456 7890") !== "+6281234567890" || toE164("+62 812 •••• 4410") !== null) {
  throw new Error("toE164 self-check failed");
}

// ---- auth (phone OTP via SMS; configure an SMS provider in Supabase → Auth → Providers → Phone) ----
export async function sendOtp(phone: string, role: Role) {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { data: { role } } });
  if (error) throw error;
}

/** Verifies the code and returns the role stored on the server for this number. */
export async function verifyOtp(phone: string, token: string): Promise<Role> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) throw error;
  const { data, error: e2 } = await supabase.from("profiles").select("role").single();
  if (e2) throw e2;
  return data.role as Role;
}

export const signOut = () => supabase?.auth.signOut().catch(() => {});
const signedIn = async () => !!supabase && !!(await supabase.auth.getSession()).data.session;
const myId = async () => (supabase ? (await supabase.auth.getSession()).data.session?.user.id ?? null : null);
const orderId = async (code: string) => (await supabase!.from("orders").select("id").eq("code", code).single()).data?.id as string | undefined;
const toDate = toIsoDate; // app "day" numbers (from 1 Okt 2026) ↔ SQL dates, see calendar.ts
const toDay = (date: string) => fromIsoDate(String(date));

// ---- ARTs: replace the local list with the server catalog ----
export async function loadArts() {
  if (!supabase) return false;
  const { data, error } = await supabase.from("arts").select("*").order("rating", { ascending: false });
  if (error || !data?.length) return false;
  const rows: Art[] = data.map((r) => ({
    id: r.id, name: r.name, initials: r.initials, color: r.color, rating: Number(r.rating), reviews: r.reviews, years: r.years,
    distanceKm: Number(r.distance_km), tags: r.tags, pricePerHour: r.price_per_hour, jobs: r.jobs ?? undefined, onTime: r.on_time ?? undefined,
    about: r.about ?? undefined, skills: r.skills ?? undefined, languages: r.languages ?? undefined, hours: r.hours ?? undefined,
  }));
  arts.splice(0, arts.length, ...rows); // in place: every screen imports this same array
  return true;
}

// ---- orders ----

export async function pullOrders(): Promise<Order[] | null> {
  if (!(await signedIn())) return null;
  const { data, error } = await supabase!.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return null;
  return data.map((r) => ({
    id: r.id, code: r.code, artId: r.art_id, day: toDay(r.scheduled_on), time: r.start_time, minutes: r.minutes,
    addons: r.addons, service: r.service, total: r.total, status: r.status, reviewed: r.reviewed, complained: r.complained,
    address: r.address, customer: r.customer_name, home: r.home_desc,
  }));
}

export async function pushOrder(o: Order) {
  if (!(await signedIn())) return;
  const { error } = await supabase!.from("orders").insert({
    code: o.code, art_id: o.artId, scheduled_on: toDate(o.day), start_time: o.time, minutes: o.minutes,
    addons: o.addons, service: o.service, total: o.total,
    address: o.address ?? "", customer_name: o.customer ?? "", home_desc: o.home ?? "",
  });
  if (error) throw error;
}

export async function pushOrderPatch(code: string, p: Partial<Order>) {
  if (!(await signedIn())) return;
  const row: Record<string, unknown> = {};
  if (p.day !== undefined) row.scheduled_on = toDate(p.day);
  if (p.time !== undefined) row.start_time = p.time;
  if (p.status !== undefined) row.status = p.status;
  if (p.reviewed !== undefined) row.reviewed = p.reviewed;
  if (p.complained !== undefined) row.complained = p.complained;
  if (!Object.keys(row).length) return;
  const { error } = await supabase!.from("orders").update(row).eq("code", code);
  if (error) throw error;
}

// ---- reviews, complaints, chat, payouts (tables: supabase/migrations) ----
export async function pushReview(code: string, artId: string, rating: number, comment: string) {
  if (!(await signedIn())) return;
  const id = await orderId(code);
  if (!id) throw new Error("order not on server");
  const { error } = await supabase!.from("reviews").insert({ order_id: id, art_id: artId, rating, comment });
  if (error) throw error;
}

/** Public reviews of one ART, newest first (reviewer stays anonymous). */
export async function loadReviews(artId: string) {
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("rating,comment,created_at").eq("art_id", artId).order("created_at", { ascending: false }).limit(50);
  return (data ?? []).map((r) => ({ stars: r.rating as number, text: r.comment as string, at: String(r.created_at).slice(0, 10) }));
}

export async function pushComplaint(code: string, reason: string, detail: string) {
  if (!(await signedIn())) return;
  const id = await orderId(code);
  if (!id) throw new Error("order not on server");
  const { error } = await supabase!.from("complaints").insert({ order_id: id, reason, detail });
  if (error) throw error;
}

export type ChatMsg = { me: boolean; text: string; at: string; image?: string };
export async function pullMessages(code: string): Promise<ChatMsg[] | null> {
  const me = await myId();
  if (!me) return null;
  const id = await orderId(code);
  if (!id) return null;
  const { data, error } = await supabase!.from("messages").select("sender_id,body,created_at").eq("order_id", id).order("created_at");
  if (error) return null;
  return data.map((m) => ({ me: m.sender_id === me, text: m.body, at: new Date(m.created_at).toTimeString().slice(0, 5).replace(":", ".") }));
}

export async function pushMessage(code: string, body: string) {
  if (!(await signedIn())) return;
  const id = await orderId(code);
  if (!id) throw new Error("order not on server");
  const { error } = await supabase!.from("messages").insert({ order_id: id, body });
  if (error) throw error;
}

export async function pushPayout(amount: number) {
  if (!(await signedIn())) return;
  const { error } = await supabase!.from("payouts").insert({ amount });
  if (error) throw error;
}

// ---- per-user slices: pull once after login, push changes as they happen ----
/** Server copy of the signed-in user's profile, favorites, addresses, mitra settings + linked ART. Null when not signed in. */
export async function pullMine(): Promise<Partial<State> | null> {
  const me = await myId();
  if (!me) return null;
  const [p, f, a, ms, art] = await Promise.all([
    supabase!.from("profiles").select("name,phone,email").single(),
    supabase!.from("favorites").select("art_id"),
    supabase!.from("addresses").select("id,label,detail,area"),
    supabase!.from("mitra_settings").select("*").maybeSingle(),
    supabase!.from("arts").select("id").eq("user_id", me).maybeSingle(),
  ]);
  const out: Partial<State> = { live: true, myArtId: art.data?.id ?? "" };
  if (p.data) out.profile = { name: p.data.name, phone: p.data.phone ?? "", email: p.data.email ?? "" };
  if (f.data) out.favorites = f.data.map((r) => r.art_id);
  if (a.data) out.addresses = a.data as Address[];
  if (out.addresses?.length) out.addressId = out.addresses[0].id;
  if (ms.data) Object.assign(out, {
    online: ms.data.online, days: ms.data.days, leaves: (ms.data.leaves as string[]).map(toDay),
    hours: { start: ms.data.start_time, end: ms.data.end_time, max: ms.data.max_jobs },
  });
  return out;
}

/** Push what changed between two store states. Only slices the server stores; errors bubble to the caller. */
export async function pushChanges(prev: State, next: State) {
  if (!next.live || !(await signedIn())) return;
  const jobs: PromiseLike<{ error: unknown }>[] = [];
  if (prev.favorites !== next.favorites) {
    for (const id of next.favorites.filter((x) => !prev.favorites.includes(x))) jobs.push(supabase!.from("favorites").insert({ art_id: id }));
    for (const id of prev.favorites.filter((x) => !next.favorites.includes(x))) jobs.push(supabase!.from("favorites").delete().eq("art_id", id));
  }
  if (prev.addresses !== next.addresses) {
    for (const a of next.addresses.filter((x) => !prev.addresses.some((p) => p.id === x.id))) {
      jobs.push(supabase!.from("addresses").insert({ label: a.label, detail: a.detail, area: a.area }));
    }
    // local ids differ from server uuids for addresses added this session, so match removals by content
    for (const a of prev.addresses.filter((x) => !next.addresses.some((n) => n.id === x.id))) {
      jobs.push(supabase!.from("addresses").delete().eq("label", a.label).eq("detail", a.detail));
    }
  }
  if (prev.profile.name !== next.profile.name || prev.profile.email !== next.profile.email) {
    jobs.push(supabase!.from("profiles").update({ name: next.profile.name, email: next.profile.email || null }).eq("id", (await myId())!));
  }
  if (next.role === "mitra" && (prev.online !== next.online || prev.days !== next.days || prev.hours !== next.hours || prev.leaves !== next.leaves)) {
    jobs.push(supabase!.from("mitra_settings").upsert({
      user_id: await myId(), online: next.online, days: next.days, start_time: next.hours.start, end_time: next.hours.end,
      max_jobs: next.hours.max, leaves: next.leaves.map(toDate),
    }));
  }
  const errors = (await Promise.all(jobs)).map((r) => r.error).filter(Boolean);
  if (errors.length) throw errors[0];
}
