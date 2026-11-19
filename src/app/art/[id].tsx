// Pelanggan_04_Profil_ART (Figma 1:2157 + Bar_Order 1:2325)
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ReviewCard, Stars } from "@/components/ReviewCard";
import { NotFound } from "@/components/NotFound";
import { arts, rupiah } from "@/data/arts";
import { BREAKDOWN, useArtReviews } from "@/data/reviews";
import { toggleFavorite, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, BackButton, Button, IconButton, T, Tag, card, useInsets } from "@/ui";


export default function ProfilArt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = arts.find((a) => a.id === id);
  const art = found ?? arts[0]; // hooks below need an ART; the not-found screen is returned after them
  const { top, bottom } = useInsets();
  const fav = useStore((st) => st.favorites.includes(art.id));
  const { list: reviews, added } = useArtReviews(art.id);
  const firstName = art.name.split(" ")[0];
  const stats = [
    [String(art.rating), "Rating"],
    [art.jobs ? String(art.jobs) : "–", "Pekerjaan"],
    [`${art.years} thn`, "Pengalaman"],
    [art.onTime ? `${art.onTime}%` : "–", "Tepat waktu"],
  ];

  if (!found) return <NotFound title="ART tidak ditemukan" text="ART ini tidak ada atau sudah tidak aktif." />;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={[s.mint, { height: top + 163 }]} />
        <View style={[s.topBtns, { top: top + 5 }]}>
          <BackButton bg={C.white} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <IconButton label={`Chat ${art.name}`} bg={C.white} onPress={() => router.push(`/chat/${art.id}`)}>
              <icons.chat />
            </IconButton>
            <IconButton label={fav ? "Hapus dari favorit" : "Tambah ke favorit"} bg={C.white} onPress={() => toggleFavorite(art.id)}>
              {fav ? <icons.heartFilledLg /> : <icons.heartOutline />}
            </IconButton>
          </View>
        </View>

        {/* avatar ring overlaps the mint header: ring top sits at y=143 in the frame */}
        <View style={[s.ring, { marginTop: -67 }]}>
          <Avatar initials={art.initials} color={art.color} size={108} />
        </View>
        <T b size={22} style={{ textAlign: "center", marginTop: 11 }}>{art.name}</T>
        <View style={s.verified}>
          <icons.shield />
          <T size={12} color={C.primaryDark} style={{ marginLeft: 4.65 }}>Terverifikasi</T>
        </View>

        <View style={s.stats}>
          {stats.map(([v, l]) => (
            <View key={l} style={s.stat}>
              <T b size={16} color={C.navy}>{v}</T>
              <T size={10} color={C.muted} style={{ marginTop: 4 }}>{l}</T>
            </View>
          ))}
        </View>

        <View style={s.pad}>
          <T b size={16} style={{ marginTop: 22 }}>Tentang</T>
          <T size={13} color={C.muted} style={{ marginTop: 5, lineHeight: 21 }}>
            {art.about ?? `${art.name} belum menambahkan deskripsi.`}
          </T>
          <View style={s.tags}>
            {(art.skills ?? art.tags).map((t) => <Tag key={t} label={t} h={24} />)}
          </View>
          <View style={s.info}>
            <View style={[s.infoItem, { width: 161.3 }]}>
              <icons.globe style={{ marginLeft: 1.6 }} />
              <T size={12} color={C.muted} style={{ marginLeft: 6.4 }}>{art.languages ?? "Indonesia"}</T>
            </View>
            <View style={s.infoItem}>
              <icons.calendar />
              <T size={12} color={C.muted} style={{ marginLeft: 7.4 }}>{art.hours ?? "Sen–Sab, 07.00–16.00"}</T>
            </View>
          </View>

          <View style={s.jaminan}>
            <icons.swap style={{ marginTop: 1 }} />
            <View style={{ flex: 1, marginLeft: 12.8 }}>
              <T b size={13}>ART pengganti otomatis</T>
              <T size={11} color={C.muted} style={{ marginTop: 2, lineHeight: 16 }}>
                Jika {firstName} batal, kami tawarkan ART setara atau refund penuh.
              </T>
            </View>
          </View>

          <View style={s.rowBetween}>
            <T b size={16}>Rating & Ulasan</T>
            <T size={13} color={C.primary} style={{ marginTop: 3 }} accessibilityRole="link" onPress={() => router.push(`/ulasan-art/${art.id}`)}>Lihat semua</T>
          </View>
          <View style={s.summary}>
            <View>
              <T b size={38} color={C.navy} style={{ lineHeight: 51 }}>{String(art.rating)}</T>
              <Stars n={5} Icon={icons.starMd} gap={3.33} />
              <T size={11} color={C.muted} style={{ marginTop: 8 }}>{art.reviews + added} ulasan</T>
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

          {reviews.slice(0, 3).map((r, i) => (
            <View key={i} style={{ marginTop: 12 }}><ReviewCard r={r} /></View>
          ))}
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: bottom + 12 }]}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <T b size={20} color={C.navy}>{rupiah(art.pricePerHour)}</T>
            <T size={12} color={C.muted} style={{ marginLeft: 3, marginBottom: 2 }}>/jam</T>
          </View>
          <T size={11} color={C.muted} style={{ marginTop: -1 }}>min. 2 jam</T>
        </View>
        <Button title="Order Sekarang" style={{ width: 184, height: 52 }} onPress={() => router.push({ pathname: "/jadwal", params: { art: art.id } })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  mint: { backgroundColor: C.mintBg },
  topBtns: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  ring: { alignSelf: "center", width: 114, height: 114, borderRadius: 57, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  verified: { alignSelf: "center", flexDirection: "row", alignItems: "center", height: 22, borderRadius: 11, backgroundColor: C.mintBg, paddingLeft: 8.6, paddingRight: 9.6, marginTop: 1 },
  stats: { flexDirection: "row", gap: 7, paddingHorizontal: 20, marginTop: 18 },
  stat: { ...card, flex: 1, height: 64, borderRadius: 14, alignItems: "center", paddingTop: 11 },
  pad: { paddingHorizontal: 20 },
  tags: { flexDirection: "row", gap: 6, marginTop: 6 },
  info: { flexDirection: "row", marginTop: 15 },
  infoItem: { flexDirection: "row", alignItems: "center" },
  jaminan: { flexDirection: "row", backgroundColor: C.yellowBg, borderRadius: 16, marginTop: 17, paddingLeft: 16.5, paddingRight: 16, paddingTop: 15.6, height: 70 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  rowBetween0: { flexDirection: "row", justifyContent: "space-between" },
  summary: { ...card, flexDirection: "row", borderRadius: 16, height: 112, marginTop: 8, marginBottom: 4, paddingLeft: 20, paddingRight: 20, paddingTop: 16 },
  barRow: { flexDirection: "row", alignItems: "center", height: 17 },
  track: { width: 176, height: 6, borderRadius: 3, backgroundColor: C.bg, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.yellow },
  review: { ...card, borderRadius: 16, height: 112, marginTop: 12,paddingHorizontal: 15, paddingTop: 13 },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 13 },
});
