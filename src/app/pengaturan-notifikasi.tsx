// Notifikasi & pengingat (no Figma frame — Akun menu card with the 44×26 toggle)
import { Fragment } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { State, setState, useStore } from "@/data/store";
import { C } from "@/theme";
import { T, Toggle, TopBar, card } from "@/ui";

type Key = keyof State["notifPrefs"];
const ROWS: { key: Key; title: string; sub: string }[] = [
  { key: "order", title: "Status pesanan", sub: "Dikonfirmasi, ART menuju, selesai" },
  { key: "reminder", title: "Pengingat jadwal", sub: "H-1 dan 1 jam sebelum ART datang" },
  { key: "chat", title: "Pesan chat", sub: "Pesan baru dari ART atau CS" },
  { key: "promo", title: "Promo & info", sub: "Potongan harga dan fitur baru" },
];

export default function PengaturanNotifikasi() {
  const prefs = useStore((s) => s.notifPrefs);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Notifikasi" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16 }}>
        <View style={s.menu}>
          {ROWS.map((r, i) => (
            <Fragment key={r.key}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.item}>
                <View style={{ flex: 1 }}>
                  <T b size={13}>{r.title}</T>
                  <T size={11} color={C.muted}>{r.sub}</T>
                </View>
                <Toggle label={r.title} value={prefs[r.key]} onChange={(v) => setState((st) => ({ notifPrefs: { ...st.notifPrefs, [r.key]: v } }))} />
              </View>
            </Fragment>
          ))}
        </View>
        <T size={11} color={C.muted} style={{ marginTop: 12 }}>Pengingat jadwal disarankan tetap aktif supaya kamu tidak melewatkan kedatangan ART.</T>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  menu: { ...card, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: C.border },
  item: { flexDirection: "row", alignItems: "center", minHeight: 62 },
});
