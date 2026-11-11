// App_02_Daftar_Mitra_4_Verifikasi (Figma 22:69)
import { Fragment, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DaftarSteps } from "@/components/DaftarSteps";
import { pickImages } from "@/data/media";
import { setState, showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, T, TopBar, card, useInsets } from "@/ui";

const items = (skck: "wajib" | "review", hasKtp: boolean, hasFace: boolean): { title: string; sub: string; dot: ReactNode; action?: string }[] => {
  const done = <View style={[s.dot, { backgroundColor: C.primary }]}><icons.checkWhite /></View>;
  return [
  { title: "Data diri", sub: "Lengkap", dot: done },
  { title: "Foto KTP", sub: hasKtp ? "Terunggah • sedang dicek" : "Terbaca jelas • NIK cocok", dot: done },
  { title: "Foto wajah + KTP", sub: hasFace ? "Terunggah • sedang dicek" : "Wajah cocok dengan KTP", dot: done },
  skck === "review"
    ? { title: "SKCK", sub: "Terunggah • menunggu review", dot: <View style={[s.dot, s.pending]}><icons.docGold /></View> }
    : { title: "SKCK", sub: "Unggah dalam 14 hari", dot: <View style={[s.dot, s.pending]}><icons.docGold /></View>, action: "Unggah" },
  { title: "Wawancara & pelatihan online", sub: "Sab, 24 Okt • 10.00", dot: <View style={[s.dot, s.todo]}><icons.calendarMuted /></View> },
  ];
};

export default function Verifikasi() {
  const { bottom } = useInsets();
  const skck = useStore((s) => s.skck);
  const signup = useStore((s) => s.signup);
  const uploadSkck = async () => {
    const [uri] = await pickImages();
    if (!uri) return;
    setState({ skck: "review" });
    showToast("SKCK terunggah. Review maks. 1×24 jam.");
  };
  const masuk = () => {
    setState({ role: "mitra" });
    if (router.canDismiss()) router.dismissAll();
    router.replace("/mitra");
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Status pendaftaran" back={false} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 17, paddingBottom: bottom + 24 }} showsVerticalScrollIndicator={false}>
        <DaftarSteps step={4} />

        <View style={s.status}>
          <View style={s.statusIcon}><icons.clockGoldLg /></View>
          <View style={{ marginLeft: 12 }}>
            <T b size={16} color={C.white}>Sedang diverifikasi</T>
            <T size={12} color={C.greet} style={{ marginTop: 2 }}>Biasanya selesai dalam 1×24 jam</T>
          </View>
        </View>

        <View style={s.list}>
          {items(skck, !!signup.ktp, !!signup.face).map((it, i) => (
            <Fragment key={it.title}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.item}>
                {it.dot}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T b size={13}>{it.title}</T>
                  <T size={11} color={C.muted}>{it.sub}</T>
                </View>
                {it.action && <Button title={it.action} size={11} color={C.yellow} textColor={C.navy} style={{ width: 72, height: 28 }} onPress={uploadSkck} />}
              </View>
            </Fragment>
          ))}
        </View>

        <View style={s.privacy}>
          <icons.shieldPrimary style={{ marginTop: 1 }} />
          <T size={11} color={C.primaryDark} style={{ flex: 1, marginLeft: 12, lineHeight: 16 }}>
            Foto KTP & wajah dienkripsi dan hanya dipakai untuk verifikasi identitas, sesuai UU Pelindungan Data Pribadi.
          </T>
        </View>

        <Button title="Masuk ke Beranda Mitra" size={16} color={C.navy} style={{ height: 56, marginTop: 28 }} onPress={masuk} />
        <T size={12} color={C.muted} style={{ textAlign: "center", marginTop: 22 }}>Order baru aktif setelah verifikasi selesai</T>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  status: { flexDirection: "row", alignItems: "center", height: 96, borderRadius: 20, backgroundColor: C.navy, marginTop: 23, paddingLeft: 20 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.navy2, alignItems: "center", justifyContent: "center" },
  list: { ...card, borderRadius: 20, marginTop: 14, paddingLeft: 14, paddingRight: 16, paddingTop: 15, paddingBottom: 12 },
  item: { flexDirection: "row", alignItems: "flex-start", minHeight: 40 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 36, marginTop: 4, marginBottom: 11 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  pending: { backgroundColor: C.yellowBg, borderWidth: 1.5, borderColor: C.yellow },
  todo: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.faint },
  privacy: { flexDirection: "row", alignItems: "flex-start", minHeight: 74, borderRadius: 16, backgroundColor: C.mintBg, marginTop: 10, paddingLeft: 18, paddingRight: 14, paddingTop: 17 },
});
