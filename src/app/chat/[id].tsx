// Pelanggan_10_Chat_ART (Figma 1:2818)
import { ComponentRef, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getArt } from "@/data/arts";
import { icons } from "@/icons";
import { C, F } from "@/theme";
import { Avatar, BackButton, IconButton, T, useInsets } from "@/ui";

type Msg = { me: boolean; text: string; at: string };
const QUICK = ["Oke, terima kasih!", "Saya sudah di rumah"];
const now = () => new Date().toTimeString().slice(0, 5).replace(":", ".");

export default function ChatArt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const art = getArt(id);
  const first = art.name.split(" ")[0];
  const { top, bottom } = useInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [draft, setDraft] = useState("");
  // shortcut: local-only conversation seeded with the design's messages; wire to a chat backend later.
  const [msgs, setMsgs] = useState<Msg[]>([
    { me: false, at: "08.12", text: `Selamat pagi Pak Piero, saya ${first}. Untuk Selasa jam 9 ya. Kuncinya di satpam?` },
    { me: true, at: "08.15", text: "Iya Mbak, kunci di satpam lobi. Tolong fokus di dapur & kamar mandi ya." },
    { me: false, at: "08.16", text: "Baik Pak. Kucingnya boleh di kamar dulu supaya tidak kabur saat pintu dibuka?" },
    { me: true, at: "08.20", text: "Boleh, nanti saya taruh di kamar belakang." },
  ]);
  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { me: true, text: t, at: now() }]);
    setDraft("");
    setTimeout(() => scroll.current?.scrollToEnd(), 50);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.top, { paddingTop: top + 7 }]}>
        <BackButton />
        <View style={{ marginLeft: 10 }}>
          <Avatar initials={art.initials} color={art.color} size={40} />
          <View style={s.online} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <T b size={15}>{art.name}</T>
          <T size={11} color={C.muted} style={{ marginTop: -1 }}>ART • order Sel, 20 Okt</T>
        </View>
        <IconButton label={`Telepon ${art.name}`} bg="transparent" style={{ marginRight: -6 }}>
          <icons.phone />
        </IconButton>
      </View>

      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={s.info}>
          <icons.shieldGold />
          <T size={10.5} color={C.muted} style={{ marginLeft: 10.4, flex: 1, lineHeight: 15 }}>
            Nomor telepon disembunyikan. Tetap chat & bayar di SwishClean agar terlindungi.
          </T>
        </View>
        <T size={11} color={C.faint} style={{ textAlign: "center", marginTop: 17 }}>Hari ini</T>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignItems: m.me ? "flex-end" : "flex-start", marginTop: i === 0 ? 12 : 7 }}>
            <View style={[s.bubble, m.me ? s.mine : s.theirs]}>
              <T size={13} color={m.me ? C.white : C.ink} style={{ lineHeight: 19 }}>{m.text}</T>
            </View>
            <T size={10} color={C.faint} style={{ marginTop: 3 }}>{m.at}</T>
          </View>
        ))}
      </ScrollView>

      <View style={s.quick}>
        {QUICK.map((q) => (
          <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={s.chip}>
            <T size={12}>{q}</T>
          </Pressable>
        ))}
      </View>
      <View style={[s.inputBar, { paddingBottom: bottom + 26 }]}>
        <IconButton label="Kirim foto" bg="transparent" style={{ marginLeft: -9 }}>
          <icons.camera />
        </IconButton>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Tulis pesan…"
          placeholderTextColor={C.faint}
          onSubmitEditing={() => send(draft)}
          returnKeyType="send"
          style={s.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Kirim" onPress={() => send(draft)} style={s.send}>
          <icons.send />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  online: { position: "absolute", right: -1, bottom: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: "#3CC47C", borderWidth: 2, borderColor: C.white },
  info: { flexDirection: "row", alignItems: "center", backgroundColor: C.yellowBg, borderRadius: 14, height: 50, marginHorizontal: 10, paddingLeft: 14.4, paddingRight: 12 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 11, maxWidth: 260 },
  theirs: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  mine: { backgroundColor: C.primary, maxWidth: 240 },
  quick: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  chip: { height: 33, borderRadius: 16.5, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, justifyContent: "center" },
  inputBar: { flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 11, paddingLeft: 22, paddingRight: 20 },
  input: { flex: 1, height: 46, borderRadius: 23, backgroundColor: C.bg, marginLeft: 3, paddingHorizontal: 20, fontFamily: F.reg, fontSize: 14, color: C.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginLeft: 3 },
});
