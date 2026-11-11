import { StyleSheet, View } from "react-native";
import { icons } from "../icons";
import { C } from "../theme";
import { T } from "../ui";

const LABELS = ["Data diri", "Foto KTP", "Foto wajah", "Selesai"];
// Dark variant (camera screens) uses its own palette from the design.
const DARK = { line: "#2a5058", bg: "#0a1e22" };

/** 4-step mitra sign-up progress. `step` is the 1-based current step. */
export function DaftarSteps({ step, dark }: { step: 1 | 2 | 3 | 4; dark?: boolean }) {
  const doneFill = dark ? C.yellow : C.navy;
  return (
    <View style={s.wrap} accessibilityLabel={`Langkah ${step} dari 4: ${LABELS[step - 1]}`}>
      <View style={[s.line, { backgroundColor: dark ? DARK.line : C.border }]} />
      <View style={[s.line, { backgroundColor: doneFill, width: (302 * (step - 1)) / 3 }]} />
      {LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step, current = n === step;
        const fill = done || current ? doneFill : dark ? DARK.bg : C.white;
        const Check = dark ? icons.stepCheckNavy : icons.stepCheckGold;
        return (
          <View key={label} style={s.col}>
            <View style={[s.dot, { backgroundColor: fill }, !(done || current) && { borderWidth: 1.5, borderColor: dark ? DARK.line : C.faint }]}>
              {done ? <Check /> : (
                <T b size={11} color={current ? (dark ? C.navy : C.yellow) : dark ? C.greet : C.muted}>{String(n)}</T>
              )}
            </View>
            <T size={10} b={current} color={current ? (dark ? C.white : C.ink) : dark ? C.greet : C.faint} style={{ marginTop: 9, lineHeight: 15 }}>
              {label}
            </T>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  // dot centers land at x=44 / 144.7 / 245.3 / 346 like the frame
  wrap: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: -5 },
  line: { position: "absolute", left: 29, top: 10, width: 302, height: 2 },
  col: { width: 58, alignItems: "center" },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
