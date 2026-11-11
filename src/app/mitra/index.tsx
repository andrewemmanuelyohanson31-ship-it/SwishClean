// Mitra_02_Jadwal_Hari_Ini (Figma 1:3389) — mitra home
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MitraNav } from "@/components/MitraNav";
import { rupiah } from "@/data/arts";
import { jobs } from "@/data/mitra";
import { session } from "@/data/session";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, T, Toggle, card, useInsets } from "@/ui";

const DAYS = [["Sen", 19], ["Sel", 20], ["Rab", 21], ["Kam", 22], ["Jum", 23], ["Sab", 24]] as const;

export default function JadwalMitra() {
  const { top } = useInsets();
  const [online, setOnline] = useState(true);
  const [day, setDay] = useState(20);
  if (session.role !== "mitra") return <Redirect href={{ pathname: "/masuk", params: { peran: "mitra" } }} />;
  const today = day === 20 ? jobs : []; // shortcut: only Sel 20 Okt has sample jobs

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: top + 17 }]}>
          <View style={s.row}>
            <Avatar initials="SR" color="#F6C9A8" size={44} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <T b size={15} color={C.white}>Selamat pagi, Siti</T>
              <View style={s.row}>
                <View style={[s.dot, { backgroundColor: online ? "#3CC47C" : C.faint }]} />
                <T size={11} color={online ? C.mint : C.greet} style={{ marginLeft: 6 }}>{online ? "Online • terima order" : "Offline • order dijeda"}</T>
              </View>
            </View>
            <Toggle value={online} onChange={setOnline} label="Terima order" />
          </View>
          <View style={[s.row, { gap: 10, marginTop: 18 }]}>
            <Pressable style={s.stat} accessibilityRole="button" onPress={() => router.navigate("/mitra/pendapatan")}>
              <T size={11} color={C.greet}>Pendapatan minggu ini</T>
              <T b size={19} color={C.white} style={{ marginTop: 7 }}>{rupiah(1260000)}</T>
            </Pressable>
            <Pressable style={s.stat} accessibilityRole="button" onPress={() => router.navigate("/mitra/profil")}>
              <T size={11} color={C.greet}>Rating kamu</T>
              <View style={[s.row, { marginTop: 7 }]}>
                <icons.mStar />
                <T b size={19} color={C.white} style={{ marginLeft: 7 }}>4.9</T>
                <T size={12} color={C.greet} style={{ marginTop: 6 }}>(128)</T>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={s.days}>
          {DAYS.map(([d, n]) => {
            const on = n === day;
            return (
              <Pressable key={n} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setDay(n)} style={[s.day, on ? s.dayOn : s.dayOff]}>
                <T size={11} color={on ? C.white : C.muted}>{d}</T>
                <T b size={17} color={on ? C.yellow : C.ink}>{String(n)}</T>
              </Pressable>
            );
          })}
        </View>

        <T b size={15} style={{ marginTop: 19, marginLeft: 20 }}>{`Jadwal hari ini • ${today.length} pekerjaan`}</T>
        <View style={{ gap: 14, marginTop: 8, paddingHorizontal: 20 }}>
          {today.map((j) => (
            <View key={j.id} style={[s.job, j.next && s.jobNext]}>
              <View style={s.between}>
                <T b size={16}>{j.time}</T>
                {j.next && <View style={s.nextPill}><T size={11} color={C.navy}>Berikutnya</T></View>}
              </View>
              <T size={12} color={C.muted} style={{ marginTop: 2 }}>{`${j.customer} • ${j.service}`}</T>
              <View style={[s.row, { marginTop: 7 }]}>
                <View style={s.ic}><icons.mPin /></View>
                <T size={12}>{j.address}</T>
              </View>
              <View style={[s.row, { marginTop: 4 }]}>
                <View style={s.ic}><icons.mNav /></View>
                <T size={12} color={C.muted}>{j.route}</T>
              </View>
              <View style={[s.between, { marginTop: 7, alignItems: "flex-end" }]}>
                <View style={[s.row, { alignItems: "flex-end", marginBottom: -3 }]}>
                  <T b size={15} color={C.navy}>{rupiah(j.pay)}</T>
                  <T size={11} color={C.muted} style={{ marginLeft: 3.5, marginBottom: 2 }}>kamu terima</T>
                </View>
                <View style={[s.row, { gap: 8 }]}>
                  <Button title="Chat" size={12} color={C.mintBg} textColor={C.primaryDark} style={{ width: 64, height: 30 }} onPress={() => router.push(`/mitra/chat/${j.id}`)} />
                  <Button title="Detail" size={12} color={C.navy} style={{ width: 72, height: 30 }} onPress={() => router.push(`/mitra/tugas/${j.id}`)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <MitraNav active="jadwal" />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 24 },
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stat: { flex: 1, height: 80, borderRadius: 16, backgroundColor: C.navy2, paddingLeft: 16, paddingTop: 15 },
  days: { flexDirection: "row", gap: 7, paddingHorizontal: 20, marginTop: 14 },
  day: { width: 52, height: 62, borderRadius: 14, alignItems: "center", paddingTop: 12 },
  dayOn: { backgroundColor: C.navy },
  dayOff: { ...card },
  job: { ...card, height: 156, borderRadius: 20, paddingLeft: 15, paddingRight: 11, paddingTop: 16 },
  jobNext: { borderWidth: 1.5, borderColor: C.navy, paddingLeft: 14.5, paddingRight: 10.5, paddingTop: 15.5 },
  nextPill: { height: 24, borderRadius: 12, backgroundColor: C.yellow, paddingHorizontal: 10, justifyContent: "center", marginRight: 25 },
  ic: { width: 18, alignItems: "center", marginRight: 4 },
});
