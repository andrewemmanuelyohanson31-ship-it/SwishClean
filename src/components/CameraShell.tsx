import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DaftarSteps } from "./DaftarSteps";
import { icons } from "../icons";
import { C } from "../theme";
import { T, useInsets, goBack } from "../ui";

export const CAM = { bg: "#0a1e22", panel: "#081719", btn: "#15353b", strip: "#0f2a2f" };

type Side = { label: string; icon: ReactNode; onPress?: () => void };

/**
 * Dark camera layout shared by Foto KTP (21:180) and Foto wajah (22:3).
 * shortcut: the shutter only advances the flow; wire expo-camera / expo-image-picker for real capture.
 */
export function CameraShell({ title, step, heading, sub, children, left, right, caption, strip, controlsHeight, rowTop, onShoot }: {
  title: string; step: 2 | 3; heading: string; sub: string; children: ReactNode;
  left?: Side; right: Side; caption: string; strip?: string; controlsHeight: number; rowTop: number; onShoot: () => void;
}) {
  const { top, bottom } = useInsets();
  const side = (b?: Side) =>
    b ? (
      <Pressable accessibilityRole="button" accessibilityLabel={b.label} onPress={b.onPress} style={s.sideWrap}>
        <View style={s.sideBtn}>{b.icon}</View>
        <T size={11} color={C.greet} style={{ marginTop: 9 }}>{b.label}</T>
      </Pressable>
    ) : <View style={s.sideWrap} />;

  return (
    <View style={{ flex: 1, backgroundColor: CAM.bg }}>
      <StatusBar style="light" />
      <View style={[s.header, { paddingTop: top + 5 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => goBack("/mitra/daftar")} style={s.back}>
          <icons.chevLeftWhite />
        </Pressable>
        <T b size={17} color={C.white} style={s.title} accessibilityRole="header">{title}</T>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 25 }}>
        <DaftarSteps step={step} dark />
      </View>
      <T b size={16} color={C.white} style={{ textAlign: "center", marginTop: 31 }}>{heading}</T>
      <T size={12} color={C.greet} style={{ textAlign: "center", marginTop: 4 }}>{sub}</T>
      {children}

      <View style={[s.controls, { height: controlsHeight + bottom - 22 }]}>
        {strip && (
          <View style={s.strip}>
            <View style={s.live} />
            <T size={11} color={C.mint} style={{ marginLeft: 7 }}>{strip}</T>
          </View>
        )}
        <View style={[s.row, { marginTop: rowTop }]}>
          {side(left)}
          <Pressable accessibilityRole="button" accessibilityLabel="Ambil foto" onPress={onShoot} style={s.shutter}>
            <View style={s.shutterInner} />
          </Pressable>
          {side(right)}
        </View>
        <T size={12} color={C.greet} style={{ textAlign: "center", marginTop: 20 }}>{caption}</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: CAM.btn, alignItems: "center", justifyContent: "center", zIndex: 1 },
  title: { position: "absolute", left: 0, right: 0, bottom: 7, textAlign: "center" },
  controls: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: CAM.panel },
  strip: { flexDirection: "row", alignItems: "center", height: 36, backgroundColor: CAM.strip, paddingLeft: 23 },
  live: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3CC47C" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 32, height: 76 },
  sideWrap: { width: 52, alignItems: "center", marginTop: 12 },
  sideBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: CAM.btn, alignItems: "center", justifyContent: "center" },
  shutter: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.white, borderWidth: 3, borderColor: CAM.bg },
});
