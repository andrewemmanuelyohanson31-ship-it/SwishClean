import { FC } from "react";
import { StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import type { Review } from "../data/reviews";
import { icons } from "../icons";
import { C } from "../theme";
import { Avatar, T, card } from "../ui";

export function Stars({ n, Icon, gap }: { n: number; Icon: FC<SvgProps>; gap: number }) {
  return (
    <View style={{ flexDirection: "row", gap, alignItems: "center" }} accessibilityLabel={`${n} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (i <= n ? <Icon key={i} /> : <icons.starSmOutline key={i} style={{ margin: -0.37 }} />))}
    </View>
  );
}

/** 350×112 review card (Profil ART, Figma 1:2268). */
export function ReviewCard({ r }: { r: Review }) {
  return (
    <View style={s.review}>
      <View style={{ flexDirection: "row" }}>
        <Avatar initials={r.initials} color={r.color} size={36} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <View style={s.between}>
            <T b size={13}>{r.name}</T>
            <T size={11} color={C.faint}>{r.when}</T>
          </View>
          <Stars n={r.stars} Icon={icons.starSm} gap={2.83} />
        </View>
      </View>
      <T size={12} style={{ marginTop: 9, lineHeight: 19 }}>{r.text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  review: { ...card, borderRadius: 16, minHeight: 112, paddingHorizontal: 15, paddingTop: 13, paddingBottom: 12 },
  between: { flexDirection: "row", justifyContent: "space-between" },
});
