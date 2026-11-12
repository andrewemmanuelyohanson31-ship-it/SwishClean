// Supabase backend (schema: supabase/migrations). Every function is a no-op / returns null when
// EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY are unset, so the app still runs on local sample data.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import { Art, arts } from "./arts";
import type { Order, Role } from "./store";

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
// shortcut: the app's calendar is October 2026 only, so `day` maps to 2026-10-DD; switch Order to a real date when the calendar does.
const toDate = (day: number) => `2026-10-${String(day).padStart(2, "0")}`;

export async function pullOrders(): Promise<Order[] | null> {
  if (!(await signedIn())) return null;
  const { data, error } = await supabase!.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return null;
  return data.map((r) => ({
    id: r.id, code: r.code, artId: r.art_id, day: Number(String(r.scheduled_on).slice(8, 10)), time: r.start_time, minutes: r.minutes,
    addons: r.addons, service: r.service, total: r.total, status: r.status, reviewed: r.reviewed, complained: r.complained,
  }));
}

export async function pushOrder(o: Order) {
  if (!(await signedIn())) return;
  const { error } = await supabase!.from("orders").insert({
    code: o.code, art_id: o.artId, scheduled_on: toDate(o.day), start_time: o.time, minutes: o.minutes,
    addons: o.addons, service: o.service, total: o.total,
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
