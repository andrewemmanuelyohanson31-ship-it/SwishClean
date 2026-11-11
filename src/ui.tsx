import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, F } from "./theme";
import { icons } from "./icons";

type TP = TextProps & { size?: number; b?: boolean; color?: string; style?: StyleProp<TextStyle> };

/** Poppins text with Figma's "normal" line-height (≈1.5×). */
export function T({ size = 14, b, color = C.ink, style, ...p }: TP) {
  return (
    <Text
      {...p}
      style={[{ fontFamily: b ? F.bold : F.reg, fontSize: size, lineHeight: Math.ceil(size * 1.5), color, includeFontPadding: false }, style]}
    />
  );
}

/** Design frames assume a 47px status bar and 34px home indicator; use real insets on device. */
export function useInsets() {
  const i = useSafeAreaInsets();
  return { top: Math.max(i.top, 47), bottom: Math.max(i.bottom, 22) };
}

export function IconButton({ children, onPress, bg = C.bg, label, style }: { children: ReactNode; onPress?: () => void; bg?: string; label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} style={[s.iconBtn, { backgroundColor: bg }, style]}>
      {children}
    </Pressable>
  );
}

export function BackButton({ bg }: { bg?: string }) {
  return (
    <IconButton label="Kembali" bg={bg} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
      <icons.chevLeft />
    </IconButton>
  );
}

/** White top bar: back button, centered title, optional right slot, hairline bottom border. */
export function TopBar({ title, right, back = true }: { title: string; right?: ReactNode; back?: boolean }) {
  const { top } = useInsets();
  return (
    <View style={[s.topBar, { paddingTop: top + 5 }]}>
      <View style={s.side}>{back && <BackButton />}</View>
      <T b size={17} style={s.title} accessibilityRole="header">{title}</T>
      <View style={[s.side, { alignItems: "flex-end" }]}>{right}</View>
    </View>
  );
}

export function Button({ title, onPress, style, size = 15, color = C.primary, textColor = C.white, icon }: { title: string; onPress?: () => void; style?: StyleProp<ViewStyle>; size?: number; color?: string; textColor?: string; icon?: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.btn, icon ? { flexDirection: "row" } : null, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }, style]}>
      {icon}
      <T size={size} color={textColor} style={icon ? { marginLeft: 9 } : undefined}>{title}</T>
    </Pressable>
  );
}

export function Tag({ label, h = 22 }: { label: string; h?: number }) {
  return (
    <View style={[s.tag, { height: h, borderRadius: h / 2 }]}>
      <T size={11} color={C.primaryDark}>{label}</T>
    </View>
  );
}

export function Avatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <T b size={size >= 100 ? 31 : size >= 90 ? 26 : size >= 50 ? 15 : 10} color={C.navy}>{initials}</T>
    </View>
  );
}

/** 44×26 toggle from the design (native Switch sizes differ per platform). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} hitSlop={8} onPress={() => onChange(!value)}
      style={[s.toggle, { backgroundColor: value ? C.primary : C.border, alignItems: value ? "flex-end" : "flex-start" }]}>
      <View style={s.knob} />
    </Pressable>
  );
}

/** "Langkah n dari 3" + progress track (230px; fills 77/153/230). */
export function Steps({ n, style }: { n: 1 | 2 | 3; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.step, style]}>
      <T size={12} color={C.primary}>{`Langkah ${n} dari 3`}</T>
      <View style={s.track}><View style={[s.progress, { width: [77, 153, 230][n - 1] }]} /></View>
    </View>
  );
}

/** Fixed bottom bar: summary on the left, 154×52 CTA on the right. */
export function SummaryBar({ title, sub, cta, onPress }: { title: string; sub: string; cta: string; onPress: () => void }) {
  const { bottom } = useInsets();
  return (
    <View style={[s.bar, { paddingBottom: bottom + 20 }]}>
      <View style={{ marginTop: 5 }}>
        <T b size={15}>{title}</T>
        <T size={11} color={C.muted} style={{ marginTop: 3 }}>{sub}</T>
      </View>
      <Button title={cta} style={{ width: 154, height: 52 }} onPress={onPress} />
    </View>
  );
}

export const card: ViewStyle ={ backgroundColor: C.white, borderWidth: 1, borderColor: C.border };

const s = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  side: { width: 88, minHeight: 40, justifyContent: "center" },
  title: { flex: 1, textAlign: "center" },
  btn: { borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tag: { backgroundColor: C.mintBg, paddingHorizontal: 10, justifyContent: "center" },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: "center" },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white },
  step: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  track: { width: 230, height: 6, borderRadius: 3, backgroundColor: C.border },
  progress: { height: 6, borderRadius: 3, backgroundColor: C.primary },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 15 },
});
