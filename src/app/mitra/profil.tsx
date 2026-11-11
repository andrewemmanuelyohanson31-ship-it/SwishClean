// Mitra_08_Profil_dan_Ketersediaan (Figma 1:3885)
import { FC } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Href, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { SvgProps } from "react-native-svg";
import { MitraNav } from "@/components/MitraNav";
import { dayName } from "@/data/calendar";
import { logout, setState, showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, T, card, useInsets } from "@/ui";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DOCS = [
  ["KTP & foto wajah", "Terverifikasi"],
  ["SKCK", "Berlaku s.d. Mar 2027"],
  ["Pelatihan SwishClean", "Lulus • 12 Jul 2026"],
  ["Rekening bank", "BCA •••• 2201"],
];
const MENU: [FC<SvgProps>, string, Href][] = [[icons.mDoc, "Kebijakan & kontrak mitra", "/kebijakan/kontrak-mitra"], [icons.mChatMd, "Bantuan mitra 24 jam", "/bantuan"]];

const keluar = () => {
  logout();
  if (router.canDismiss()) router.dismissAll();
  router.replace({ pathname: "/masuk", params: { peran: "mitra" } });
};

// shortcut: identity/documents are the design's sample mitra; availability & leave are saved locally.
export default function ProfilMitra() {
  const { top } = useInsets();
  const days = useStore((s) => s.days);
  const hours = useStore((s) => s.hours);
  const leaves = useStore((s) => s.leaves);
  const toggle = (d: string) => {
    if (days.length === 1 && days.includes(d)) return showToast("Minimal satu hari kerja.");
    setState({ days: DAYS.filter((x) => (x === d ? !days.includes(d) : days.includes(x))) });
  };
  const nextLeave = leaves.find((d) => d >= 20);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: top + 33 }]}>
          <Avatar initials="SR" color="#F6C9A8" size={60} />
          <View style={{ marginLeft: 14, marginTop: 2 }}>
            <View style={s.row}>
              <T b size={18} color={C.white}>Siti Rahmawati</T>
              <View style={s.badge}><T b size={11} color={C.navy}>MITRA</T></View>
            </View>
            <View style={[s.row, { marginTop: 1 }]}>
              <icons.mStarMd />
              <T size={12} color={C.greet} style={{ marginLeft: 7 }}>4.9 • 128 ulasan • 412 pekerjaan</T>
            </View>
          </View>
        </View>

        <View style={[s.card, { marginTop: -26, paddingBottom: 17 }]}>
          <View style={s.between}>
            <T b size={14}>Ketersediaan</T>
            <T size={12} color={C.primary} accessibilityRole="button" onPress={() => router.push("/mitra/ketersediaan")}>Ubah</T>
          </View>
          <View style={s.days}>
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <Pressable key={d} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(d)} style={[s.day, { backgroundColor: on ? C.navy : C.bg }]}>
                  <T size={11} b={on} color={on ? C.white : C.faint}>{d}</T>
                </Pressable>
              );
            })}
          </View>
          <View style={[s.row, { marginTop: 14 }]}>
            <icons.mClockMd />
            <T size={12} style={{ marginLeft: 6 }}>{`${hours.start}–${hours.end} • maks. ${hours.max} order/hari`}</T>
          </View>
          <Pressable style={s.off} accessibilityRole="button" onPress={() => router.push("/mitra/libur")}>
            <icons.mCalendarGold />
            <T b size={12} style={{ flex: 1, marginLeft: 10 }}>{nextLeave ? `Libur: ${dayName(nextLeave)}, ${nextLeave} Okt${leaves.length > 1 ? ` (+${leaves.length - 1})` : ""}` : "Belum ada libur"}</T>
            <T b size={12} color="#B07810">Ajukan libur</T>
          </Pressable>
        </View>

        <View style={[s.card, { marginTop: 12, paddingBottom: 23 }]}>
          <T b size={14}>Dokumen & verifikasi</T>
          <View style={{ gap: 18, marginTop: 12 }}>
            {DOCS.map(([label, status]) => (
              <View key={label} style={s.row}>
                <View style={s.check}><icons.mCheckSm /></View>
                <T size={13} style={{ flex: 1, marginLeft: 10 }}>{label}</T>
                <T size={11} color={C.muted}>{status}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={s.protect}>
          <icons.mShieldMd style={{ marginTop: 3 }} />
          <View style={{ marginLeft: 12 }}>
            <T b size={13}>Asuransi kerja & kerusakan aktif</T>
            <T size={11} color={C.muted} style={{ marginTop: 1 }}>Kontrak mitra digital • tombol darurat 24 jam</T>
          </View>
        </View>

        <View style={{ gap: 6, marginTop: 12, marginHorizontal: 20 }}>
          {MENU.map(([Icon, label, href]) => (
            <Pressable key={label} accessibilityRole="button" style={s.menu} onPress={() => router.push(href)}>
              <View style={{ width: 20, alignItems: "center" }}><Icon /></View>
              <T size={12} style={{ flex: 1, marginLeft: 12 }}>{label}</T>
              <icons.mChevR />
            </Pressable>
          ))}
        </View>

        <T b size={13} color={C.red} style={{ textAlign: "center", marginTop: 13 }} accessibilityRole="button" onPress={keluar}>Keluar</T>
      </ScrollView>
      <MitraNav active="profil" />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "flex-start", backgroundColor: C.navy, paddingHorizontal: 22, paddingBottom: 46 },
  badge: { height: 22, borderRadius: 11, backgroundColor: C.yellow, paddingHorizontal: 11, justifyContent: "center", marginLeft: 7.6 },
  card: { ...card, borderRadius: 20, marginHorizontal: 20, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 14 },
  days: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  day: { width: 40.3, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  off: { flexDirection: "row", alignItems: "center", height: 42, borderRadius: 12, backgroundColor: C.yellowBg, marginTop: 10, paddingLeft: 13.6, paddingRight: 12 },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  protect: { flexDirection: "row", alignItems: "flex-start", height: 60, borderRadius: 16, backgroundColor: C.mintBg, marginTop: 12, marginHorizontal: 20, paddingLeft: 17, paddingTop: 12 },
  menu: { ...card, flexDirection: "row", alignItems: "center", height: 38, borderRadius: 12, paddingLeft: 18, paddingRight: 20 },
});
