import { ComponentRef, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { icons } from "../icons";
import { C, F } from "../theme";
import { Avatar, BackButton, IconButton, T, useInsets } from "../ui";

export type Msg = { me: boolean; text: string; at: string };
const now = () => new Date().toTimeString().slice(0, 5).replace(":", ".");

/**
 * Chat layout shared by Pelanggan_10_Chat_ART (1:2818) and Mitra_05_Chat_Pelanggan (1:3711).
 * `accent` colours my bubbles + send button (teal for pelanggan, navy for mitra).
 * shortcut: local-only conversation; wire to a chat backend later.
 */
export function ChatScreen({ name, initials, color, sub, initial, quick, accent, mineMax = 260 }: {
  name: string; initials: string; color: string; sub: string; initial: Msg[]; quick: string[]; accent: string; mineMax?: number;
}) {
  const { top, bottom } = useInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState(initial);
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
          <Avatar initials={initials} color={color} size={40} />
          <View style={s.online} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <T b size={15}>{name}</T>
          <T size={11} color={C.muted} style={{ marginTop: -1 }}>{sub}</T>
        </View>
        <IconButton label={`Telepon ${name}`} bg="transparent" style={{ marginRight: -6 }}>
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
            <View style={[s.bubble, m.me ? { backgroundColor: accent, maxWidth: mineMax } : s.theirs]}>
              <T size={13} color={m.me ? C.white : C.ink} style={{ lineHeight: 19 }}>{m.text}</T>
            </View>
            <T size={10} color={C.faint} style={{ marginTop: 3 }}>{m.at}</T>
          </View>
        ))}
      </ScrollView>

      <View style={s.quick}>
        {quick.map((q) => (
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
        <Pressable accessibilityRole="button" accessibilityLabel="Kirim" onPress={() => send(draft)} style={[s.send, { backgroundColor: accent }]}>
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
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 11 },
  theirs: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, maxWidth: 260 },
  quick: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  chip: { height: 33, borderRadius: 16.5, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, justifyContent: "center" },
  inputBar: { flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 11, paddingLeft: 22, paddingRight: 20 },
  input: { flex: 1, height: 46, borderRadius: 23, backgroundColor: C.bg, marginLeft: 3, paddingHorizontal: 20, fontFamily: F.reg, fontSize: 14, color: C.ink, outlineStyle: "none" } as object,
  send: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginLeft: 3 },
});
