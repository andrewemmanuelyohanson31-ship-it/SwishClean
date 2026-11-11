// Mitra_04_Detail_dan_Daftar_Tugas (Figma 1:3616)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getJob, TASKS } from "@/data/mitra";
import { icons } from "@/icons";
import { C } from "@/theme";
import { setState, showToast } from "@/data/store";
import { Avatar, Button, ConfirmSheet, IconButton, T, TopBar, card, useInsets } from "@/ui";

export default function DetailTugas() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);
  const { bottom } = useInsets();
  const [done, setDone] = useState(() => TASKS.map((r) => r.items.map((t) => t.done)));
  const total = TASKS.reduce((n, r) => n + r.items.length, 0);
  const count = done.flat().filter(Boolean).length;
  const toggle = (r: number, i: number) => setDone((d) => d.map((row, ri) => (ri === r ? row.map((v, ii) => (ii === i ? !v : v)) : row)));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const finish = () => {
    setState((s) => ({ doneJobs: s.doneJobs.includes(job.id) ? s.doneJobs : [...s.doneJobs, job.id] }));
    router.push({ pathname: "/mitra/selesai", params: { id: job.id, done: String(count), total: String(total) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title={`Pekerjaan ${job.start}`}
        right={<IconButton label={`Telepon ${job.customer}`} bg="transparent" style={{ marginRight: -8 }}
          onPress={() => showToast(`Panggilan ke ${job.customer} lewat SwishClean (nomor disamarkan) — aktif setelah server telepon terhubung.`)}><icons.mPhone /></IconButton>}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 120 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={s.info}>
          <View style={s.row}>
            <Avatar initials={job.initials} color={job.color} size={36} />
            <View style={{ marginLeft: 10 }}>
              <T b size={13}>{`${job.customer} • ${job.home}`}</T>
              <View style={s.row}>
                <icons.mPaw style={{ marginLeft: 2.4 }} />
                <T size={11} color={C.muted} style={{ marginLeft: 6.5 }}>{job.note}</T>
              </View>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <icons.mClock />
            <T size={11} color={C.primaryDark} style={{ marginLeft: 6 }}>{`Sisa waktu 2 j 40 m • progres ${count}/${total} tugas`}</T>
          </View>
        </View>

        <View style={s.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: count }}>
          <View style={[s.fill, { width: `${(count / total) * 100}%` }]} />
        </View>

        <View style={{ gap: 10, marginTop: 22 }}>
          {TASKS.map((room, r) => (
            <View key={room.room} style={s.room}>
              <View style={s.between}>
                <T b size={13}>{room.room}</T>
                <T size={11} color={C.muted}>{`${done[r].filter(Boolean).length}/${room.items.length}`}</T>
              </View>
              {room.items.map((t, i) => {
                const on = done[r][i];
                return (
                  <Pressable key={t.label} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(r, i)} style={[s.row, { height: 30, marginTop: i === 0 ? 1 : 0 }]}>
                    <View style={[s.box, on ? s.boxOn : s.boxOff]}>{on && <icons.mCheck />}</View>
                    <T size={12} color={on ? C.faint : C.ink} style={[{ marginLeft: 10 }, on && { textDecorationLine: "line-through" }]}>{t.label}</T>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: bottom + 12 }]}>
        <Button title="Chat" size={14} icon={<icons.mChat />} color={C.mintBg} textColor={C.primaryDark} style={{ width: 110, height: 52 }} onPress={() => router.push(`/mitra/chat/${job.id}`)} />
        <Button title="Selesaikan Pekerjaan" size={14} color={C.navy} style={{ flex: 1, height: 52 }} onPress={() => (count < total ? setConfirmOpen(true) : finish())} />
      </View>
      <ConfirmSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Masih ada tugas tersisa"
        body={`${total - count} dari ${total} tugas belum dicentang. Pelanggan akan melihat laporan ini. Tetap selesaikan pekerjaan?`}
        confirm="Tetap selesaikan"
        onConfirm={finish}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { ...card, height: 92, borderRadius: 18, paddingHorizontal: 15, paddingTop: 15 },
  divider: { height: 1, backgroundColor: C.border, marginTop: 10, marginBottom: 7 },
  track: { height: 8, borderRadius: 4, backgroundColor: C.border, marginTop: 12, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: C.primary },
  room: { ...card, borderRadius: 16, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 5 },
  box: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: C.primary },
  boxOff: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.faint },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 10, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 20, paddingTop: 13 },
});
