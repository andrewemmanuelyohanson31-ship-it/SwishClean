// Notifikasi (no Figma frame — card list in the Pesanan/Riwayat style, opened from the Beranda bell)
import { FC } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Href, router } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { Notif, setState, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Empty, T, TopBar, card } from "@/ui";

const KIND: Record<Notif["kind"], { Icon: FC<SvgProps>; bg: string }> = {
  order: { Icon: icons.calendarSm, bg: C.mintBg },
  reminder: { Icon: icons.clockSm, bg: C.mintBg },
  chat: { Icon: icons.chatSm, bg: C.mintBg },
  promo: { Icon: icons.starOutlineGold, bg: C.yellowBg },
};

export default function Notifikasi() {
  const notifs = useStore((s) => s.notifs);
  const prefs = useStore((s) => s.notifPrefs);
  // Respect Pengaturan notifikasi: hide kinds the user switched off.
  const visible = notifs.filter((n) => (n.kind === "promo" ? prefs.promo : n.kind === "chat" ? prefs.chat : n.kind === "reminder" ? prefs.reminder : prefs.order));
  const unread = visible.some((n) => !n.read);
  const open = (n: Notif) => {
    setState((s) => ({ notifs: s.notifs.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
    if (n.href) router.push(n.href as Href);
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Notifikasi"
        right={unread ? (
          <T size={12} color={C.primary} accessibilityRole="button" style={{ textAlign: "right" }}
            onPress={() => setState((s) => ({ notifs: s.notifs.map((x) => ({ ...x, read: true })) }))}>Baca</T>
        ) : undefined}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, gap: 10 }}>
        {visible.length === 0 && <Empty text="Belum ada notifikasi." />}
        {visible.map((n) => {
          const { Icon, bg } = KIND[n.kind];
          return (
            <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={`${n.read ? "" : "Belum dibaca. "}${n.title}`}
              style={[s.item, !n.read && { borderColor: C.primary, borderWidth: 1.5, paddingRight: 24 }]}>
              <View style={[s.icon, { backgroundColor: bg }]}><Icon /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={s.between}>
                  <T b size={13} style={{ flex: 1 }}>{n.title}</T>
                  <T size={11} color={C.faint} style={{ marginLeft: 8 }}>{n.at}</T>
                </View>
                <T size={12} color={C.muted} style={{ marginTop: 2, lineHeight: 18 }}>{n.body}</T>
              </View>
              {!n.read && <View style={s.dot} />}
            </Pressable>
          );
        })}
        <T size={12} color={C.primary} style={{ textAlign: "center", marginTop: 8 }} accessibilityRole="link" onPress={() => router.push("/pengaturan-notifikasi")}>
          Atur notifikasi
        </T>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  item: { ...card, flexDirection: "row", alignItems: "flex-start", borderRadius: 16, padding: 14 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  between: { flexDirection: "row", alignItems: "flex-start" },
  dot: { position: "absolute", top: 18, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow },
});
