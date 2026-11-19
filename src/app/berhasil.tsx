// Pelanggan_08_Order_Berhasil (Figma 1:2549)
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { dayLong, dayShort } from "@/data/calendar";
import { getArt, rupiah } from "@/data/arts";
import { addTime, hoursLabel } from "@/data/order";
import { showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, T, Toggle, useInsets } from "@/ui";

export default function OrderBerhasil() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const orders = useStore((s) => s.orders);
  const addresses = useStore((s) => s.addresses);
  const addressId = useStore((s) => s.addressId);
  // Unknown/missing id (e.g. a deep link) falls back to the newest active order.
  const order = orders.find((o) => o.id === id) ?? orders.find((o) => o.status === "aktif") ?? orders[0];
  const art = getArt(order.artId);
  const { day, time } = order;
  const q = { minutes: order.minutes, total: order.total };
  const first = art.name.split(" ")[0];
  const address = addresses.find((a) => a.id === addressId)?.detail ?? "";
  const { top, bottom } = useInsets();
  const [weekly, setWeekly] = useState(false);
  const toggleWeekly = (v: boolean) => {
    setWeekly(v);
    showToast(v ? `Langganan mingguan dengan ${first} aktif` : "Langganan mingguan dibatalkan");
  };
  // Leave the booking flow entirely, then land on the chosen tab.
  const exitTo = (path: "/" | "/pesanan") => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate(path);
  };

  const rows = [
    { Icon: icons.calendarSm, text: `${dayLong(day)}, ${dayShort(day)} 2026`, style: { marginLeft: 1.7 } },
    { Icon: icons.clockSm, text: `${time}–${addTime(time, q.minutes)} (${hoursLabel(q.minutes)})`, style: { marginLeft: 1 } },
    { Icon: icons.pinSm, text: address, style: { marginLeft: 2.4 } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.white }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 79, paddingHorizontal: 20, paddingBottom: 150 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={s.halo}>
          <View style={s.circle}><icons.checkLg /></View>
        </View>
        <T b size={24} color={C.navy} style={{ textAlign: "center", marginTop: 24 }} accessibilityRole="header">Order berhasil!</T>
        <T size={13} color={C.muted} style={{ textAlign: "center", lineHeight: 21, marginTop: 5, paddingHorizontal: 40 }}>
          {first} sudah menerima ordermu. Kami kirim pengingat H-1 dan 1 jam sebelum jadwal.
        </T>

        <View style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Avatar initials={art.initials} color={art.color} size={40} />
            <View style={{ flex: 1, marginLeft: 10, marginTop: 2 }}>
              <T b size={14}>{art.name}</T>
              <T size={11} color={C.muted}>{order.code}</T>
            </View>
            <T b size={15} color={C.navy} style={{ marginTop: 7 }}>{rupiah(q.total)}</T>
          </View>
          <View style={{ gap: 8, marginTop: 15 }}>
            {rows.map(({ Icon, text, style }) => (
              <View key={text} style={s.row}>
                <View style={{ width: 22 }}><Icon style={style} /></View>
                <T size={12}>{text}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={s.weekly}>
          <icons.repeat />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <T b size={13}>Jadikan langganan mingguan?</T>
            <T size={11} color={C.muted} style={{ marginTop: -2 }}>{`Pesan ${first} lagi tiap ${dayLong(day)}, ${time}`}</T>
          </View>
          <Toggle value={weekly} onChange={toggleWeekly} label="Jadikan langganan mingguan" />
        </View>
      </ScrollView>

      <View style={[s.actions, { paddingBottom: bottom + 24 }]}>
        <Button title="Lihat Pesanan" style={{ height: 54 }} onPress={() => exitTo("/pesanan")} />
        <Button title="Kembali ke Beranda" color={C.white} textColor={C.primary} style={s.outline} onPress={() => exitTo("/")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  halo: { alignSelf: "center", width: 128, height: 128, borderRadius: 64, backgroundColor: C.mintBg, alignItems: "center", justifyContent: "center" },
  circle: { width: 88, height: 88, borderRadius: 44, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: C.bg, borderRadius: 20, marginTop: 29, height: 156, paddingLeft: 12, paddingRight: 16, paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center", height: 18, marginLeft: 4.5 },
  weekly: { flexDirection: "row", alignItems: "center", backgroundColor: C.mintBg, borderRadius: 16, height: 66, marginTop: 16, paddingLeft: 19, paddingRight: 16 },
  actions: { position: "absolute", left: 20, right: 20, bottom: 0, gap: 10 },
  outline: { height: 54, borderWidth: 1.5, borderColor: C.primary },
});
