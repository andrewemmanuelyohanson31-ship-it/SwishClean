// Pelanggan_10_Chat_ART (Figma 1:2818)
import { useLocalSearchParams } from "expo-router";
import { ChatScreen } from "@/components/ChatScreen";
import { getArt } from "@/data/arts";
import { C } from "@/theme";

export default function ChatArt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const art = getArt(id);
  const first = art.name.split(" ")[0];
  return (
    <ChatScreen
      name={art.name}
      initials={art.initials}
      color={art.color}
      sub="ART • order Sel, 20 Okt"
      accent={C.primary}
      mineMax={240}
      quick={["Oke, terima kasih!", "Saya sudah di rumah"]}
      initial={[
        { me: false, at: "08.12", text: `Selamat pagi Pak Piero, saya ${first}. Untuk Selasa jam 9 ya. Kuncinya di satpam?` },
        { me: true, at: "08.15", text: "Iya Mbak, kunci di satpam lobi. Tolong fokus di dapur & kamar mandi ya." },
        { me: false, at: "08.16", text: "Baik Pak. Kucingnya boleh di kamar dulu supaya tidak kabur saat pintu dibuka?" },
        { me: true, at: "08.20", text: "Boleh, nanti saya taruh di kamar belakang." },
      ]}
    />
  );
}
