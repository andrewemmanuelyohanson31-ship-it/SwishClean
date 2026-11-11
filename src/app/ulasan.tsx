// Pelanggan_11_Beri_Ulasan (Figma 1:2893)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getArt } from "@/data/arts";
import { icons } from "@/icons";
import { C, F } from "@/theme";
import { Avatar, Button, T, TopBar, card, useInsets } from "@/ui";

const LABELS = ["Sangat kecewa", "Kecewa", "Cukup", "Puas", "Sangat puas!"];
const LIKES = ["Rapi & bersih", "Tepat waktu", "Ramah", "Sopan", "Cepat", "Bawa alat"];
const MAX = 500;

function Chips({ items, on, toggle }: { items: string[]; on: string[]; toggle: (s: string) => void }) {
  return (
    <View style={s.chips}>
      {items.map((c) => {
        const active = on.includes(c);
        return (
          <Pressable key={c} accessibilityRole="checkbox" accessibilityState={{ checked: active }} onPress={() => toggle(c)} style={[s.chip, active ? s.chipOn : s.chipOff]}>
            <T size={12} color={active ? C.white : C.ink}>{c}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BeriUlasan() {
  const { art: id } = useLocalSearchParams<{ art?: string }>();
  const art = getArt(id);
  const { bottom } = useInsets();
  const [stars, setStars] = useState(5);
  const [likes, setLikes] = useState(["Rapi & bersih", "Tepat waktu", "Sopan"]);
  const [text, setText] = useState("Kerjanya rapi banget, dapur sampai kinclong. Kucing saya juga anteng. Mau langganan tiap Selasa!");
  const toggle = (c: string) => setLikes((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Beri ulasan" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 15, paddingBottom: 110 + bottom }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.artCard}>
          <Avatar initials={art.initials} color={art.color} size={44} />
          <View style={{ marginLeft: 12 }}>
            <T b size={15}>{art.name}</T>
            <T size={11} color={C.muted} style={{ marginTop: -1 }}>Selesai • Sel, 13 Okt, 13.05</T>
          </View>
        </View>

        <T b size={17} style={{ textAlign: "center", marginTop: 26 }}>Bagaimana hasil kerjanya?</T>
        <View style={s.stars} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: 5, now: stars }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} accessibilityLabel={`${i} bintang`} onPress={() => setStars(i)} hitSlop={6}>
              <icons.starLg style={{ opacity: i <= stars ? 1 : 0.25 }} />
            </Pressable>
          ))}
        </View>
        <T b size={14} color={C.primary} style={{ textAlign: "center", marginTop: 23 }}>{LABELS[stars - 1]}</T>

        <T b size={14} style={{ marginTop: 21 }}>Yang kamu suka</T>
        <View style={{ marginTop: 7 }}>
          <Chips items={LIKES} on={likes} toggle={toggle} />
        </View>

        <T b size={14} style={{ marginTop: 26 }}>Komentar</T>
        <View style={s.box}>
          <TextInput value={text} onChangeText={setText} maxLength={MAX} multiline style={s.input} accessibilityLabel="Komentar" />
          <T size={11} color={C.faint} style={{ textAlign: "right" }}>{`${text.length}/${MAX}`}</T>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Tambah foto hasil" style={s.photo}>
            <icons.camera />
          </Pressable>
          <View style={{ marginLeft: 12 }}>
            <T size={13}>Tambah foto hasil</T>
            <T size={11} color={C.muted} style={{ marginTop: -1 }}>opsional, maks. 3 foto</T>
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottom, { paddingBottom: bottom + 2 }]}>
        <Button title="Kirim Ulasan" style={{ height: 56 }} onPress={() => router.back()} />
        <T size={12} color={C.red} style={{ textAlign: "center", marginTop: 6 }} accessibilityRole="link" onPress={() => router.replace({ pathname: "/komplain", params: { art: art.id } })}>
          Ada masalah? Ajukan komplain
        </T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  artCard: { ...card, flexDirection: "row", alignItems: "center", height: 80, borderRadius: 20, paddingLeft: 13 },
  stars: { flexDirection: "row", justifyContent: "center", gap: 17.3, marginTop: 7 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { height: 34, borderRadius: 17, paddingHorizontal: 14, justifyContent: "center" },
  chipOn: { backgroundColor: C.primary },
  chipOff: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, height: 35 },
  box: { height: 120, borderRadius: 16, borderWidth: 1.5, borderColor: C.primary, backgroundColor: C.white, marginTop: 8, paddingHorizontal: 15, paddingTop: 11, paddingBottom: 6 },
  input: { flex: 1, fontFamily: F.reg, fontSize: 13, lineHeight: 21, color: C.ink, textAlignVertical: "top", padding: 0 },
  photo: { width: 80, height: 70, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", borderColor: C.faint, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  bottom: { position: "absolute", left: 20, right: 20, bottom: 0 },
});
