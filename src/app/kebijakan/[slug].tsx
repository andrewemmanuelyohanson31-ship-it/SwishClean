// Policy pages (no Figma frame — card list in the app's style). Copy lives in src/data/policies.ts.
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { POLICIES } from "@/data/policies";
import { C } from "@/theme";
import { Empty, T, TopBar, card } from "@/ui";

export default function Kebijakan() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const policy = POLICIES[slug ?? ""];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title={policy?.title ?? "Kebijakan"} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, gap: 10, paddingBottom: 30 }}>
        {!policy && <Empty text="Halaman kebijakan tidak ditemukan." />}
        {policy?.sections.map((sec) => (
          <View key={sec.h} style={s.card}>
            <T b size={14}>{sec.h}</T>
            <T size={13} color={C.muted} style={{ marginTop: 4, lineHeight: 20 }}>{sec.p}</T>
          </View>
        ))}
        {policy && <T size={11} color={C.faint} style={{ marginTop: 6 }}>Versi draf • berlaku 1 Okt 2026</T>}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...card, borderRadius: 16, padding: 15 },
});
