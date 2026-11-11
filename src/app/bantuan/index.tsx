// Pusat bantuan (no Figma frame — FAQ accordion cards + Jaminan-style CS banner). Shared by pelanggan & mitra.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Href, router } from "expo-router";
import { useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { T, TopBar, card } from "@/ui";

const FAQ_PELANGGAN = [
  { q: "Bagaimana cara membatalkan pesanan?", a: "Buka Pesanan > Aktif > Batalkan. Gratis hingga 24 jam sebelum jadwal; dana kembali 1–3 hari kerja." },
  { q: "ART tidak datang, apa yang harus dilakukan?", a: "Ajukan komplain. Kami tawarkan ART pengganti di hari yang sama atau refund penuh." },
  { q: "Apakah ART sudah terverifikasi?", a: "Ya. Semua mitra lolos verifikasi KTP, foto wajah, SKCK, dan pelatihan SwishClean." },
  { q: "Kapan saya dikenai biaya?", a: "Pembayaran ditahan dan baru diteruskan ke ART setelah kamu mengonfirmasi pekerjaan selesai." },
];
const FAQ_MITRA = [
  { q: "Kapan upah masuk saldo?", a: "Setelah pelanggan konfirmasi pekerjaan selesai, otomatis maksimal 24 jam." },
  { q: "Bagaimana cara tarik dana?", a: "Pendapatan > Tarik dana. Minimal Rp50.000, cair 1×24 jam ke rekening terdaftar." },
  { q: "Bagaimana mengajukan libur?", a: "Profil > Ajukan libur, minimal 3 hari sebelumnya agar order bisa dialihkan." },
];

export default function Bantuan() {
  const role = useStore((s) => s.role);
  const faq = role === "mitra" ? FAQ_MITRA : FAQ_PELANGGAN;
  const [open, setOpen] = useState<number | null>(0);
  const links: [string, Href][] = role === "mitra"
    ? [["Kebijakan & kontrak mitra", "/kebijakan/kontrak-mitra"]]
    : [["Kebijakan refund", "/kebijakan/refund"], ["Asuransi kerusakan", "/kebijakan/asuransi"]];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Pusat bantuan" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 30 }}>
        <Pressable style={s.cs} accessibilityRole="button" onPress={() => router.push("/bantuan/chat")}>
          <icons.chatMenu />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T b size={14}>Chat CS 24 jam</T>
            <T size={11} color={C.muted}>Rata-rata dibalas dalam 2 menit</T>
          </View>
          <icons.chevGold />
        </Pressable>

        <T b size={16} style={{ marginTop: 20 }}>Pertanyaan umum</T>
        <View style={{ gap: 8, marginTop: 8 }}>
          {faq.map((f, i) => (
            <Pressable key={f.q} style={s.faq} accessibilityRole="button" accessibilityState={{ expanded: open === i }} onPress={() => setOpen(open === i ? null : i)}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <T b size={13} style={{ flex: 1 }}>{f.q}</T>
                <T b size={16} color={C.primary} style={{ marginLeft: 10 }}>{open === i ? "−" : "+"}</T>
              </View>
              {open === i && <T size={12} color={C.muted} style={{ marginTop: 6, lineHeight: 19 }}>{f.a}</T>}
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8, marginTop: 16 }}>
          {links.map(([label, href]) => (
            <Pressable key={label} style={s.link} accessibilityRole="link" onPress={() => router.push(href)}>
              <icons.doc />
              <T size={12} style={{ flex: 1, marginLeft: 12 }}>{label}</T>
              <icons.chevMenu />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  cs: { flexDirection: "row", alignItems: "center", backgroundColor: C.yellowBg, borderRadius: 18, height: 74, paddingLeft: 18, paddingRight: 18 },
  faq: { ...card, borderRadius: 14, padding: 14 },
  link: { ...card, flexDirection: "row", alignItems: "center", height: 44, borderRadius: 12, paddingLeft: 16, paddingRight: 16 },
});
