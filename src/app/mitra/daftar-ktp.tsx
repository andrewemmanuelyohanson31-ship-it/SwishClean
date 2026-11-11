// App_02_Daftar_Mitra_2_Foto_KTP (Figma 21:180)
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { CAM, CameraShell } from "@/components/CameraShell";
import { icons } from "@/icons";
import { C } from "@/theme";
import { T } from "@/ui";

const TIPS = ["Foto KTP asli, bukan fotokopi", "Tidak silau, tidak buram", "Tanpa sampul plastik tebal"];
const LINES = [[0, 120, 10], [26, 150, 8], [46, 132, 8], [66, 114, 8], [86, 96, 8]]; // [top, width, height] of the KTP text bars
const next = () => router.push("/mitra/daftar-wajah");

export default function FotoKtp() {
  return (
    <CameraShell
      title="Foto KTP"
      step={2}
      heading="Posisikan KTP di dalam bingkai"
      sub="Pastikan semua sudut terlihat dan tulisan terbaca"
      left={{ label: "Galeri", icon: <icons.galleryWhite />, onPress: next }}
      right={{ label: "Flash", icon: <icons.flashGold /> }}
      caption="Ketuk tombol untuk memotret"
      controlsHeight={244}
      rowTop={68}
      onShoot={next}
    >
      <View style={s.frame}>
        <View style={s.card}>
          {LINES.map(([t, w, h]) => <View key={t} style={[s.bar, { top: 18 + t, width: w, height: h, borderRadius: h / 2 }]} />)}
          <View style={s.photo}>
            <View style={s.head} />
            <View style={s.body} />
          </View>
        </View>
        <icons.cornerTL style={[s.corner, { left: -2, top: -2 }]} />
        <icons.cornerTR style={[s.corner, { right: -2, top: -2 }]} />
        <icons.cornerBL style={[s.corner, { left: -2, bottom: -2 }]} />
        <icons.cornerBR style={[s.corner, { right: -2, bottom: -2 }]} />
      </View>
      <View style={{ marginTop: 27, marginLeft: 37, gap: 10 }}>
        {TIPS.map((t) => (
          <View key={t} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={s.tick}><icons.tipCheck /></View>
            <T size={13} color={C.greet} style={{ marginLeft: 9 }}>{t}</T>
          </View>
        ))}
      </View>
    </CameraShell>
  );
}

const s = StyleSheet.create({
  frame: { alignSelf: "center", width: 320, height: 202, borderRadius: 16, backgroundColor: "#11292e", marginTop: 22, padding: 18 },
  card: { flex: 1, borderRadius: 10, backgroundColor: "#1b3c43" },
  bar: { position: "absolute", left: 16, backgroundColor: "#2d5a62" },
  photo: { position: "absolute", left: 190, top: 32, width: 74, height: 96, borderRadius: 8, backgroundColor: "#2d5a62", alignItems: "center" },
  head: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#3b6e77", marginTop: 18 },
  body: { width: 50, height: 16, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: "#3b6e77", marginTop: 20 },
  corner: { position: "absolute" },
  tick: { width: 18, height: 18, borderRadius: 9, backgroundColor: CAM.btn, alignItems: "center", justifyContent: "center" },
});
