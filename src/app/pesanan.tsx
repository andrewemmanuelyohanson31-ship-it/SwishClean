// Pelanggan_09_Pesanan_Saya (Figma 1:2607)
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BottomNav } from "@/components/BottomNav";
import { arts, rupiah } from "@/data/arts";
import { ORDER_CODE } from "@/data/order";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, T, Tag, TopBar, card } from "@/ui";

const [siti, dewi] = arts;
const STEPS = ["Dikonfirmasi", "Menuju", "Dikerjakan", "Selesai"];
const TABS = ["Aktif (1)", "Selesai", "Dibatalkan"];
const pink = "#FCE7E5";

// shortcut: orders are the design's sample data; read them from the order store/API once orders are persisted.
export default function PesananSaya() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Pesanan saya" back={false} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 13, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.tabs} accessibilityRole="tablist">
          {TABS.map((t, i) => (
            <View key={t} style={[s.tab, i === 0 && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: i === 0 }}>
              <T size={13} b={i === 0} color={i === 0 ? C.white : C.muted}>{t}</T>
            </View>
          ))}
        </View>

        <View style={s.active}>
          <View style={s.between}>
            <Tag label="Terjadwal" h={24} />
            <T size={11} color={C.faint}>{ORDER_CODE}</T>
          </View>
          <View style={[s.person, { marginTop: 14 }]}>
            <Avatar initials={siti.initials} color={siti.color} size={40} />
            <View style={{ marginLeft: 10 }}>
              <T b size={15}>{siti.name}</T>
              <T size={11} color={C.muted} style={{ marginTop: -1 }}>{`Bersih Rutin + Setrika • ${rupiah(162000)}`}</T>
            </View>
          </View>
          <View style={[s.person, { marginTop: 9 }]}>
            <icons.calendarSm style={{ marginLeft: 1.3 }} />
            <T size={12} style={{ marginLeft: 6.4 }}>Sel, 20 Okt • 09.00–13.00</T>
          </View>

          <View style={s.timeline}>
            <View style={s.line} />
            {STEPS.map((st, i) => (
              <View key={st} style={s.stepCol}>
                <View style={[s.dot, i === 0 ? s.dotOn : s.dotOff]} />
                <T size={10} b={i === 0} color={i === 0 ? C.ink : C.faint} style={{ marginTop: 6 }}>{st}</T>
              </View>
            ))}
          </View>

          <View style={[s.btnRow, { marginTop: 13 }]}>
            <Button title="Chat" size={12} icon={<icons.chatSm />} color={C.mintBg} textColor={C.primaryDark} style={{ width: 96, height: 36 }} onPress={() => router.push(`/chat/${siti.id}`)} />
            <Button title="Ubah jadwal" size={12} color={C.white} textColor={C.primary} style={[s.outline, { width: 112, height: 36 }]} onPress={() => router.push({ pathname: "/jadwal", params: { art: siti.id } })} />
            <Button title="Batalkan" size={12} color={pink} textColor={C.red} style={{ width: 94, height: 36 }} />
          </View>
        </View>
        <T size={11} color={C.muted} style={{ marginTop: 13 }}>Batal gratis sampai Sen, 19 Okt • 09.00</T>

        <T b size={15} style={{ marginTop: 13 }}>Perlu tindakan</T>
        <View style={[s.card, { height: 150, marginTop: 6 }]}>
          <View style={s.person}>
            <Avatar initials={siti.initials} color={siti.color} size={40} />
            <View style={{ marginLeft: 10 }}>
              <T b size={14}>{siti.name}</T>
              <T size={11} color={C.muted} style={{ marginTop: -1 }}>Sel, 13 Okt • Bersih Rutin • Selesai</T>
            </View>
          </View>
          <View style={s.note}>
            <icons.starOutlineGold />
            <T size={11} style={{ marginLeft: 8.3 }}>Beri rating & komentar dalam 3 hari</T>
          </View>
          <View style={[s.btnRow, { marginTop: 8 }]}>
            <Button title="Beri ulasan" size={12} style={{ width: 120, height: 32 }} onPress={() => router.push({ pathname: "/ulasan", params: { art: siti.id } })} />
            <Button title="Pesan lagi" size={12} color={C.white} textColor={C.primary} style={[s.outline, { width: 96, height: 32 }]} onPress={() => router.push({ pathname: "/jadwal", params: { art: siti.id } })} />
            <Button title="Komplain" size={12} color={pink} textColor={C.red} style={{ width: 86, height: 32 }} onPress={() => router.push({ pathname: "/komplain", params: { art: siti.id } })} />
          </View>
        </View>

        <View style={[s.card, { height: 92, marginTop: 12 }]}>
          <View style={s.person}>
            <Avatar initials={dewi.initials} color={dewi.color} size={40} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <T b size={14}>{dewi.name}</T>
              <T size={11} color={C.muted} style={{ marginTop: -1 }}>Sel, 6 Okt • Bersih Mendalam</T>
              <View style={[s.person, { marginTop: 1 }]}>
                <View style={{ flexDirection: "row", gap: 3, marginLeft: 1 }}>
                  {[1, 2, 3, 4, 5].map((i) => <icons.starMd key={i} />)}
                </View>
                <T size={11} color={C.muted} style={{ marginLeft: 4 }}>Ulasanmu terkirim</T>
              </View>
            </View>
            <View style={{ marginTop: 6, marginRight: 13 }}><Tag label="Selesai" h={24} /></View>
          </View>
        </View>
      </ScrollView>
      <BottomNav active="pesanan" />
    </View>
  );
}

const s = StyleSheet.create({
  tabs: { ...card, flexDirection: "row", height: 42, borderRadius: 21, padding: 3 },
  tab: { flex: 1, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: C.primary },
  active: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.primary, borderRadius: 20, height: 244, marginTop: 14, paddingHorizontal: 14.5, paddingTop: 14.5 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  person: { flexDirection: "row", alignItems: "center" },
  timeline: { flexDirection: "row", justifyContent: "space-between", marginTop: 13, marginHorizontal: -14 },
  line: { position: "absolute", top: 6.5, left: 44, right: 44, height: 3, backgroundColor: C.border },
  stepCol: { width: 86, alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotOn: { backgroundColor: C.primary },
  dotOff: { backgroundColor: C.white, borderWidth: 2, borderColor: C.faint },
  btnRow: { flexDirection: "row", gap: 8 },
  outline: { borderWidth: 1.5, borderColor: C.primary },
  card: { ...card, borderRadius: 20, paddingHorizontal: 15, paddingTop: 17 },
  note: { flexDirection: "row", alignItems: "center", height: 30, borderRadius: 10, backgroundColor: C.yellowBg, marginTop: 12, paddingLeft: 10.3 },
});
