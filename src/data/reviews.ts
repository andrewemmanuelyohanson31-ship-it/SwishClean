// shortcut: the design's sample reviews/breakdown are shown for every ART below the real ones; drop them once real reviews pile up.
import { useEffect, useState } from "react";
import { loadReviews } from "./remote";
import { useStore } from "./store";

export type Review = { name: string; initials: string; color: string; stars: number; when: string; text: string };

export const BREAKDOWN = [
  { star: 5, n: 112, w: 176 },
  { star: 4, n: 12, w: 18.86 },
  { star: 3, n: 3, w: 4.71 },
  { star: 2, n: 1, w: 1.57 },
  { star: 1, n: 0, w: 0 },
];

export const REVIEWS: Review[] = [
  { name: "Maya P.", initials: "MP", color: "#CFD8F6", stars: 5, when: "2 hari lalu", text: "Rapi banget, dapur sampai kinclong. Kucing saya juga anteng. Sudah langganan tiap Sabtu." },
  { name: "Andre W.", initials: "AW", color: "#F5C1C9", stars: 5, when: "1 minggu lalu", text: "Datang tepat waktu dan bawa alat sendiri. Kamar mandi berkerak jadi bersih lagi!" },
  { name: "Lina K.", initials: "LK", color: "#D4EBC4", stars: 4, when: "2 minggu lalu", text: "Hasilnya bagus, cuma lewat 15 menit dari estimasi. Komunikasinya sopan." },
  { name: "Rudi H.", initials: "RH", color: "#F8D98F", stars: 5, when: "3 minggu lalu", text: "Setrikaan rapi dan dilipat sesuai lemari. Pasti order lagi." },
  { name: "Sinta A.", initials: "SA", color: "#BFE3DC", stars: 5, when: "1 bulan lalu", text: "Ramah dan teliti. Sudut-sudut yang biasanya terlewat juga dibersihkan." },
  { name: "Bayu T.", initials: "BT", color: "#E7ECFB", stars: 3, when: "1 bulan lalu", text: "Bersih, tapi datang 20 menit terlambat karena hujan. Sudah kabari sebelumnya." },
];

/** Reviews for one ART: server reviews (live) or this device's own reviews (demo), then the sample ones. */
export function useArtReviews(artId: string) {
  const live = useStore((s) => s.live);
  const mine = useStore((s) => s.myReviews);
  const me = useStore((s) => s.profile.name);
  const [server, setServer] = useState<Review[]>([]);
  useEffect(() => {
    let on = true;
    loadReviews(artId).then((rows) => on && setServer(rows.map((r) => ({ name: "Pelanggan", initials: "P", color: "#DDF5F1", stars: r.stars, when: r.at, text: r.text }))));
    return () => { on = false; };
  }, [artId]);
  const own: Review[] = live ? [] : mine.filter((r) => r.artId === artId).map((r) => ({
    name: me || "Kamu", initials: (me || "K").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), color: "#CFD8F6",
    stars: r.stars, when: "Baru saja", text: [r.likes.join(", "), r.text].filter(Boolean).join(" — "),
  }));
  const real = [...own, ...server];
  return { list: [...real, ...REVIEWS], added: real.length };
}
