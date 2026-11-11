// App_02_Daftar_Mitra_3_Foto_Wajah (Figma 22:3)
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { pickImages } from "@/data/media";
import { setState } from "@/data/store";
import { router } from "expo-router";
import { CAM, CameraShell } from "@/components/CameraShell";
import { icons } from "@/icons";
import { C } from "@/theme";
import { T } from "@/ui";

// Guide is drawn in frame coordinates (x from screen left, y from y=246).
export default function FotoWajah() {
  const [front, setFront] = useState(true);
  const shoot = async () => {
    const [uri] = await pickImages({ camera: true, front });
    if (!uri) return;
    setState((s) => ({ signup: { ...s.signup, face: uri } }));
    router.push("/mitra/verifikasi");
  };
  return (
    <CameraShell
      title="Foto wajah"
      step={3}
      heading="Foto wajah sambil memegang KTP"
      sub="Wajah di dalam oval, KTP di bawah dagu"
      right={{ label: "Putar", icon: <icons.rotateWhite />, onPress: () => setFront(!front) }}
      caption={front ? "Kamera depan" : "Kamera belakang"}
      strip="Deteksi wajah aktif • kedipkan mata saat diminta"
      controlsHeight={224}
      rowTop={22}
      onShoot={shoot}
    >
      <View style={s.guide}>
        <icons.faceOval style={[s.abs, { left: 89.5, top: -1.5 }]} />
        <View style={[s.abs, s.face]} />
        <icons.shoulders style={[s.abs, { left: 117, top: 189 }]} />
        <icons.ktpCard style={[s.abs, { left: 132, top: 225 }]} />
        <View style={[s.abs, s.line, { top: 240, width: 50, height: 7 }]} />
        <View style={[s.abs, s.line, { top: 254, width: 64, height: 6 }]} />
        <View style={[s.abs, s.line, { top: 266, width: 40, height: 6 }]} />
        <View style={[s.abs, s.line, { left: 215, top: 238, width: 30, height: 38, borderRadius: 4 }]} />
        <T b size={11} color={C.yellow} style={[s.abs, { left: 0, right: 0, top: 309, textAlign: "center" }]}>KTP</T>
      </View>
      <View style={s.tips}>
        {["Lepas masker & kacamata", "Cahaya cukup"].map((t) => (
          <View key={t} style={s.pill}><T size={11} color={C.greet}>{t}</T></View>
        ))}
      </View>
    </CameraShell>
  );
}

const s = StyleSheet.create({
  guide: { height: 326, marginTop: 6 },
  abs: { position: "absolute" },
  face: { left: 149, top: 60, width: 92, height: 92, borderRadius: 46, backgroundColor: "#1e434a" },
  line: { left: 145, backgroundColor: "#2d5a62", borderRadius: 3 },
  tips: { flexDirection: "row", gap: 8, paddingLeft: 20 },
  pill: { height: 28, borderRadius: 14, backgroundColor: CAM.btn, paddingHorizontal: 12, justifyContent: "center" },
});
