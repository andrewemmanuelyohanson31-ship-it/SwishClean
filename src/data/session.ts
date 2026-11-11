// Who is logged in. shortcut: in-memory only (reload = logged out); persist with expo-secure-store and verify OTP on a backend later.
export type Role = "pelanggan" | "mitra";
export const session: { role: Role | null; phone: string } = { role: null, phone: "" };
