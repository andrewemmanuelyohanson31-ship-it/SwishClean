// Chat CS 24 jam (no Figma frame — same ChatScreen as Chat ART)
import { ChatScreen } from "@/components/ChatScreen";
import { useStore } from "@/data/store";
import { C } from "@/theme";

export default function ChatCS() {
  const role = useStore((s) => s.role);
  return (
    <ChatScreen
      thread="cs"
      name="CS SwishClean"
      initials="CS"
      color={C.mintBg}
      sub="Online 24 jam • biasanya membalas < 2 menit"
      accent={role === "mitra" ? C.navy : C.primary}
      quick={role === "mitra" ? ["Kendala tarik dana", "Lapor pelanggan"] : ["ART belum datang", "Ubah jadwal"]}
      initial={[{ me: false, at: "Baru saja", text: "Halo! Ada yang bisa kami bantu? Ceritakan kendalamu, tim CS siap membantu 24 jam." }]}
      autoReply="Terima kasih, pesanmu sudah kami terima. Agen CS akan membalas dalam beberapa menit."
    />
  );
}
