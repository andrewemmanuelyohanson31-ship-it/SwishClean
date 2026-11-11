// Pelanggan_03_Cari_ART (Figma 1:1974)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArtCard } from "@/components/ArtCard";
import { BottomNav } from "@/components/BottomNav";
import { arts } from "@/data/arts";
import { icons } from "@/icons";
import { C, F } from "@/theme";
import { IconButton, T, TopBar } from "@/ui";

const chips = ["Bersih Rutin", "Ramah Hewan", "4.5+"];

export default function Cari() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ? `Bersih ${q.toLowerCase()}, Alam Sutera` : "Bersih rutin, Alam Sutera");
  const [on, setOn] = useState<string[]>(["Bersih Rutin", "Ramah Hewan"]);
  const toggle = (c: string) => setOn((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Cari ART"
        right={
          <IconButton label="Filter" bg="transparent" style={{ marginRight: -12 }}>
            <icons.filter />
          </IconButton>
        }
      />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.search}>
          <icons.search />
          <TextInput value={query} onChangeText={setQuery} style={s.input} accessibilityLabel="Cari ART" returnKeyType="search" />
        </View>
        <View style={s.chips}>
          {chips.map((c) => {
            const active = on.includes(c);
            return (
              <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => toggle(c)} style={[s.chip, active ? s.chipOn : s.chipOff]}>
                <T size={12} color={active ? C.white : C.ink}>{c}</T>
              </Pressable>
            );
          })}
        </View>
        <View style={s.meta}>
          <T size={13} color={C.muted}>48 ART tersedia</T>
          <T size={13} color={C.primary}>Rating tertinggi</T>
        </View>
        <View style={{ gap: 12, marginTop: 6 }}>
          {arts.map((a) => <ArtCard key={a.id} art={a} />)}
        </View>
      </ScrollView>
      <BottomNav active="cari" />
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: 16 },
  search: { height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, flexDirection: "row", alignItems: "center", paddingLeft: 16.2 },
  input: { flex: 1, marginLeft: 11.5, fontFamily: F.reg, fontSize: 14, color: C.ink, paddingVertical: 0, outlineStyle: "none" } as object,
  chips: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: { height: 32, borderRadius: 16, paddingHorizontal: 14, justifyContent: "center" },
  chipOn: { backgroundColor: C.primary },
  chipOff: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, height: 33 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 13 },
});
