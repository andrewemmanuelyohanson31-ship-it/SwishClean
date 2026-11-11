// Ubah ketersediaan (no Figma frame — Profil "Ketersediaan" card + chips + Detail Rumah stepper)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { getState, setState, showToast, toggleIn } from "@/data/store";
import { C } from "@/theme";
import { Button, Chip, Stepper, T, TopBar, card, goBack } from "@/ui";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const STARTS = ["06.00", "07.00", "08.00", "09.00"];
const ENDS = ["14.00", "15.00", "16.00", "17.00", "18.00"];

export default function Ketersediaan() {
  const init = getState();
  const [days, setDays] = useState(init.days);
  const [start, setStart] = useState(init.hours.start);
  const [end, setEnd] = useState(init.hours.end);
  const [max, setMax] = useState(init.hours.max);
  const save = () => {
    if (!days.length) return showToast("Pilih minimal satu hari kerja.");
    setState({ days: DAYS.filter((d) => days.includes(d)), hours: { start, end, max } });
    showToast("Ketersediaan disimpan");
    goBack("/mitra/profil");
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Ketersediaan" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16 }}>
        <View style={s.card}>
          <T b size={14}>Hari kerja</T>
          <View style={s.days}>
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <Pressable key={d} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setDays(toggleIn(days, d))} style={[s.day, { backgroundColor: on ? C.navy : C.bg }]}>
                  <T size={11} b={on} color={on ? C.white : C.faint}>{d}</T>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[s.card, { marginTop: 12 }]}>
          <T b size={14}>Jam mulai</T>
          <View style={s.chips}>{STARTS.map((t) => <Chip key={t} label={t} on={start === t} onPress={() => setStart(t)} />)}</View>
          <T b size={14} style={{ marginTop: 14 }}>Jam selesai</T>
          <View style={s.chips}>{ENDS.map((t) => <Chip key={t} label={t} on={end === t} onPress={() => setEnd(t)} />)}</View>
          <View style={[s.row, { marginTop: 16 }]}>
            <View>
              <T b size={14}>Maks. order per hari</T>
              <T size={11} color={C.muted}>Supaya tidak kelelahan</T>
            </View>
            <Stepper label="maksimal order" value={max} min={1} max={4} onChange={setMax} />
          </View>
        </View>

        <T size={11} color={C.muted} style={{ marginTop: 12 }}>{`Kamu menerima order ${days.length} hari/minggu, ${start}–${end}, maks. ${max} order/hari.`}</T>
        <Button title="Simpan" size={16} color={C.navy} style={{ height: 56, marginTop: 20 }} onPress={save} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...card, borderRadius: 20, padding: 15 },
  days: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  day: { width: 40.3, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
