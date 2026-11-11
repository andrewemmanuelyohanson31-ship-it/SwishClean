// Pelanggan_09_Pesanan_Saya (Figma 1:2607). Selesai/Dibatalkan tabs + cancel sheet have no frame; they reuse its cards.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { BottomNav } from "@/components/BottomNav";
import { getArt, rupiah } from "@/data/arts";
import { dayName } from "@/data/calendar";
import { addTime } from "@/data/order";
import { Order, showToast, updateOrder, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, ConfirmSheet, Empty, T, Tag, TopBar, card } from "@/ui";

const STEPS = ["Dikonfirmasi", "Menuju", "Dikerjakan", "Selesai"];
const pink = "#FCE7E5";
const when = (o: Order) => `${dayName(o.day)}, ${o.day} Okt`;

function ActiveCard({ o, onCancel }: { o: Order; onCancel: () => void }) {
  const art = getArt(o.artId);
  return (
    <View>
      <View style={s.active}>
        <View style={s.between}>
          <Tag label="Terjadwal" h={24} />
          <T size={11} color={C.faint}>{o.code}</T>
        </View>
        <View style={[s.person, { marginTop: 14 }]}>
          <Avatar initials={art.initials} color={art.color} size={40} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <T b size={15}>{art.name}</T>
            <T size={11} color={C.muted} style={{ marginTop: -1 }} numberOfLines={1}>{`${o.service} • ${rupiah(o.total)}`}</T>
          </View>
        </View>
        <View style={[s.person, { marginTop: 9 }]}>
          <icons.calendarSm style={{ marginLeft: 1.3 }} />
          <T size={12} style={{ marginLeft: 6.4 }}>{`${when(o)} • ${o.time}–${addTime(o.time, o.minutes)}`}</T>
        </View>
        <View style={s.timeline}>
          <View style={s.line} />
          {STEPS.map((st, i) => (
            <View key={st} style={s.stepCol}>
              <View style={[s.dot, i === 0 ? s.dotOn : s.dotOff]} />
              <T size={10} b={i === 0} color={i === 0 ? C.ink : C.faint} style={{ marginTop: 6 }}>{st}</T>
            </View>
          ))}
        </View>
        <View style={[s.btnRow, { marginTop: 13 }]}>
          <Button title="Chat" size={12} icon={<icons.chatSm />} color={C.mintBg} textColor={C.primaryDark} style={{ width: 96, height: 36 }} onPress={() => router.push(`/chat/${art.id}`)} />
          <Button title="Ubah jadwal" size={12} color={C.white} textColor={C.primary} style={[s.outline, { width: 112, height: 36 }]}
            onPress={() => router.push({ pathname: "/jadwal", params: { art: art.id, reschedule: o.id } })} />
          <Button title="Batalkan" size={12} color={pink} textColor={C.red} style={{ width: 94, height: 36 }} onPress={onCancel} />
        </View>
      </View>
      <T size={11} color={C.muted} style={{ marginTop: 13 }}>{`Batal gratis sampai ${dayName(o.day - 1)}, ${o.day - 1} Okt • ${o.time}`}</T>
    </View>
  );
}

function ReviewCard({ o }: { o: Order }) {
  const art = getArt(o.artId);
  return (
    <View style={[s.card, { height: 150 }]}>
      <View style={s.person}>
        <Avatar initials={art.initials} color={art.color} size={40} />
        <View style={{ marginLeft: 10 }}>
          <T b size={14}>{art.name}</T>
          <T size={11} color={C.muted} style={{ marginTop: -1 }}>{`${when(o)} • ${o.service.split(" + ")[0]} • Selesai`}</T>
        </View>
      </View>
      <View style={s.note}>
        <icons.starOutlineGold />
        <T size={11} style={{ marginLeft: 8.3 }}>Beri rating & komentar dalam 3 hari</T>
      </View>
      <View style={[s.btnRow, { marginTop: 8 }]}>
        <Button title="Beri ulasan" size={12} style={{ width: 120, height: 32 }} onPress={() => router.push({ pathname: "/ulasan", params: { order: o.id } })} />
        <Button title="Pesan lagi" size={12} color={C.white} textColor={C.primary} style={[s.outline, { width: 96, height: 32 }]} onPress={() => router.push({ pathname: "/jadwal", params: { art: art.id } })} />
        <Button title={o.complained ? "Diproses" : "Komplain"} size={12} color={pink} textColor={C.red} style={{ width: 86, height: 32, opacity: o.complained ? 0.6 : 1 }}
          onPress={() => (o.complained ? showToast("Komplainmu sedang diproses (maks. 24 jam)") : router.push({ pathname: "/komplain", params: { order: o.id } }))} />
      </View>
    </View>
  );
}

function HistoryCard({ o }: { o: Order }) {
  const art = getArt(o.artId);
  const cancelled = o.status === "dibatalkan";
  return (
    <Pressable style={[s.card, { height: 92 }]} accessibilityRole="button" accessibilityLabel={`Pesan lagi ${art.name}`} onPress={() => router.push(`/art/${art.id}`)}>
      <View style={s.person}>
        <Avatar initials={art.initials} color={art.color} size={40} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <T b size={14}>{art.name}</T>
          <T size={11} color={C.muted} style={{ marginTop: -1 }} numberOfLines={1}>{`${when(o)} • ${o.service.split(" + ")[0]}`}</T>
          <View style={[s.person, { marginTop: 1 }]}>
            {cancelled ? (
              <T size={11} color={C.muted}>{`Refund ${rupiah(o.total)} diproses`}</T>
            ) : (
              <>
                <View style={{ flexDirection: "row", gap: 3, marginLeft: 1 }}>{[1, 2, 3, 4, 5].map((i) => <icons.starMd key={i} />)}</View>
                <T size={11} color={C.muted} style={{ marginLeft: 4 }}>Ulasanmu terkirim</T>
              </>
            )}
          </View>
        </View>
        <View style={{ marginTop: 6, marginRight: 13 }}>
          {cancelled ? <View style={s.cancelTag}><T size={11} color={C.red}>Dibatalkan</T></View> : <Tag label="Selesai" h={24} />}
        </View>
      </View>
    </Pressable>
  );
}

export default function PesananSaya() {
  const orders = useStore((s) => s.orders);
  const [tab, setTab] = useState(0);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const active = orders.filter((o) => o.status === "aktif");
  const toReview = orders.filter((o) => o.status === "selesai" && !o.reviewed);
  const done = orders.filter((o) => o.status === "selesai" && o.reviewed);
  const cancelled = orders.filter((o) => o.status === "dibatalkan");
  const tabs = [`Aktif (${active.length})`, "Selesai", "Dibatalkan"];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Pesanan saya" back={false} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 13, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.tabs} accessibilityRole="tablist">
          {tabs.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={[s.tab, i === tab && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: i === tab }}>
              <T size={13} b={i === tab} color={i === tab ? C.white : C.muted}>{t}</T>
            </Pressable>
          ))}
        </View>

        {tab === 0 && (
          <>
            {active.length === 0 && <Empty text="Belum ada pesanan aktif." />}
            <View style={{ gap: 14, marginTop: 14 }}>
              {active.map((o) => <ActiveCard key={o.id} o={o} onCancel={() => setCancelId(o.id)} />)}
            </View>
            {toReview.length > 0 && <T b size={15} style={{ marginTop: 13 }}>Perlu tindakan</T>}
            <View style={{ gap: 12, marginTop: 6 }}>{toReview.map((o) => <ReviewCard key={o.id} o={o} />)}</View>
            {done[0] && <View style={{ marginTop: 12 }}><HistoryCard o={done[0]} /></View>}
          </>
        )}
        {tab === 1 && (
          <View style={{ gap: 12, marginTop: 14 }}>
            {toReview.map((o) => <ReviewCard key={o.id} o={o} />)}
            {done.map((o) => <HistoryCard key={o.id} o={o} />)}
            {toReview.length + done.length === 0 && <Empty text="Belum ada pesanan selesai." />}
          </View>
        )}
        {tab === 2 && (
          <View style={{ gap: 12, marginTop: 14 }}>
            {cancelled.map((o) => <HistoryCard key={o.id} o={o} />)}
            {cancelled.length === 0 && <Empty text="Tidak ada pesanan yang dibatalkan." />}
          </View>
        )}
      </ScrollView>
      <BottomNav active="pesanan" />

      <ConfirmSheet
        visible={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Batalkan pesanan?"
        body="Pembatalan gratis karena masih lebih dari 24 jam sebelum jadwal. Dana kembali penuh ke metode bayar asal dalam 1–3 hari kerja."
        confirm="Ya, batalkan"
        danger
        onConfirm={() => {
          if (cancelId) updateOrder(cancelId, { status: "dibatalkan" });
          showToast("Pesanan dibatalkan. Refund diproses 1–3 hari kerja.");
          setTab(2);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  tabs: { ...card, flexDirection: "row", height: 42, borderRadius: 21, padding: 3 },
  tab: { flex: 1, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: C.primary },
  active: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.primary, borderRadius: 20, height: 244, paddingHorizontal: 14.5, paddingTop: 14.5 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  person: { flexDirection: "row", alignItems: "center" },
  timeline: { flexDirection: "row", justifyContent: "space-between", marginTop: 13, marginHorizontal: -14 },
  line: { position: "absolute", top: 6.5, left: 44, right: 44, height: 3, backgroundColor: C.border },
  stepCol: { width: 86, alignItems: "center" },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotOn: { backgroundColor: C.primary },
  dotOff: { backgroundColor: C.white, borderWidth: 2, borderColor: C.faint },
  btnRow: { flexDirection: "row", gap: 8 },
  outline: { borderWidth: 1.5, borderColor: C.primary },
  card: { ...card, borderRadius: 20, paddingHorizontal: 15, paddingTop: 17 },
  note: { flexDirection: "row", alignItems: "center", height: 30, borderRadius: 10, backgroundColor: C.yellowBg, marginTop: 12, paddingLeft: 10.3 },
  cancelTag: { height: 24, borderRadius: 12, backgroundColor: pink, paddingHorizontal: 10, justifyContent: "center" },
});
