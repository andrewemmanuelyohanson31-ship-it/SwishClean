// Pelanggan_02_Beranda (Figma 1:1854)
import { FC, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { SvgProps } from "react-native-svg";
import { ArtCard } from "@/components/ArtCard";
import { BottomNav } from "@/components/BottomNav";
import { HomeSheet } from "@/components/HomeSheet";
import { arts, rupiah } from "@/data/arts";
import { estimateMinutes, hoursLabel } from "@/data/order";
import { DEFAULT_FILTER, setState, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, IconButton, T, card, useInsets } from "@/ui";

const layanan: { label: string; tag: string; bg: string; Icon: FC<SvgProps> }[] = [
  { label: "Rutin", tag: "Bersih Rutin", bg: C.mintBg, Icon: icons.sparkle },
  { label: "Mendalam", tag: "Bersih Mendalam", bg: "#FDF1D8", Icon: icons.homeGold },
  { label: "Setrika", tag: "Setrika", bg: "#E7ECFB", Icon: icons.shirt },
  { label: "Pindahan", tag: "Pindahan", bg: "#FBE4E7", Icon: icons.box },
];
const cheapest = Math.min(...arts.map((a) => a.pricePerHour));

/** Open Cari, optionally pre-filtered to one service (Layanan tiles). */
const toCari = (tag?: string) => {
  if (tag) setState({ filter: { ...DEFAULT_FILTER, tags: [tag] } });
  router.navigate("/cari");
};

export default function Beranda() {
  const { top } = useInsets();
  const name = useStore((s) => s.profile.name);
  const home = useStore((s) => s.home);
  const addresses = useStore((s) => s.addresses);
  const addressId = useStore((s) => s.addressId);
  const notifs = useStore((s) => s.notifs);
  const [homeOpen, setHomeOpen] = useState(false);
  const area = addresses.find((a) => a.id === addressId)?.area ?? addresses[0]?.area ?? "Pilih lokasi";
  const minutes = estimateMinutes(home);
  const unread = notifs.some((n) => !n.read);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: top + 21 }]}>
          <View style={s.row}>
            <View>
              <T size={14} color={C.greet}>{`Halo, ${name.split(" ")[0]}`}</T>
              <Pressable accessibilityRole="button" accessibilityLabel="Ubah lokasi" onPress={() => router.push("/lokasi")} style={s.loc}>
                <icons.pin style={{ marginLeft: 2.75 }} />
                <T b size={16} color={C.white} style={{ marginLeft: 6.25 }}>{area}</T>
                <icons.chevDown style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
            <View style={{ marginTop: 4 }}>
              <IconButton label={unread ? "Notifikasi, ada yang belum dibaca" : "Notifikasi"} bg={C.navy2} onPress={() => router.push("/notifikasi")}>
                <icons.bell />
              </IconButton>
              {unread && <View style={s.dot} pointerEvents="none" />}
            </View>
          </View>
          <T b size={26} color={C.white} style={[s.headline, { marginTop: 20 }]}>
            Rumah bersih,{"\n"}<T b size={26} color={C.mint} style={s.headline}>tanpa ribet.</T>
          </T>
          <Pressable accessibilityRole="search" onPress={() => toCari()} style={s.search}>
            <icons.search />
            <T size={14} color={C.faint} style={{ marginLeft: 11.75 }}>Cari ART atau layanan…</T>
          </Pressable>
        </View>

        <View style={s.cek}>
          <T b size={15}>Cek harga cepat</T>
          <View style={s.inputs}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Luas rumah ${home.area} m², ubah`} onPress={() => setHomeOpen(true)} style={[s.input, { width: 150 }]}>
              <icons.homeSmall />
              <T size={14} style={{ marginLeft: 9.8 }}>{`${home.area} m²`}</T>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Jumlah kamar, ubah" onPress={() => setHomeOpen(true)} style={[s.input, { flex: 1 }]}>
              <T size={14}>{`${home.bed} kamar • ${home.bath} KM`}</T>
            </Pressable>
          </View>
          <View style={s.estRow}>
            <View style={{ flexDirection: "row", marginTop: 4.25 }}>
              <icons.clock style={{ marginLeft: 1.25, marginTop: 1 }} />
              <View style={{ marginLeft: 7.25 }}>
                <T b size={13} color={C.primaryDark}>{`Estimasi ${hoursLabel(minutes)}`}</T>
                <T size={11} color={C.muted} style={{ marginTop: -2 }}>{`mulai ${rupiah((minutes / 60) * cheapest)}`}</T>
              </View>
            </View>
            <Button title="Cari ART" size={14} color={C.yellow} textColor={C.navy} style={{ width: 148, height: 40 }} onPress={() => toCari()} />
          </View>
        </View>

        <T b size={17} style={s.section}>Layanan</T>
        <View style={s.tiles}>
          {layanan.map(({ label, tag, bg, Icon }) => (
            <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Layanan ${label}`} onPress={() => toCari(tag)} style={[s.tile, { backgroundColor: bg }]}>
              <View style={s.tileIcon}><Icon /></View>
              <T size={11} style={{ marginTop: 11.5 }}>{label}</T>
            </Pressable>
          ))}
        </View>

        <View style={[s.row, { marginTop: 21, paddingHorizontal: 20 }]}>
          <T b size={17}>ART terbaik di dekatmu</T>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={() => toCari()}>
            <T size={13} color={C.primary} style={{ marginTop: 4 }}>Lihat semua</T>
          </Pressable>
        </View>
        <View style={{ marginTop: 7, paddingHorizontal: 20 }}>
          <ArtCard art={arts[0]} />
        </View>
      </ScrollView>
      <BottomNav active="beranda" />
      <HomeSheet visible={homeOpen} onClose={() => setHomeOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 36 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  loc: { flexDirection: "row", alignItems: "center", marginTop: 1 },
  dot: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow },
  headline: { lineHeight: 34 },
  search: { marginTop: 11, height: 50, borderRadius: 14, backgroundColor: C.white, flexDirection: "row", alignItems: "center", paddingLeft: 18.7 },
  cek: { ...card, marginTop: -16, marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 15, paddingTop: 14, paddingBottom: 7 },
  inputs: { flexDirection: "row", gap: 10, marginTop: 6 },
  input: { height: 44, borderRadius: 12, backgroundColor: C.bg, flexDirection: "row", alignItems: "center", paddingLeft: 12 },
  estRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14 },
  section: { marginTop: 19, paddingHorizontal: 20 },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 7 },
  tile: { width: 80, height: 72, borderRadius: 18, alignItems: "center" },
  tileIcon: { height: 23, marginTop: 16.5, justifyContent: "center" },
});
