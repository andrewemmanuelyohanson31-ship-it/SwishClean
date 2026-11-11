import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Href, router } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { icons } from "../icons";
import { C } from "../theme";
import { T, useInsets } from "../ui";

type Tab = { key: string; label: string; href: Href; off: FC<SvgProps>; on: FC<SvgProps> };

const tabs: Tab[] = [
  { key: "beranda", label: "Beranda", href: "/", off: icons.navHome, on: icons.navHomeOn },
  { key: "cari", label: "Cari", href: "/cari", off: icons.navSearch, on: icons.navSearchOn },
  { key: "pesanan", label: "Pesanan", href: "/pesanan", off: icons.navList, on: icons.navListOn },
  { key: "langganan", label: "Langganan", href: "/langganan", off: icons.navHeart, on: icons.navHeartOn },
  { key: "akun", label: "Akun", href: "/akun", off: icons.navUser, on: icons.navUserOn },
];

export const NAV_HEIGHT = 62;

/** Bottom navigation, 5 × 78px items. Sits at the bottom of each tab screen. */
export function BottomNav({ active }: { active: Tab["key"] }) {
  const { bottom } = useInsets();
  return (
    <View style={[s.nav, { paddingBottom: bottom }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === active;
        const Icon = on ? t.on : t.off;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            onPress={() => !on && router.navigate(t.href)}
            style={s.item}
          >
            <View style={[s.pill, on && { backgroundColor: C.mintBg }]}>
              <Icon />
            </View>
            <T size={11} b={on} color={on ? C.primary : C.faint} style={{ marginTop: 5 }}>{t.label}</T>
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
});
