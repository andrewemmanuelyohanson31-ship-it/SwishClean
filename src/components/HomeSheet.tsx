import { StyleSheet, View } from "react-native";
import { AREAS } from "../data/order";
import { Home, setState, useStore } from "../data/store";
import { C } from "../theme";
import { Button, Chip, Sheet, Stepper, T } from "../ui";

/** House size picker shared by Beranda (Cek harga cepat) and Detail Rumah. Writes to the store's `home`. */
export function HomeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const home = useStore((s) => s.home);
  const set = (patch: Partial<Home>) => setState((s) => ({ home: { ...s.home, ...patch } }));
  return (
    <Sheet visible={visible} onClose={onClose} title="Ukuran rumah">
      <T size={13} color={C.muted} style={{ marginTop: 14 }}>Luas rumah</T>
      <View style={s.chips}>
        {AREAS.map((a) => <Chip key={a} label={`${a} m²`} on={home.area === a} onPress={() => set({ area: a })} />)}
      </View>
      <View style={[s.row, { marginTop: 16 }]}>
        <T size={14}>Kamar tidur</T>
        <Stepper label="kamar tidur" value={home.bed} onChange={(bed) => set({ bed })} />
      </View>
      <View style={[s.row, { marginTop: 12 }]}>
        <T size={14}>Kamar mandi</T>
        <Stepper label="kamar mandi" value={home.bath} min={1} onChange={(bath) => set({ bath })} />
      </View>
      <Button title="Simpan" style={{ height: 52, marginTop: 22 }} onPress={onClose} />
    </Sheet>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
