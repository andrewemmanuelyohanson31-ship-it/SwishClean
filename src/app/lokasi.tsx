// Alamat tersimpan / Ubah lokasi (no Figma frame — Komplain radio cards + Daftar form fields)
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { setState, showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, Chip, Field, RadioCard, T, TopBar, useInsets, goBack } from "@/ui";

const LABELS = ["Rumah", "Kantor", "Kos", "Lainnya"];

export default function Lokasi() {
  const addresses = useStore((s) => s.addresses);
  const addressId = useStore((s) => s.addressId);
  const { bottom } = useInsets();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Rumah");
  const [detail, setDetail] = useState("");
  const [area, setArea] = useState("");
  const valid = detail.trim().length >= 8 && area.trim().length >= 3;

  const pick = (id: string) => {
    setState({ addressId: id });
    goBack("/");
  };
  const save = () => {
    if (!valid) return showToast("Lengkapi alamat (min. 8 huruf) dan kecamatan/kota.");
    const id = `a${Date.now()}`;
    setState((s) => ({ addresses: [...s.addresses, { id, label, detail: detail.trim(), area: area.trim() }], addressId: id }));
    showToast("Alamat disimpan dan dipakai untuk order");
    setAdding(false);
    setDetail("");
    setArea("");
  };
  const remove = (id: string) => {
    if (addresses.length <= 1) return showToast("Simpan minimal satu alamat.");
    setState((s) => {
      const rest = s.addresses.filter((a) => a.id !== id);
      return { addresses: rest, addressId: s.addressId === id ? rest[0].id : s.addressId };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Alamat tersimpan" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: bottom + 24 }} keyboardShouldPersistTaps="handled">
        <T size={13} color={C.muted}>Pilih alamat untuk order. ART di sekitar alamat ini yang ditampilkan.</T>
        <View style={{ gap: 8, marginTop: 10 }} accessibilityRole="radiogroup">
          {addresses.map((a) => (
            <RadioCard
              key={a.id}
              title={`${a.label} • ${a.area}`}
              sub={a.detail}
              on={a.id === addressId}
              onPress={() => pick(a.id)}
              right={<T size={12} color={C.red} accessibilityRole="button" accessibilityLabel={`Hapus alamat ${a.label}`} onPress={() => remove(a.id)}>Hapus</T>}
            />
          ))}
        </View>

        {adding ? (
          <View style={{ marginTop: 18 }}>
            <T b size={15}>Alamat baru</T>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {LABELS.map((l) => <Chip key={l} label={l} on={label === l} onPress={() => setLabel(l)} />)}
            </View>
            <Field label="Alamat lengkap" icon={<icons.fPin />} value={detail} onChangeText={setDetail} placeholder="Nama jalan, nomor, blok" autoComplete="street-address" maxLength={120} style={{ marginTop: 12 }} />
            <Field label="Kecamatan, kota" icon={<icons.fPin />} value={area} onChangeText={setArea} placeholder="Serpong, Tangerang Selatan" maxLength={60} style={{ marginTop: 12 }} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Button title="Batal" color={C.white} textColor={C.primary} style={{ flex: 1, height: 52, borderWidth: 1.5, borderColor: C.primary }} onPress={() => setAdding(false)} />
              <Button title="Simpan alamat" style={{ flex: 1, height: 52, opacity: valid ? 1 : 0.5 }} onPress={save} />
            </View>
          </View>
        ) : (
          <Button title="+ Tambah alamat" color={C.white} textColor={C.primary} style={{ height: 52, marginTop: 16, borderWidth: 1.5, borderColor: C.primary }} onPress={() => setAdding(true)} />
        )}
      </ScrollView>
    </View>
  );
}
