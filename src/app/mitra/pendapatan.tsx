// Mitra_07_Pendapatan (Figma 1:3786)
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MitraNav } from "@/components/MitraNav";
import { rupiah } from "@/data/arts";
import { HISTORY, WEEK, allJobs } from "@/data/mitra";
import { useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, T, TopBar, card } from "@/ui";

// shortcut: balance/history are local; real payouts need a payment provider (e.g. Xendit/Midtrans disbursement) server-side.
export default function Pendapatan() {
  const balance = useStore((s) => s.balance);
  const payouts = useStore((s) => s.payouts);
  const doneJobs = useStore((s) => s.doneJobs);
  const accepted = useStore((s) => s.accepted);
  const finished = allJobs(accepted).filter((j) => doneJobs.includes(j.id) && j.id !== "piero"); // Piero 20 Okt is already in HISTORY
  const history = [
    ...payouts.map((p) => ({ key: p.id, title: `Penarikan ke BCA • ${p.at}`, status: "Diproses 1×24 jam", pending: true, amount: -p.amount })),
    ...finished.map((j) => ({ key: j.id, title: `${j.customer} • ${j.when.split(" ").slice(0, 3).join(" ")}`, status: "Menunggu konfirmasi", pending: true, amount: j.pay })),
    ...HISTORY.map((h) => ({ key: h.title, title: h.title, status: h.status, pending: !!h.pending, amount: h.amount })),
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Pendapatan" back={false} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 14, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.saldo}>
          <T size={12} color={C.greet}>Saldo bisa ditarik</T>
          <T b size={26} color={C.white} style={{ marginTop: 2, lineHeight: 37 }}>{rupiah(balance)}</T>
          <T size={11} color={C.greet}>ke BCA •••• 2201</T>
          <View style={[s.between, { marginTop: 4 }]}>
            <Button title="Tarik dana" size={12} color={C.yellow} textColor={C.navy} style={{ width: 150, height: 30 }} onPress={() => router.push("/mitra/tarik-dana")} />
            <T size={11} color={C.mint}>Cair 1×24 jam</T>
          </View>
        </View>

        <View style={s.chart}>
          <View style={s.between}>
            <T b size={14}>Minggu ini</T>
            <T b size={14} color={C.navy}>{rupiah(1260000)}</T>
          </View>
          <T size={11} color={C.muted}>7 pekerjaan • 26 jam</T>
          <View style={s.bars}>
            {WEEK.map((w) => (
              <View key={w.day} style={{ alignItems: "center" }}>
                <View style={s.barTrack} accessibilityLabel={`${w.day}`}>
                  {w.h > 0 && <View style={[s.barFill, { height: w.h, backgroundColor: w.today ? C.yellow : C.primary }]} />}
                </View>
                <T size={10} color={w.today ? C.navy : C.muted} style={{ marginTop: 8 }}>{w.day}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={s.note}>
          <icons.mWallet />
          <T size={11} color={C.primaryDark} style={{ marginLeft: 9 }}>Upah utuh 100% • biaya layanan dibayar pelanggan</T>
        </View>

        <T b size={14} style={{ marginTop: 16 }}>Riwayat</T>
        <View style={{ gap: 8, marginTop: 7 }}>
          {history.map((h) => (
            <View key={h.key} style={s.item}>
              <View style={{ flex: 1 }}>
                <T b size={12} numberOfLines={1}>{h.title}</T>
                <View style={[s.status, { backgroundColor: h.pending ? C.yellowBg : C.mintBg }]}>
                  <T size={10} color={h.pending ? "#B07810" : C.primaryDark} style={{ lineHeight: 15 }}>{h.status}</T>
                </View>
              </View>
              <T b size={13} color={h.amount < 0 ? C.red : C.navy}>{`${h.amount < 0 ? "−" : "+"}${rupiah(Math.abs(h.amount))}`}</T>
            </View>
          ))}
        </View>
      </ScrollView>
      <MitraNav active="pendapatan" />
    </View>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saldo: { height: 132, borderRadius: 20, backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 16 },
  chart: { ...card, height: 210, borderRadius: 20, marginTop: 12, paddingHorizontal: 15, paddingTop: 15 },
  bars: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  barTrack: { width: 28, height: 110, borderRadius: 8, backgroundColor: C.bg, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: 28, borderRadius: 8 },
  note: { flexDirection: "row", alignItems: "center", height: 46, borderRadius: 14, backgroundColor: C.mintBg, marginTop: 12, paddingLeft: 16.5 },
  item: { ...card, flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 52, borderRadius: 14, paddingHorizontal: 15 },
  status: { alignSelf: "flex-start", height: 16, borderRadius: 8, paddingHorizontal: 8, justifyContent: "center", marginTop: 2 },
});
