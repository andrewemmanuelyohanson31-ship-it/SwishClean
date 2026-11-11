// Pelanggan_07_Konfirmasi_Order (Figma 1:2735)
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getArt, rupiah } from "@/data/arts";
import { PROMO, SERVICE_FEE, addTime, dateLong, hoursLabel, quote } from "@/data/order";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, Steps, T, TopBar, card, useInsets } from "@/ui";

export default function Konfirmasi() {
  const p = useLocalSearchParams<{ art?: string; day?: string; time?: string; addons?: string }>();
  const art = getArt(p.art);
  const day = Number(p.day ?? 20);
  const time = p.time ?? "09.00";
  const q = quote(art.pricePerHour, (p.addons ?? "").split(",").filter(Boolean));
  const { bottom } = useInsets();
  const services = [art.tags[0], ...q.picked.map((a) => a.short)].join(" + ");
  const lines: [string, string, boolean?][] = [
    [`Jasa ART (3 jam × ${rupiah(art.pricePerHour)})`, rupiah(q.base)],
    ...q.picked.map((a): [string, string] => [a.label, rupiah(a.price)]),
    ["Biaya layanan SwishClean", rupiah(SERVICE_FEE)],
    [`Promo ${PROMO.code}`, `−${rupiah(PROMO.amount)}`, true],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Konfirmasi order" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 140 + bottom }} showsVerticalScrollIndicator={false}>
        <Steps n={3} />
        <View style={[s.card, { marginTop: 16, paddingTop: 15 }]}>
          <View style={{ flexDirection: "row" }}>
            <Avatar initials={art.initials} color={art.color} size={40} />
            <View style={{ marginLeft: 10 }}>
              <T b size={15}>{art.name}</T>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <icons.starMd style={{ marginLeft: 1 }} />
                <T size={11} color={C.muted} style={{ marginLeft: 5 }}>{`${art.rating} • ${services}`}</T>
              </View>
            </View>
          </View>
          <View style={[s.divider, { marginTop: 14 }]} />
          <View style={[s.row, { marginTop: 12 }]}>
            <View style={s.iconRow}>
              <icons.calendarPrimary style={{ marginLeft: 1.6 }} />
              <T b size={13} style={{ marginLeft: 9.6 }}>{dateLong(day)}</T>
            </View>
            <T size={12} color={C.primary} accessibilityRole="button" suppressHighlighting onPress={() => router.push({ pathname: "/jadwal", params: { art: art.id } })}>Ubah</T>
          </View>
          <View style={[s.iconRow, { marginTop: 10 }]}>
            <icons.clock style={{ marginLeft: 1.25 }} />
            <T b size={13} style={{ marginLeft: 9.25 }}>{`${time}–${addTime(time, q.minutes)} (${hoursLabel(q.minutes)})`}</T>
          </View>
        </View>

        <View style={[s.card, { marginTop: 12, paddingTop: 14, paddingBottom: 0 }]}>
          <T b size={15}>Rincian biaya</T>
          <View style={{ gap: 8, marginTop: 9 }}>
            {lines.map(([l, v, promo]) => (
              <View key={l} style={s.row}>
                <T size={13} color={C.muted}>{l}</T>
                <T size={13} color={promo ? C.primary : C.ink}>{v}</T>
              </View>
            ))}
          </View>
          <View style={s.alert}>
            <icons.alert />
            <T size={11} color={C.muted} style={{ marginLeft: 8.4 }}>Upah ART tidak dipotong biaya layanan.</T>
          </View>
          <View style={[s.divider, { marginTop: 14 }]} />
          <View style={[s.row, { marginTop: 9, marginBottom: 2, alignItems: "flex-end" }]}>
            <T b size={15} style={{ marginBottom: 2 }}>Total</T>
            <T b size={20} color={C.navy}>{rupiah(q.total)}</T>
          </View>
        </View>

        <T b size={15} style={{ marginTop: 21 }}>Metode pembayaran</T>
        <View style={s.pay} accessibilityRole="radio" accessibilityState={{ checked: true }}>
          <View style={s.radio}><View style={s.radioDot} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T b size={14}>QRIS</T>
            <T size={11} color={C.muted} style={{ marginTop: -1 }}>Semua e-wallet & m-banking</T>
          </View>
          <T size={12} color={C.primary}>Ganti</T>
        </View>
        <View style={[s.iconRow, { marginTop: 14 }]}>
          <icons.shieldSm style={{ marginLeft: 2 }} />
          <T size={11} color={C.muted} style={{ marginLeft: 8 }}>Dana ditahan sampai pekerjaan kamu konfirmasi.</T>
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: bottom + 2 }]}>
        <Button title={`Konfirmasi Order • ${rupiah(q.total)}`} style={{ height: 56 }} onPress={() => router.push({ pathname: "/berhasil", params: { ...p } })} />
        <T size={11} color={C.muted} style={{ textAlign: "center", marginTop: 7 }}>Batal gratis hingga 24 jam sebelum jadwal</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...card, borderRadius: 20, paddingHorizontal: 15, paddingBottom: 14 },
  divider: { height: 1, backgroundColor: C.border },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconRow: { flexDirection: "row", alignItems: "center" },
  alert: { flexDirection: "row", alignItems: "center", height: 40, borderRadius: 10, backgroundColor: C.yellowBg, marginTop: 9, paddingLeft: 10.3 },
  pay: { flexDirection: "row", alignItems: "center", height: 60, borderRadius: 16, borderWidth: 1.5, borderColor: C.primary, backgroundColor: C.mintBg, marginTop: 8, paddingLeft: 13, paddingRight: 15 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.primary, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: C.primary },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 20, paddingTop: 15 },
});
