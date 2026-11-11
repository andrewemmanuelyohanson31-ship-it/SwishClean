// Mitra_03_Order_Baru (Figma 1:3278)
import { FC, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { MitraNav } from "@/components/MitraNav";
import { rupiah } from "@/data/arts";
import { REQUEST_JOBS } from "@/data/mitra";
import { setState, showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, Empty, T, TopBar, card } from "@/ui";

const DETAILS: [FC<SvgProps>, string][] = [
  [icons.mCalendar, "Sel, 27 Okt • 09.00–13.00 (4 jam)"],
  [icons.mSparkle, "Bersih Rutin + Setrika"],
  [icons.mHome, "70 m² • 2 KT • 1 KM • 1 kucing"],
  [icons.mPin, "Alam Sutera • 1,2 km dari kamu"],
];
const mmss = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

const MSG: Record<string, [string, string]> = {
  booking: ["Order diterima. Masuk ke jadwal Sel, 27 Okt.", "Booking ditolak. Pelanggan akan ditawari ART lain."],
  ubah: ["Perubahan jadwal Maya P. disetujui.", "Permintaan ubah jadwal ditolak."],
  pengganti: ["Order pengganti diambil. Masuk ke jadwal hari ini 13.00.", ""],
};

// shortcut: requests are sample data stored locally; send the answer to the backend later.
export default function OrderBaru() {
  const open = useStore((s) => s.requests);
  const online = useStore((s) => s.online);
  const [left, setLeft] = useState(24 * 60 + 13);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const answer = (id: string, accept: boolean) => {
    setState((s) => ({
      requests: s.requests.filter((x) => x !== id),
      accepted: accept && REQUEST_JOBS[id] ? [...s.accepted, id] : s.accepted,
    }));
    showToast(MSG[id][accept ? 0 : 1]);
  };
  const close = (id: string) => answer(id, false);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Order baru" back={false} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
        <T size={12} color={online ? C.muted : C.red} style={{ marginBottom: -6 }}>{online ? `${open.length} permintaan • jawab dalam 30 menit` : "Kamu offline • aktifkan di Jadwal untuk menerima order"}</T>
        {open.length === 0 && <Empty text="Tidak ada permintaan baru. Kami kabari saat ada order." />}

        {open.includes("booking") && (
          <View style={[s.card, s.cardHot]}>
            <View style={s.between}>
              <View style={[s.pill, { backgroundColor: C.yellow }]}><T size={11} color={C.navy}>Booking baru</T></View>
              <View style={s.row}>
                <icons.mClockRed />
                <T b size={13} color={C.red} style={{ width: 54, textAlign: "right" }}>{mmss(left)}</T>
              </View>
            </View>
            <View style={[s.row, { marginTop: 14 }]}>
              <Avatar initials="PC" color="#CFD8F6" size={40} />
              <View style={{ marginLeft: 10 }}>
                <T b size={15}>Piero C.</T>
                <View style={s.row}>
                  <icons.mStarSm style={{ marginLeft: 1 }} />
                  <T size={11} color={C.muted} style={{ marginLeft: 5 }}>4.8 sebagai pelanggan • langganan</T>
                </View>
              </View>
            </View>
            <View style={{ gap: 8, marginTop: 13 }}>
              {DETAILS.map(([Icon, text]) => (
                <View key={text} style={s.row}>
                  <View style={{ width: 16, alignItems: "center" }}><Icon /></View>
                  <T size={12} style={{ marginLeft: 8 }}>{text}</T>
                </View>
              ))}
            </View>
            <View style={s.earn}>
              <T b size={12} color={C.primaryDark}>{`Kamu terima ${rupiah(180000)}`}</T>
              <T size={11} color={C.muted}>tanpa potongan</T>
            </View>
            <View style={[s.row, { gap: 10, marginTop: 8 }]}>
              <Button title="Tolak" size={13} color={C.white} textColor={C.primary} style={[s.outline, { width: 110, height: 34 }]} onPress={() => close("booking")} />
              <Button title={left > 0 ? "Terima order" : "Waktu habis"} size={13} color={C.navy} style={{ flex: 1, height: 34, opacity: left > 0 && online ? 1 : 0.5 }}
                onPress={() => (left <= 0 ? showToast("Waktu menjawab habis.") : !online ? showToast("Aktifkan status online dulu di Jadwal.") : answer("booking", true))} />
            </View>
          </View>
        )}

        {open.includes("ubah") && (
          <View style={[s.card, { height: 134 }]}>
            <View style={[s.pill, { backgroundColor: C.mintBg, alignSelf: "flex-start" }]}><T size={11} color={C.primaryDark}>Ubah jadwal</T></View>
            <View style={[s.row, { marginTop: 10, alignItems: "flex-start" }]}>
              <Avatar initials="MP" color="#F5C1C9" size={32} />
              <View style={{ marginLeft: 8, marginTop: -1 }}>
                <T b size={13}>Maya P.</T>
                <T size={11} color={C.muted}>Minta pindah: Rab 21 Okt ke Kam 22 Okt, 10.00</T>
              </View>
            </View>
            <View style={[s.row, { gap: 10, marginTop: 10 }]}>
              <Button title="Tolak" size={12} color={C.white} textColor={C.primary} style={[s.outline, { width: 110, height: 30 }]} onPress={() => close("ubah")} />
              <Button title="Setujui" size={12} color={C.navy} style={{ flex: 1, height: 30 }} onPress={() => answer("ubah", true)} />
            </View>
          </View>
        )}

        {open.includes("pengganti") && (
          <View style={s.urgent}>
            <View style={s.row}>
              <icons.mSwapGold style={{ marginLeft: 2.3 }} />
              <T b size={13} style={{ marginLeft: 8.7 }}>Butuh ART pengganti</T>
            </View>
            <T size={11} color={C.muted} style={{ marginTop: 7, lineHeight: 17 }}>
              ART lain batal. Cluster Bahama, hari ini 13.00–15.00. Bonus pengganti +Rp20.000.
            </T>
            <View style={[s.between, { marginTop: 16 }]}>
              <T b size={14} color={C.navy}>{rupiah(95000)}</T>
              <Button title="Ambil order" size={12} color={C.yellow} textColor={C.navy} style={{ width: 108, height: 30, opacity: online ? 1 : 0.5 }} onPress={() => (online ? answer("pengganti", true) : showToast("Aktifkan status online dulu di Jadwal."))} />
            </View>
          </View>
        )}
      </ScrollView>
      <MitraNav active="order" />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  card: { ...card, borderRadius: 20, paddingHorizontal: 15, paddingTop: 15 },
  cardHot: { height: 292, borderWidth: 1.5, borderColor: C.navy, paddingHorizontal: 14.5, paddingTop: 14.5 },
  pill: { height: 24, borderRadius: 12, paddingHorizontal: 10, justifyContent: "center" },
  earn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 28, borderRadius: 10, backgroundColor: C.mintBg, marginTop: 9, paddingHorizontal: 12 },
  outline: { borderWidth: 1.5, borderColor: C.primary },
  urgent: { height: 136, borderRadius: 20, backgroundColor: C.yellowBg, paddingHorizontal: 16, paddingTop: 18 },
});
