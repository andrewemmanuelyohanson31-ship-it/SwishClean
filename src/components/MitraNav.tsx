import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Href, router } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { icons } from "../icons";
import { C } from "../theme";
import { T, useInsets } from "../ui";

type Tab = { key: string; label: string; href: Href; off: FC<SvgProps>; on: FC<SvgProps>; badge?: number };

const tabs: Tab[] = [
  { key: "jadwal", label: "Jadwal", href: "/mitra", off: icons.mNavCal, on: icons.mNavCalOn },
  { key: "order", label: "Order baru", href: "/mitra/order-baru", off: icons.mNavBell, on: icons.mNavBellOn, badge: 3 },
  { key: "pendapatan", label: "Pendapatan", href: "/mitra/pendapatan", off: icons.mNavWallet, on: icons.mNavWalletOn },
  { key: "profil", label: "Profil", href: "/mitra/profil", off: icons.mNavUser, on: icons.mNavUserOn },
];

/** Mitra ART bottom navigation (4 tabs, yellow active pill). */
export function MitraNav({ active }: { active: Tab["key"] }) {
  const { bottom } = useInsets();
  return (
    <View style={[s.nav, { paddingBottom: bottom }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === active;
        const Icon = on ? t.on : t.off;
        return (
          <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}
            onPress={() => !on && router.navigate(t.href)} style={s.item}>
            <View style={[s.pill, on && { backgroundColor: C.yellowBg }]}><Icon /></View>
            {t.badge ? <View style={s.badge}><T b size={10} color={C.white} style={{ lineHeight: 15 }}>{String(t.badge)}</T></View> : null}
            <T size={11} b={on} color={on ? C.navy : C.faint} style={{ marginTop: 5 }}>{t.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: "row", backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 7 },
  item: { flex: 1, alignItems: "center" },
  pill: { width: 52, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, left: "50%", marginLeft: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: C.red, alignItems: "center", justifyContent: "center" },
});
