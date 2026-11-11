// Mitra_05_Chat_Pelanggan (Figma 1:3711) — same chat as the customer side, roles flipped.
import { useLocalSearchParams } from "expo-router";
import { ChatScreen } from "@/components/ChatScreen";
import { getJob } from "@/data/mitra";
import { C } from "@/theme";

export default function ChatPelanggan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);
  return (
    <ChatScreen
      name={job.customer}
      initials={job.initials}
      color={job.color}
      sub={`Pelanggan • ${job.when}`}
      accent={C.navy}
      quick={["Saya sudah sampai", "Otw 10 menit"]}
      initial={[
        { me: true, at: "08.12", text: "Selamat pagi Pak Piero, saya Siti. Untuk Selasa jam 9 ya. Kuncinya di satpam?" },
        { me: false, at: "08.15", text: "Iya Mbak, kunci di satpam lobi. Tolong fokus di dapur & kamar mandi ya." },
        { me: true, at: "08.16", text: "Baik Pak. Kucingnya boleh di kamar dulu supaya tidak kabur saat pintu dibuka?" },
        { me: false, at: "08.20", text: "Boleh, nanti saya taruh di kamar belakang." },
      ]}
    />
  );
}
