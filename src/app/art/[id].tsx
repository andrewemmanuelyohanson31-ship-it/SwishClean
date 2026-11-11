// Pelanggan_04_Profil_ART (Figma 1:2157 + Bar_Order 1:2325)
import { FC, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { getArt, rupiah } from "@/data/arts";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, BackButton, Button, IconButton, T, Tag, card, useInsets } from "@/ui";

// shortcut: sample reviews/breakdown from the design are shown for every ART; replace with real review data when the backend exists.
const breakdown = [
  { star: 5, n: 112, w: 176 },
  { star: 4, n: 12, w: 18.86 },
  { star: 3, n: 3, w: 4.71 },
  { star: 2, n: 1, w: 1.57 },
  { star: 1, n: 0, w: 0 },
];
const reviews = [
  { name: "Maya P.", initials: "MP", color: "#CFD8F6", stars: 5, when: "2 hari lalu", text: "Rapi banget, dapur sampai kinclong. Kucing saya juga anteng. Sudah langganan tiap Sabtu." },
  { name: "Andre W.", initials: "AW", color: "#F5C1C9", stars: 5, when: "1 minggu lalu", text: "Datang tepat waktu dan bawa alat sendiri. Kamar mandi berkerak jadi bersih lagi!" },
  { name: "Lina K.", initials: "LK", color: "#D4EBC4", stars: 4, when: "2 minggu lalu", text: "Hasilnya bagus, cuma lewat 15 menit dari estimasi. Komunikasinya sopan." },
];

function Stars({ n, Icon, gap }: { n: number; Icon: FC<SvgProps>; gap: number }) {
  return (
    <View style={{ flexDirection: "row", gap, alignItems: "center" }} accessibilityLabel={`${n} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (i <= n ? <Icon key={i} /> : <icons.starSmOutline key={i} style={{ margin: -0.37 }} />))}
    </View>
  );
}

export default function ProfilArt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const art = getArt(id);
  const { top, bottom } = useInsets();
  const [fav, setFav] = useState(!!art.favorite);
  const firstName = art.name.split(" ")[0];
  const stats = [
    [String(art.rating), "Rating"],
    [art.jobs ? String(art.jobs) : "–", "Pekerjaan"],
    [`${art.years} thn`, "Pengalaman"],
    [art.onTime ? `${art.onTime}%` : "–", "Tepat waktu"],
  ];

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
            <IconButton label={fav ? "Hapus dari favorit" : "Tambah ke favorit"} bg={C.white} onPress={() => setFav(!fav)}>
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
            <T size={13} color={C.primary} style={{ marginTop: 3 }}>Lihat semua</T>
          </View>
          <View style={s.summary}>
            <View>
              <T b size={38} color={C.navy} style={{ lineHeight: 51 }}>{String(art.rating)}</T>
              <Stars n={5} Icon={icons.starMd} gap={3.33} />
              <T size={11} color={C.muted} style={{ marginTop: 8 }}>{art.reviews} ulasan</T>
            </View>
            <View style={{ flex: 1, marginLeft: 26, gap: 1 }}>
              {breakdown.map((r) => (
                <View key={r.star} style={s.barRow}>
                  <T size={11} color={C.muted} style={{ width: 14 }}>{r.star}</T>
                  <View style={s.track}><View style={[s.fill, { width: r.w }]} /></View>
                  <T size={11} color={C.muted} style={{ flex: 1, textAlign: "right" }}>{r.n}</T>
                </View>
              ))}
            </View>
          </View>

          {reviews.map((r) => (
            <View key={r.name} style={s.review}>
              <View style={{ flexDirection: "row" }}>
                <Avatar initials={r.initials} color={r.color} size={36} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={s.rowBetween0}>
                    <T b size={13}>{r.name}</T>
                    <T size={11} color={C.faint}>{r.when}</T>
                  </View>
                  <Stars n={r.stars} Icon={icons.starSm} gap={2.83} />
                </View>
              </View>
              <T size={12} style={{ marginTop: 9, lineHeight: 19 }}>{r.text}</T>
            </View>
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
