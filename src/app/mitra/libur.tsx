// Ajukan libur (no Figma frame — Pilih Jadwal calendar grid in a page + chips)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { DAYS, FIRST_DOW, dayName } from "@/data/calendar";
import { getState, setState, showToast, toggleIn } from "@/data/store";
import { C } from "@/theme";
import { Button, Chip, T, TopBar, card, goBack } from "@/ui";

const TODAY = 20;
const MIN_NOTICE = 3; // policy: request leave ≥ 3 days ahead
const REASONS = ["Keperluan keluarga", "Sakit", "Acara pribadi", "Lainnya"];
const cells: (number | null)[] = [...Array(FIRST_DOW).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];

export default function AjukanLibur() {
  const [picked, setPicked] = useState<number[]>(getState().leaves);
  const [reason, setReason] = useState(REASONS[0]);
  const earliest = TODAY + MIN_NOTICE;
  const save = () => {
    setState({ leaves: [...picked].sort((a, b) => a - b) });
    showToast(picked.length ? `Libur diajukan: ${picked.length} hari` : "Semua libur dibatalkan");
    goBack("/mitra/profil");
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Ajukan libur" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16 }}>
        <View style={s.card}>
          <T b size={16}>Oktober 2026</T>
          <View style={[s.grid, { marginTop: 14 }]}>
            {DAYS.map((d) => <T key={d} size={12} color={C.faint} style={s.dow}>{d}</T>)}
          </View>
          <View style={[s.grid, { marginTop: 6 }]}>
            {cells.map((d, i) => {
              if (!d) return <View key={`b${i}`} style={s.cell} />;
              const disabled = d < earliest;
              const on = picked.includes(d);
              return (
                <Pressable key={d} disabled={disabled} onPress={() => setPicked(toggleIn(picked, d))} style={s.cell}
                  accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled }} accessibilityLabel={`${dayName(d)} ${d} Oktober`}>
                  {on && <View style={s.sel} />}
                  <T size={14} b={on} color={on ? C.white : disabled ? C.disabled : C.ink}>{String(d)}</T>
                </Pressable>
              );
            })}
          </View>
          <T size={11} color={C.muted} style={{ marginTop: 6 }}>{`Ajukan minimal ${MIN_NOTICE} hari sebelumnya (mulai ${earliest} Okt).`}</T>
        </View>

        <T b size={14} style={{ marginTop: 16 }}>Alasan</T>
        <View style={s.chips}>{REASONS.map((r) => <Chip key={r} label={r} on={reason === r} onPress={() => setReason(r)} />)}</View>

        <Button title={picked.length ? `Ajukan ${picked.length} hari libur` : "Simpan"} size={16} color={C.navy} style={{ height: 56, marginTop: 24 }} onPress={save} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...card, borderRadius: 20, padding: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dow: { width: "14.28%", textAlign: "center" },
  cell: { width: "14.28%", height: 40, alignItems: "center", justifyContent: "center" },
  sel: { position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: C.navy },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
});
