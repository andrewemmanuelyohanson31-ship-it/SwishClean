// Mitra_06_Pekerjaan_Selesai (Figma 1:3507)
import { FC } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { rupiah } from "@/data/arts";
import { getJob } from "@/data/mitra";
import { useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, T, useInsets } from "@/ui";

const PHOTOS: [string, string, FC<SvgProps>][] = [
  ["Dapur", C.mintBg, icons.mHomeLg],
  ["Kamar mandi", C.yellowBg, icons.mSparkleLg],
  ["Setrika", "#E7ECFB", icons.mShirtLg],
];

export default function PekerjaanSelesai() {
  const { id, done, total } = useLocalSearchParams<{ id?: string; done?: string; total?: string }>();
  const all = Number(total) > 0 ? Number(total) : 9;
  const did = Math.min(all, Math.max(0, Number(done) >= 0 ? Number(done) : all));
  const st = useStore((s) => s);
  const job = getJob(id, st);
  const { top, bottom } = useInsets();
  const exitTo = (path: "/mitra" | "/mitra/pendapatan") => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate(path);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 71, paddingHorizontal: 20, paddingBottom: 150 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={s.halo}><View style={s.circle}><icons.mCheckGold /></View></View>
        <T b size={24} color={C.navy} style={{ textAlign: "center", marginTop: 20 }} accessibilityRole="header">Kerja bagus, Siti!</T>
        <T size={13} color={C.muted} style={{ textAlign: "center", lineHeight: 20, marginTop: 3, paddingHorizontal: 21 }}>
          {`Laporan dan foto terkirim ke ${job.customer.split(" ")[0]}. Upah masuk saldo setelah pelanggan konfirmasi (otomatis maks. 24 jam).`}
        </T>

        <View style={s.summary}>
          <View style={{ flexDirection: "row" }}>
            <Avatar initials={job.initials} color={job.color} size={36} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <T b size={14}>{job.customer}</T>
              <T size={11} color={C.muted} style={{ marginTop: -1 }}>Sel, 20 Okt • 09.00–13.05</T>
            </View>
            <View style={{ alignItems: "flex-end", marginTop: 4 }}>
              <T b size={16} color={C.navy}>{rupiah(job.pay)}</T>
              <T size={10} color={C.primary} style={{ marginTop: -2 }}>upah utuh</T>
            </View>
          </View>
          <T b size={12} style={{ marginTop: 22, marginLeft: 2 }}>Foto hasil (3)</T>
          <View style={s.photos}>
            {PHOTOS.map(([label, bg, Icon]) => (
              <View key={label} style={[s.photo, { backgroundColor: bg }]}>
                <View style={{ height: 23, justifyContent: "center", marginTop: 21 }}><Icon /></View>
                <T size={10} color={C.muted} style={{ marginTop: 17 }}>{label}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={s.ok}>
          <icons.mShield />
          <T b size={12} color={C.primaryDark} style={{ marginLeft: 9.5 }}>{`${did}/${all} tugas selesai${did === all ? " • tepat waktu" : ""}`}</T>
        </View>
      </ScrollView>

      <View style={[s.actions, { paddingBottom: bottom + 14 }]}>
        <Button title="Lihat Pendapatan" color={C.navy} style={{ height: 54 }} onPress={() => exitTo("/mitra/pendapatan")} />
        <Button title="Kembali ke Jadwal" color={C.white} textColor={C.primary} style={{ height: 54, borderWidth: 1.5, borderColor: C.primary }} onPress={() => exitTo("/mitra")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  halo: { alignSelf: "center", width: 124, height: 124, borderRadius: 62, backgroundColor: C.yellowBg, alignItems: "center", justifyContent: "center" },
  circle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.navy, alignItems: "center", justifyContent: "center" },
  summary: { height: 210, borderRadius: 20, backgroundColor: C.bg, marginTop: 21, paddingHorizontal: 14, paddingTop: 18 },
  photos: { flexDirection: "row", gap: 10, marginTop: 6, marginLeft: 2 },
  photo: { width: 98, height: 86, borderRadius: 14, alignItems: "center" },
  ok: { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 16, backgroundColor: C.mintBg, marginTop: 14, paddingLeft: 17 },
  actions: { position: "absolute", left: 20, right: 20, bottom: 0, gap: 10 },
});
