// Pelanggan_03_Cari_ART (Figma 1:1974) + Filter sheet (no design; uses the Pilih Jadwal sheet style)
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ArtCard } from "@/components/ArtCard";
import { BottomNav } from "@/components/BottomNav";
import { SERVICES, SORTS, searchArts } from "@/data/search";
import { DEFAULT_FILTER, Filter, setState, toggleIn, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C, F } from "@/theme";
import { Button, Chip, Empty, IconButton, Sheet, T, TopBar } from "@/ui";

const QUICK = ["Bersih Rutin", "Ramah Hewan"];
const RATINGS = [{ v: 0, label: "Semua" }, { v: 4.5, label: "4.5+" }, { v: 4.8, label: "4.8+" }];
const PRICES = [{ v: 0, label: "Semua" }, { v: 45000, label: "≤ Rp45rb/jam" }, { v: 40000, label: "≤ Rp40rb/jam" }];

const setFilter = (patch: Partial<Filter>) => setState((s) => ({ filter: { ...s.filter, ...patch } }));

export default function Cari() {
  const filter = useStore((s) => s.filter);
  const addresses = useStore((s) => s.addresses);
  const addressId = useStore((s) => s.addressId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filter>(filter);
  const area = addresses.find((a) => a.id === addressId)?.area ?? "";
  const results = searchArts(filter, area);
  // Quick chips: the design's two + any other active service, then the 4.5+ rating chip.
  const quick = [...QUICK, ...filter.tags.filter((t) => !QUICK.includes(t))];
  const sortLabel = SORTS.find((x) => x.id === filter.sort)?.label ?? "";
  const nextSort = () => setFilter({ sort: SORTS[(SORTS.findIndex((x) => x.id === filter.sort) + 1) % SORTS.length].id });
  const activeCount = filter.tags.length + (filter.minRating ? 1 : 0) + (filter.maxPrice ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar
        title="Cari ART"
        right={
          <View>
            <IconButton label={`Filter${activeCount ? `, ${activeCount} aktif` : ""}`} bg="transparent" style={{ marginRight: -12 }} onPress={() => { setDraft(filter); setOpen(true); }}>
              <icons.filter />
            </IconButton>
            {activeCount > 0 && <View style={s.badge} pointerEvents="none" />}
          </View>
        }
      />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.search}>
          <icons.search />
          <TextInput
            value={filter.query}
            onChangeText={(query) => setFilter({ query })}
            placeholder="Bersih rutin, Alam Sutera"
            placeholderTextColor={C.faint}
            style={s.input}
            accessibilityLabel="Cari ART"
            returnKeyType="search"
            maxLength={60}
          />
        </View>
        <View style={s.chips}>
          {quick.map((c) => <Chip key={c} label={c} on={filter.tags.includes(c)} onPress={() => setFilter({ tags: toggleIn(filter.tags, c) })} />)}
          <Chip label="4.5+" on={filter.minRating >= 4.5} onPress={() => setFilter({ minRating: filter.minRating >= 4.5 ? 0 : 4.5 })} />
        </View>
        <View style={s.meta}>
          <T size={13} color={C.muted}>{`${results.length} ART tersedia`}</T>
          <T size={13} color={C.primary} accessibilityRole="button" accessibilityHint="Ganti urutan" onPress={nextSort}>{sortLabel}</T>
        </View>
        <View style={{ gap: 12, marginTop: 6 }}>
          {results.map((a) => <ArtCard key={a.id} art={a} />)}
        </View>
        {results.length === 0 && (
          <View>
            <Empty text="Tidak ada ART yang cocok dengan pencarianmu." />
            <Button title="Reset filter" size={13} color={C.white} textColor={C.primary} style={s.reset} onPress={() => setFilter({ ...DEFAULT_FILTER })} />
          </View>
        )}
      </ScrollView>
      <BottomNav active="cari" />

      <Sheet visible={open} onClose={() => setOpen(false)} title="Filter & urutkan">
        <T size={13} color={C.muted} style={s.label}>Urutkan</T>
        <View style={s.wrap}>{SORTS.map((o) => <Chip key={o.id} label={o.label} on={draft.sort === o.id} onPress={() => setDraft({ ...draft, sort: o.id })} />)}</View>
        <T size={13} color={C.muted} style={s.label}>Layanan</T>
        <View style={s.wrap}>{SERVICES.map((t) => <Chip key={t} label={t} on={draft.tags.includes(t)} onPress={() => setDraft({ ...draft, tags: toggleIn(draft.tags, t) })} />)}</View>
        <T size={13} color={C.muted} style={s.label}>Rating minimal</T>
        <View style={s.wrap}>{RATINGS.map((o) => <Chip key={o.label} label={o.label} on={draft.minRating === o.v} onPress={() => setDraft({ ...draft, minRating: o.v })} />)}</View>
        <T size={13} color={C.muted} style={s.label}>Harga maksimal</T>
        <View style={s.wrap}>{PRICES.map((o) => <Chip key={o.label} label={o.label} on={draft.maxPrice === o.v} onPress={() => setDraft({ ...draft, maxPrice: o.v })} />)}</View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
          <Button title="Reset" color={C.white} textColor={C.primary} style={[s.reset, { flex: 1, height: 52, marginTop: 0 }]} onPress={() => setDraft({ ...DEFAULT_FILTER, query: filter.query })} />
          <Button title={`Terapkan (${searchArts(draft, area).length})`} style={{ flex: 1, height: 52 }} onPress={() => { setFilter(draft); setOpen(false); }} />
        </View>
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: 16 },
  search: { height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, flexDirection: "row", alignItems: "center", paddingLeft: 16.2 },
  input: { flex: 1, marginLeft: 11.5, fontFamily: F.reg, fontSize: 14, color: C.ink, paddingVertical: 0, outlineStyle: "none" } as object,
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 13 },
  badge: { position: "absolute", top: 6, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow },
  reset: { height: 40, marginTop: 12, borderWidth: 1.5, borderColor: C.primary },
  label: { marginTop: 14 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
});
