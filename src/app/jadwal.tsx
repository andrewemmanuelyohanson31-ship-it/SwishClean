// Pelanggan_05_Pilih_Jadwal (Figma 1:2336) — bottom sheet over the previous screen.
import { useEffect, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DAYS, FIRST_DOW, dayName } from "@/data/calendar";
import { icons } from "@/icons";
import { C } from "@/theme";
import { getState, showToast, updateOrder } from "@/data/store";
import { Steps, SummaryBar, T, useInsets, goBack } from "@/ui";

const TODAY = 15;
const BUSY = [22, 24, 29]; // dots: days with few slots left
const TIMES = ["07.00", "08.00", "09.00", "10.00", "11.00", "13.00", "14.00", "15.00"];
const FULL = ["07.00", "11.00"];

// Calendar cells for Oktober 2026: leading blanks, then 1..31.
const cells: (number | null)[] = [...Array(FIRST_DOW).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];

export default function PilihJadwal() {
  const { art, reschedule } = useLocalSearchParams<{ art?: string; reschedule?: string }>();
  const { top } = useInsets();
  // Rescheduling an existing order starts from its current slot.
  const existing = getState().orders.find((o) => o.id === reschedule && o.status === "aktif");
  const [day, setDay] = useState(existing && existing.day >= TODAY ? existing.day : 20);
  const [time, setTime] = useState(existing && TIMES.includes(existing.time) && !FULL.includes(existing.time) ? existing.time : "09.00");
  const close = () => goBack();
  const next = () => {
    if (existing) {
      updateOrder(existing.id, { day, time });
      showToast(`Jadwal diubah ke ${dayName(day)}, ${day} Okt • ${time}`);
      return goBack("/pesanan");
    }
    router.push({ pathname: "/detail-rumah", params: { art, day: String(day), time } });
  };
  // Sheet slides up over a fading backdrop.
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }).start();
  }, [a]);
  const slideUp = { transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [700, 0] }) }] };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: a }]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: C.overlay }]} onPress={close} accessibilityLabel="Tutup" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, slideUp]} pointerEvents="box-none">
      <View style={[s.sheet, { top: top + 73 }]}>
        <View style={s.handle} />
        <T b size={19} style={{ marginTop: 18 }} accessibilityRole="header">Pilih jadwal & jam</T>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Tutup" style={s.close}>
          <icons.close />
        </Pressable>
        <Steps n={1} style={{ marginTop: 2 }} />

        <View style={s.month}>
          <T b size={16}>Oktober 2026</T>
          <View style={{ flexDirection: "row", gap: 26.5, marginRight: 14.7 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Bulan sebelumnya" accessibilityState={{ disabled: true }} hitSlop={10} onPress={() => showToast("Oktober 2026 adalah bulan berjalan")}>
              <icons.chevLeftMuted />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Bulan berikutnya" hitSlop={10} onPress={() => showToast("Jadwal November dibuka mulai 1 Nov")}>
              <icons.chevRight />
            </Pressable>
          </View>
        </View>
        <View style={[s.grid, { marginTop: 20 }]}>
          {DAYS.map((d) => <T key={d} size={12} color={C.faint} style={s.dow}>{d}</T>)}
        </View>
        <View style={[s.grid, { marginTop: 9 }]}>
          {cells.map((d, i) => {
            if (!d) return <View key={`b${i}`} style={s.cell} />;
            const past = d < TODAY;
            const sel = d === day;
            return (
              <Pressable key={d} disabled={past} onPress={() => setDay(d)} style={s.cell} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: past }} accessibilityLabel={`${dayName(d)} ${d} Oktober`}>
                {sel ? <View style={s.selCircle} /> : d === TODAY ? <View style={s.todayRing} /> : null}
                <T size={14} b={sel || d === TODAY} color={sel ? C.white : d === TODAY ? C.primary : past ? C.disabled : C.ink}>{d}</T>
                {BUSY.includes(d) && <View style={s.dot} />}
              </Pressable>
            );
          })}
        </View>

        <T b size={15} style={{ marginTop: 8 }}>Jam mulai</T>
        <View style={s.times}>
          {TIMES.map((t) => {
            const full = FULL.includes(t);
            const sel = t === time;
            return (
              <Pressable key={t} disabled={full} onPress={() => setTime(t)} style={[s.time, full ? s.timeFull : sel ? s.timeSel : s.timeFree]} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: full }}>
                <T size={14} color={full ? C.disabledText : sel ? C.white : C.ink} style={full && { textDecorationLine: "line-through" }}>{t}</T>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SummaryBar
        title={`${dayName(day)}, ${day} Okt • ${time}`}
        sub={existing ? `Ubah jadwal ${existing.code}` : "Durasi dihitung berikutnya"}
        cta={existing ? "Simpan" : "Lanjut"}
        onPress={next}
      />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20 },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 2.5, backgroundColor: C.border, marginTop: 10 },
  close: { position: "absolute", right: 12, top: 24, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  month: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dow: { width: 50, textAlign: "center" },
  cell: { width: 50, height: 40, alignItems: "center", justifyContent: "center" },
  selCircle: { position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: C.primary },
  todayRing: { position: "absolute", width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: C.primary },
  dot: { position: "absolute", top: 30, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: C.yellow },
  times: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  time: { width: 81.5, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  timeFull: { backgroundColor: C.bg },
  timeFree: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  timeSel: { backgroundColor: C.primary },
});
