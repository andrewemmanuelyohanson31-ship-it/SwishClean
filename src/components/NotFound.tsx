import { View } from "react-native";
import { router } from "expo-router";
import { C } from "../theme";
import { Button, Empty, TopBar } from "../ui";

/** Shared "page/ART not found" screen (unknown links, deleted ARTs). */
export function NotFound({ title = "Tidak ditemukan", text = "Halaman ini tidak ada atau sudah dihapus." }: { title?: string; text?: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title={title} />
      <View style={{ padding: 20 }}>
        <Empty text={text} />
        <Button title="Ke beranda" style={{ height: 52, marginTop: 16 }} onPress={() => router.replace("/")} />
      </View>
    </View>
  );
}
