// Pelanggan_13_ART_Langgananku (Figma 1:3038)
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BottomNav } from "@/components/BottomNav";
import { getArt, rupiah } from "@/data/arts";
import { dayName } from "@/data/calendar";
import { setState, showToast, toggleFavorite, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, Empty, IconButton, T, Tag, TopBar, card } from "@/ui";

// shortcut: the weekly subscription itself is the design's sample (Siti, Selasa 09.00); favourites/history are live.
const order = (art: string) => router.push({ pathname: "/jadwal", params: { art } });

export default function Langganan() {
  const favs = useStore((s) => s.favorites);
  const skip = useStore((s) => s.skipWeek);
  const orders = useStore((s) => s.orders);
  const last = orders.find((o) => o.status === "selesai");
  const siti = getArt("siti");
  const unfav = (id: string, name: string) => {
    toggleFavorite(id);
    showToast(`${name.split(" ")[0]} dihapus dari favorit`);
  };
  const toggleSkip = () => {
    setState({ skipWeek: !skip });
    showToast(skip ? "Jadwal Selasa, 27 Okt aktif lagi" : "Minggu ini dilewati. Jadwal berikutnya Selasa, 3 Nov");
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="ART Langgananku"
        back={false}
        right={
          <IconButton label="Tambah ART" bg="transparent" style={{ marginRight: -8 }} onPress={() => router.navigate("/cari")}>
            <icons.plusDark />
          </IconButton>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 15, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.next}>
          <T size={12} color={C.greet}>Jadwal rutin berikutnya</T>
          <T b size={18} color={C.white} style={{ marginTop: 1 }}>{skip ? "Selasa, 3 Nov • 09.00" : "Selasa, 27 Okt • 09.00"}</T>
          <View style={[s.row, { marginTop: 11 }]}>
            <Avatar initials={siti.initials} color={siti.color} size={40} />
            <View style={{ marginLeft: 10 }}>
              <T b size={13} color={C.white}>{siti.name}</T>
              <T size={11} color={C.greet} style={{ marginTop: -1 }}>{`Mingguan • 4 jam • ${rupiah(162000)}`}</T>
            </View>
          </View>
          <View style={[s.row, { gap: 8, marginTop: 10 }]}>
            <Button title="Ubah jadwal" size={12} color={C.white} textColor={C.navy} style={{ width: 150, height: 32 }} onPress={() => order(siti.id)} />
            <Button title={skip ? "Batal lewati" : "Lewati minggu ini"} size={12} color={C.mintBg} textColor={C.primaryDark} style={{ flex: 1, height: 32 }} onPress={toggleSkip} />
          </View>
        </View>

        <View style={[s.between, { marginTop: 20 }]}>
          <T b size={16}>ART favorit</T>
          <T size={12} color={C.muted}>{`${favs.length} ART`}</T>
        </View>
        <View style={{ gap: 12, marginTop: 8 }}>
          {favs.length === 0 && <Empty text="Belum ada ART favorit. Tekan ♥ di kartu ART." />}
          {favs.map(getArt).map((a) => {
            return (
              <View key={a.id} style={s.fav}>
                <Pressable style={[s.row, { flex: 1 }]} accessibilityRole="button" accessibilityLabel={`Profil ${a.name}`} onPress={() => router.push(`/art/${a.id}`)}>
                  <Avatar initials={a.initials} color={a.color} size={44} />
                  <View style={{ marginLeft: 12 }}>
                    <T b size={14}>{a.name}</T>
                    <View style={s.row}>
                      <icons.starMd style={{ marginLeft: 1 }} />
                      <T size={11} color={C.muted} style={{ marginLeft: 5 }}>{`${a.rating} • ${rupiah(a.pricePerHour)}/jam`}</T>
                    </View>
                  </View>
                </Pressable>
                <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel={`Hapus ${a.name} dari favorit`} onPress={() => unfav(a.id, a.name)} style={{ marginRight: 8 }}>
                  <icons.heartFilled />
                </Pressable>
                <Button title="Pesan" size={12} style={{ width: 72, height: 36 }} onPress={() => order(a.id)} />
              </View>
            );
          })}
        </View>

        <T b size={16} style={{ marginTop: 22 }}>Riwayat terakhir</T>
        {last ? (
          <Pressable style={s.history} accessibilityRole="button" onPress={() => router.navigate("/pesanan")}>
            <View>
              <T b size={13}>{`${dayName(last.day)}, ${last.day} Okt • ${getArt(last.artId).name.split(" ")[0]}`}</T>
              <T size={11} color={C.muted} style={{ marginTop: 1 }}>{last.service}</T>
            </View>
            <View style={{ marginRight: 13 }}><Tag label="Selesai" h={24} /></View>
          </Pressable>
        ) : (
          <Empty text="Belum ada pesanan selesai." />
        )}
      </ScrollView>
      <BottomNav active="langganan" />
    </View>
  );
}

const s = StyleSheet.create({
  next: { backgroundColor: C.navy, borderRadius: 20, height: 170, paddingHorizontal: 16, paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fav: { ...card, flexDirection: "row", alignItems: "center", height: 80, borderRadius: 18, paddingLeft: 13, paddingRight: 11 },
  history: { ...card, flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 60, borderRadius: 16, marginTop: 8, paddingLeft: 15 },
});
