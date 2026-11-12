// Desktop browsers show the app inside a phone-sized iframe, so the app itself still sees a real 390×844 window
// (modals, sheets, insets, useWindowDimensions all behave like on a phone). Phones and the iframe render normally.
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { C, F } from "@/theme";

const W = 390, H = 844, BEZEL = 12;

/** True only for a wide, top-level browser window — never inside the frame's own iframe or on native. */
export const shouldFrame = () =>
  Platform.OS === "web" && typeof window !== "undefined" && window.self === window.top && window.innerWidth >= 600;

export function PhoneFrame() {
  const { height } = useWindowDimensions();
  const scale = Math.min(1, (height - 64) / (H + BEZEL * 2)); // shrink on short laptop screens
  return (
    <View style={s.page}>
      <View style={[s.device, { transform: [{ scale }] }]}>
        <iframe title="SwishClean" src={window.location.href} style={{ width: W, height: H, border: 0, borderRadius: 40, display: "block" }} />
      </View>
      <Text style={s.caption}>Prototype SwishClean • buka di HP untuk layar penuh</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, minHeight: "100%", alignItems: "center", justifyContent: "center", backgroundColor: C.navy },
  device: { padding: BEZEL, borderRadius: 52, backgroundColor: C.ink, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" },
  caption: { position: "absolute", bottom: 12, fontFamily: F.reg, fontSize: 12, color: C.greet },
});
