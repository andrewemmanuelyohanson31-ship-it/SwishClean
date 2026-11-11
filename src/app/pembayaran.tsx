// Metode pembayaran (no Figma frame — built from the Konfirmasi "Metode pembayaran" card + Komplain radio list)
import { ScrollView, View } from "react-native";
import { PAYMENTS } from "@/data/payments";
import { setState, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { RadioCard, T, TopBar, goBack } from "@/ui";

export default function Pembayaran() {
  const payment = useStore((s) => s.payment);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Metode pembayaran" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16 }}>
        <T size={13} color={C.muted}>Pilih cara bayar untuk order berikutnya.</T>
        <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
          {PAYMENTS.map((m) => (
            <RadioCard
              key={m.id}
              title={m.name}
              sub={m.desc}
              on={payment === m.id}
              onPress={() => {
                setState({ payment: m.id });
                goBack("/akun");
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
          <icons.shieldSm style={{ marginLeft: 2 }} />
          <T size={11} color={C.muted} style={{ marginLeft: 8, flex: 1 }}>Dana ditahan sampai pekerjaan kamu konfirmasi. Refund penuh jika batal ≥ 24 jam sebelum jadwal.</T>
        </View>
      </ScrollView>
    </View>
  );
}
