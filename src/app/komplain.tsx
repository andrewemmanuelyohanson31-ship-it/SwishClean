// Pelanggan_12_Komplain_dan_Refund (Figma 1:2972)
import { FC, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { getArt, rupiah } from "@/data/arts";
import { dayName } from "@/data/calendar";
import { showToast, updateOrder, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, T, TopBar, card, useInsets, goBack } from "@/ui";

const PROBLEMS = ["ART tidak datang / batal mendadak", "Hasil kurang bersih", "Ada barang rusak / hilang", "Lainnya"];
const SOLUTIONS: { id: string; title: string; sub: string; Icon: FC<SvgProps> }[] = [
  { id: "ganti", title: "ART pengganti", sub: "hari ini, rating ≥ 4.7", Icon: icons.swapPrimary },
  { id: "refund", title: "Refund penuh", sub: "ke metode bayar asal", Icon: icons.refund },
];

export default function Komplain() {
  const { order: orderId } = useLocalSearchParams<{ order?: string }>();
  const orders = useStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId) ?? orders.find((o) => o.status === "selesai");
  const art = getArt(order?.artId);
  const { bottom } = useInsets();
  const [problem, setProblem] = useState(PROBLEMS[0]);
  const [solution, setSolution] = useState("refund");
  const submit = () => {
    if (order) updateOrder(order.id, { complained: true });
    showToast(solution === "refund" ? "Komplain terkirim. Keputusan refund maks. 24 jam." : "Komplain terkirim. Kami carikan ART pengganti hari ini.");
    goBack("/pesanan");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Ajukan komplain" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 15, paddingBottom: 110 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={s.order}>
          <View>
            <T b size={13}>{`Order ${order?.code ?? "-"}`}</T>
            <T size={11} color={C.muted} style={{ marginTop: 2 }}>{order ? `${art.name} • ${dayName(order.day)}, ${order.day} Okt` : art.name}</T>
          </View>
          <T b size={13} color={C.navy}>{rupiah(order?.total ?? 0)}</T>
        </View>

        <T b size={15} style={{ marginTop: 19 }}>Apa masalahnya?</T>
        <View style={{ gap: 8, marginTop: 6 }} accessibilityRole="radiogroup">
          {PROBLEMS.map((p) => {
            const on = p === problem;
            return (
              <Pressable key={p} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setProblem(p)} style={[s.option, on ? s.on : s.off]}>
                <View style={[s.radio, { borderColor: on ? C.primary : C.faint }]}>{on && <View style={s.radioDot} />}</View>
                <T size={13} style={{ marginLeft: 9 }}>{p}</T>
              </Pressable>
            );
          })}
        </View>

        <T b size={15} style={{ marginTop: 17 }}>Mau diselesaikan dengan cara apa?</T>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }} accessibilityRole="radiogroup">
          {SOLUTIONS.map(({ id: sid, title, sub, Icon }) => {
            const on = sid === solution;
            return (
              <Pressable key={sid} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setSolution(sid)} style={[s.solution, on ? s.on : s.off]}>
                <View style={{ height: 20, justifyContent: "center", marginLeft: 3 }}><Icon /></View>
                <T b size={13} style={{ marginTop: 6 }}>{title}</T>
                <T size={11} color={C.muted} style={{ marginTop: 2 }}>{sub}</T>
              </Pressable>
            );
          })}
        </View>

        <View style={s.policy}>
          <icons.clockGold style={{ marginTop: 1.5 }} />
          <View style={{ flex: 1, marginLeft: 9.5 }}>
            <T b size={13}>Keputusan maks. 24 jam</T>
            <T size={11} color={C.muted} style={{ marginTop: 2, lineHeight: 17 }}>
              Refund cair 1–3 hari kerja. ART yang batal mendadak mendapat catatan di profilnya.
            </T>
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottom, { paddingBottom: bottom + 2 }]}>
        <Button title="Kirim Komplain" color={C.navy} style={{ height: 56 }} onPress={submit} />
        <T size={12} color={C.primary} style={{ textAlign: "center", marginTop: 6 }} accessibilityRole="link" onPress={() => router.push("/bantuan/chat")}>Atau chat CS 24 jam</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  order: { ...card, height: 64, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
  option: { height: 46, borderRadius: 14, borderWidth: 1.5, flexDirection: "row", alignItems: "center", paddingLeft: 11.5 },
  on: { backgroundColor: C.mintBg, borderColor: C.primary },
  off: { backgroundColor: C.white, borderColor: C.border },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: C.primary },
  solution: { flex: 1, height: 96, borderRadius: 16, borderWidth: 1.5, paddingLeft: 14.5, paddingTop: 18.5 },
  policy: { flexDirection: "row", backgroundColor: C.yellowBg, borderRadius: 16, minHeight: 86, marginTop: 16, paddingLeft: 16.5, paddingRight: 16, paddingTop: 15 },
  bottom: { position: "absolute", left: 20, right: 20, bottom: 0 },
});
