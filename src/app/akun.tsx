// Pelanggan_14_Akun (Figma 1:3149)
import { FC, Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { session } from "@/data/session";
import type { SvgProps } from "react-native-svg";
import { BottomNav } from "@/components/BottomNav";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, T, card, useInsets } from "@/ui";

const STATS = [["6", "Pesanan"], ["3", "ART favorit"], ["Rp15rb", "Promo aktif"]];
const MENU: { label: string; detail?: string; Icon: FC<SvgProps> }[] = [
  { label: "Alamat tersimpan", detail: "2 alamat", Icon: icons.pinMenu },
  { label: "Metode pembayaran", detail: "QRIS", Icon: icons.wallet },
  { label: "Notifikasi & pengingat", detail: "Aktif", Icon: icons.bellMenu },
  { label: "Kebijakan refund", Icon: icons.refundMenu },
  { label: "Kebijakan tanggung jawab", Icon: icons.doc },
  { label: "Asuransi kerusakan", detail: "s.d. Rp10 jt", Icon: icons.shieldMenu },
  { label: "Pusat bantuan (CS 24 jam)", Icon: icons.chatMenu },
];

const logout = () => {
  session.role = null;
  if (router.canDismiss()) router.dismissAll();
  router.replace("/masuk");
};

// shortcut: profile is the design's sample user; read from auth once login exists.
export default function Akun() {
  const { top } = useInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: top + 37 }]}>
          <Avatar initials="PC" color="#CFD8F6" size={64} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T b size={18} color={C.white}>Piero Christian</T>
            <T size={12} color={C.greet} style={{ marginTop: 1 }}>+62 812 •••• 4410</T>
          </View>
          <Button title="Ubah" size={12} color={C.navy2} textColor={C.mint} style={{ width: 66, height: 30, borderRadius: 15 }} />
        </View>

        <View style={s.stats}>
          {STATS.map(([v, l]) => (
            <View key={l} style={{ flex: 1, alignItems: "center" }}>
              <T b size={16} color={C.navy}>{v}</T>
              <T size={10} color={C.muted} style={{ marginTop: 2 }}>{l}</T>
            </View>
          ))}
        </View>

        <View style={s.menu}>
          {MENU.map(({ label, detail, Icon }, i) => (
            <Fragment key={label}>
              {i > 0 && <View style={s.divider} />}
              <Pressable accessibilityRole="button" style={s.item}>
                <View style={{ width: 24, alignItems: "center" }}><Icon /></View>
                <T size={13} style={{ flex: 1, marginLeft: 10 }}>{label}</T>
                {detail && <T size={11} color={C.muted} style={{ marginRight: 11 }}>{detail}</T>}
                <icons.chevMenu />
              </Pressable>
            </Fragment>
          ))}
        </View>

        <Pressable accessibilityRole="button" style={s.banner} onPress={() => router.push({ pathname: "/masuk", params: { peran: "mitra" } })}>
          <icons.logo />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T b size={14}>Mau jadi mitra ART?</T>
            <T size={11} color={C.muted} style={{ marginTop: -1 }}>Masuk sebagai mitra di aplikasi ini</T>
          </View>
          <icons.chevGold />
        </Pressable>

        <T b size={14} color={C.red} style={{ textAlign: "center", marginTop: 20 }} accessibilityRole="button" onPress={logout}>Keluar</T>
        <T size={10} color={C.faint} style={{ textAlign: "center", marginTop: 5 }}>SwishClean v1.0 • prototype</T>
      </ScrollView>
      <BottomNav active="akun" />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.navy, flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingLeft: 24, paddingBottom: 48 },
  stats: { ...card, flexDirection: "row", alignItems: "center", height: 64, borderRadius: 18, marginHorizontal: 20, marginTop: -30 },
  menu: { ...card, borderRadius: 18, marginHorizontal: 20, marginTop: 14, paddingHorizontal: 15, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 34, marginRight: -1 },
  item: { flexDirection: "row", alignItems: "center", height: 47, paddingRight: 9 },
  banner: { flexDirection: "row", alignItems: "center", backgroundColor: C.yellowBg, borderRadius: 18, height: 74, marginHorizontal: 20, marginTop: 12, paddingLeft: 14, paddingRight: 18 },
});
