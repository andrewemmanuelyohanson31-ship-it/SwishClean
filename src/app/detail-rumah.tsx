// Pelanggan_06_Detail_Rumah_Add_On (Figma 1:2439)
import { FC, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { SvgProps } from "react-native-svg";
import { getArt, rupiah } from "@/data/arts";
import { ADDONS, AddonId, BASE_HOURS, hoursLabel, quote } from "@/data/order";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Steps, SummaryBar, T, Toggle, TopBar, card, useInsets } from "@/ui";

const addonIcon: Record<AddonId, FC<SvgProps>> = { setrika: icons.shirtSm, kulkas: icons.fridge, jendela: icons.windowIcon };
const addonMeta = (minutes: number, price: number) => `+${minutes >= 60 ? `${minutes / 60} jam` : `${minutes} mnt`} • +${rupiah(price)}`;

function Stepper({ value, onChange, min = 0, label }: { value: number; onChange: (n: number) => void; min?: number; label: string }) {
  return (
    <View style={s.box}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Kurangi ${label}`} hitSlop={8} onPress={() => onChange(Math.max(min, value - 1))} style={s.stepBtn}>
        <icons.minus />
      </Pressable>
      <T b size={15} style={{ flex: 1, textAlign: "center" }} accessibilityLabel={`${label} ${value}`}>{String(value)}</T>
      <Pressable accessibilityRole="button" accessibilityLabel={`Tambah ${label}`} hitSlop={8} onPress={() => onChange(value + 1)} style={s.stepBtn}>
        <icons.plus />
      </Pressable>
    </View>
  );
}

export default function DetailRumah() {
  const params = useLocalSearchParams<{ art?: string; day?: string; time?: string }>();
  const art = getArt(params.art);
  const { bottom } = useInsets();
  const [bed, setBed] = useState(2);
  const [bath, setBath] = useState(1);
  const [pets, setPets] = useState(true);
  const [addons, setAddons] = useState<string[]>(["setrika"]);
  const q = quote(art.pricePerHour, addons);
  const toggle = (id: string) => setAddons((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Detail rumah" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 130 + bottom }} showsVerticalScrollIndicator={false}>
        <Steps n={2} />
        <View style={s.form}>
          <T size={12} color={C.muted}>Alamat</T>
          <Pressable accessibilityRole="button" accessibilityLabel="Ubah alamat" style={s.addr}>
            <icons.pinPrimary style={{ marginLeft: 2.7 }} />
            <T size={14} style={{ flex: 1, marginLeft: 8.8 }}>Jl. Jalur Sutera Barat No. 12</T>
            <icons.chevRightSm style={{ marginRight: 13.3 }} />
          </Pressable>
          <View style={[s.divider, { marginTop: 10 }]} />

          <View style={[s.row, { marginTop: 14 }]}>
            <T size={14}>Luas rumah</T>
            <Pressable accessibilityRole="button" accessibilityLabel="Luas rumah 70 m²" style={[s.box, { paddingLeft: 15.25, paddingRight: 24.3 }]}>
              <T size={14} style={{ flex: 1 }}>70 m²</T>
              <icons.chevDownSm />
            </Pressable>
          </View>
          <View style={[s.row, { marginTop: 12 }]}>
            <T size={14}>Kamar tidur</T>
            <Stepper label="kamar tidur" value={bed} onChange={setBed} />
          </View>
          <View style={[s.row, { marginTop: 12 }]}>
            <T size={14}>Kamar mandi</T>
            <Stepper label="kamar mandi" value={bath} onChange={setBath} />
          </View>
          <View style={[s.divider, { marginTop: 10 }]} />

          <View style={[s.row, { marginTop: 6 }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <icons.paw style={{ marginLeft: 3.7 }} />
              <T size={14} style={{ marginLeft: 9.8 }}>Ada hewan peliharaan</T>
            </View>
            <Toggle value={pets} onChange={setPets} label="Ada hewan peliharaan" />
          </View>
        </View>

        <View style={s.est}>
          <icons.clockLg />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T b size={15} color={C.primaryDark}>{`Estimasi ${hoursLabel(BASE_HOURS * 60)}`}</T>
            <T size={11} color={C.muted} style={{ marginTop: -2 }}>dihitung otomatis per 30 menit</T>
          </View>
          <T b size={15} color={C.navy}>{rupiah(q.base)}</T>
        </View>

        <T b size={16} style={{ marginTop: 14 }}>Tambah layanan</T>
        <View style={{ gap: 8, marginTop: 4 }}>
          {ADDONS.map((a) => {
            const on = addons.includes(a.id);
            const Icon = addonIcon[a.id];
            return (
              <Pressable key={a.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(a.id)} style={[s.addon, on ? s.addonOn : s.addonOff]}>
                <View style={[s.addonIcon, { backgroundColor: on ? C.white : C.bg }]}><Icon /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T b size={14}>{a.label}</T>
                  <T size={11} color={C.muted} style={{ marginTop: -2 }}>{addonMeta(a.minutes, a.price)}</T>
                </View>
                <View style={[s.check, on ? s.checkOn : s.checkOff]}>{on && <icons.check />}</View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <SummaryBar
        title={`${hoursLabel(q.minutes)} • ${rupiah(q.subtotal)}`}
        sub="sebelum biaya layanan"
        cta="Lanjut"
        onPress={() => router.push({ pathname: "/konfirmasi", params: { ...params, addons: addons.join(",") } })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  form: { ...card, borderRadius: 20, marginTop: 16, paddingHorizontal: 15, paddingTop: 17, paddingBottom: 9 },
  addr: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  divider: { height: 1, backgroundColor: C.border },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  box: { width: 120, height: 36, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, flexDirection: "row", alignItems: "center" },
  stepBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginHorizontal: 1 },
  est: { flexDirection: "row", alignItems: "center", backgroundColor: C.mintBg, borderRadius: 16, height: 54, marginTop: 10, paddingLeft: 16, paddingRight: 16 },
  addon: { height: 58, borderRadius: 16, borderWidth: 1.5, flexDirection: "row", alignItems: "center", paddingLeft: 11, paddingRight: 13.5 },
  addonOn: { backgroundColor: C.mintBg, borderColor: C.primary },
  addonOff: { backgroundColor: C.white, borderColor: C.border },
  addonIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  check: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: C.primary },
  checkOff: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.faint },
});
