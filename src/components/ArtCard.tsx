import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Art, km, rupiah } from "../data/arts";
import { toggleFavorite, useStore } from "../data/store";
import { icons } from "../icons";
import { C } from "../theme";
import { Avatar, Button, T, Tag, card } from "../ui";

/** 350×132 ART card used on Beranda and Cari ART. */
export function ArtCard({ art }: { art: Art }) {
  const fav = useStore((s) => s.favorites.includes(art.id));
  const setFav = () => toggleFavorite(art.id);
  const Heart = fav ? icons.heartFilled : icons.heartOutline;
  return (
    <View style={s.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Profil ${art.name}`} onPress={() => router.push(`/art/${art.id}`)} style={s.top}>
        <Avatar initials={art.initials} color={art.color} size={52} />
        <View style={{ marginLeft: 12, marginTop: 5 }}>
          <T b size={15}>{art.name}</T>
          <View style={s.meta}>
            <icons.star />
            <T size={12} color={C.muted} style={{ marginLeft: 5 }}>
              {`${art.rating} (${art.reviews}) • ${art.years} thn • ${km(art.distanceKm)} km`}
            </T>
          </View>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={fav ? "Hapus dari favorit" : "Tambah ke favorit"} hitSlop={10} onPress={setFav} style={[s.heart, !fav && s.heartOutline]}>
        <Heart />
      </Pressable>
      <View style={s.tags}>
        {art.tags.map((t) => <Tag key={t} label={t} />)}
      </View>
      <View style={s.price}>
        <T b size={15} color={C.navy}>{rupiah(art.pricePerHour)}</T>
        <T size={11} color={C.muted} style={{ marginLeft: 2.5 }}>/jam</T>
      </View>
      <Button title="Order" size={12} style={s.order} onPress={() => router.push({ pathname: "/jadwal", params: { art: art.id } })} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...card, height: 132, borderRadius: 20 },
  top: { flexDirection: "row", position: "absolute", left: 15, top: 15, right: 50 },
  meta: { flexDirection: "row", alignItems: "center", marginLeft: 1 },
  heart: { position: "absolute", right: 17, top: 21 },
  heartOutline: { right: 16, top: 20 },
  tags: { position: "absolute", left: 15, top: 75, flexDirection: "row", gap: 6 },
  price: { position: "absolute", left: 15, top: 105, flexDirection: "row", alignItems: "flex-end" },
  order: { position: "absolute", right: 15, top: 91, width: 76, height: 30 },
});
