// Semua ulasan ART (no Figma frame — reuses the Profil ART rating summary + review cards)
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ReviewCard, Stars } from "@/components/ReviewCard";
import { getArt } from "@/data/arts";
import { BREAKDOWN, REVIEWS } from "@/data/reviews";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Chip, Empty, T, TopBar, card } from "@/ui";

const FILTERS = [{ v: 0, label: "Semua" }, { v: 5, label: "5 ★" }, { v: 4, label: "4 ★" }, { v: 3, label: "≤ 3 ★" }];

export default function UlasanArt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const art = getArt(id);
  const [only, setOnly] = useState(0);
  const list = REVIEWS.filter((r) => !only || (only === 3 ? r.stars <= 3 : r.stars === only));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Rating & Ulasan" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={s.summary}>
          <View>
            <T b size={38} color={C.navy} style={{ lineHeight: 51 }}>{String(art.rating)}</T>
            <Stars n={5} Icon={icons.starMd} gap={3.33} />
            <T size={11} color={C.muted} style={{ marginTop: 8 }}>{`${art.reviews} ulasan`}</T>
          </View>
          <View style={{ flex: 1, marginLeft: 26, gap: 1 }}>
            {BREAKDOWN.map((r) => (
              <View key={r.star} style={s.barRow}>
                <T size={11} color={C.muted} style={{ width: 14 }}>{r.star}</T>
                <View style={s.track}><View style={[s.fill, { width: r.w }]} /></View>
                <T size={11} color={C.muted} style={{ flex: 1, textAlign: "right" }}>{r.n}</T>
              </View>
            ))}
          </View>
        </View>
        <View style={s.chips}>{FILTERS.map((f) => <Chip key={f.label} label={f.label} on={only === f.v} onPress={() => setOnly(f.v)} />)}</View>
        <View style={{ gap: 12, marginTop: 12 }}>
          {list.map((r) => <ReviewCard key={r.name} r={r} />)}
          {list.length === 0 && <Empty text="Belum ada ulasan dengan rating ini." />}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  summary: { ...card, flexDirection: "row", borderRadius: 16, height: 112, paddingHorizontal: 20, paddingTop: 16 },
  barRow: { flexDirection: "row", alignItems: "center", height: 17 },
  track: { width: 176, height: 6, borderRadius: 3, backgroundColor: C.bg, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.yellow },
  chips: { flexDirection: "row", gap: 8, marginTop: 14 },
});
