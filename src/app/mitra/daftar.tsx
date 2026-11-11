// App_02_Daftar_Mitra_1_Data_Diri (Figma 21:82)
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DaftarSteps } from "@/components/DaftarSteps";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, Chip, Field, T, TopBar, useInsets } from "@/ui";

const SKILLS = ["Bersih Rutin", "Setrika", "Bersih Mendalam", "Ramah Hewan", "Masak"];

export default function DaftarMitraData() {
  const { bottom } = useInsets();
  const [name, setName] = useState("Siti Rahmawati");
  const [nik, setNik] = useState("3603 •••• •••• 0021");
  const [dob, setDob] = useState("12 / 03 / 1990");
  const [phone, setPhone] = useState("+62 813 •••• 2207");
  const [address, setAddress] = useState("Pakulonan, Serpong Utara");
  const [skills, setSkills] = useState(["Bersih Rutin", "Setrika", "Ramah Hewan"]);
  const toggle = (k: string) => setSkills((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Daftar jadi mitra ART" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 17, paddingBottom: bottom + 50 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <DaftarSteps step={1} />
        <Field label="Nama sesuai KTP" icon={<icons.fUser />} value={name} onChangeText={setName} autoComplete="name" style={{ marginTop: 12 }} />
        <Field label="NIK (16 digit)" icon={<icons.fDoc />} value={nik} onChangeText={setNik} keyboardType="number-pad" style={s.gap} />
        <View style={[s.row, s.gap]}>
          <Field label="Tanggal lahir" icon={<icons.fCalendar />} value={dob} onChangeText={setDob} style={{ width: 165 }} />
          <Field label="Nomor HP" icon={<icons.fPhone />} value={phone} onChangeText={setPhone} keyboardType="phone-pad" size={13} style={{ flex: 1 }} />
        </View>
        <Field label="Alamat domisili" icon={<icons.fPin />} value={address} onChangeText={setAddress} style={s.gap} />

        <T size={13} color={C.muted} style={{ marginTop: 17 }}>Keahlian</T>
        <View style={s.chips}>
          {SKILLS.map((k) => <Chip key={k} label={k} on={skills.includes(k)} onPress={() => toggle(k)} />)}
        </View>

        <View style={s.note}>
          <icons.shieldGoldLg />
          <T size={11} color={C.muted} style={{ flex: 1, marginLeft: 9.5, lineHeight: 16 }}>
            Data dipakai untuk verifikasi identitas & keamanan pelanggan.
          </T>
        </View>

        <Button title="Lanjut: Foto KTP" size={16} color={C.navy} style={{ height: 56, marginTop: 40 }} onPress={() => router.push("/mitra/daftar-ktp")} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  gap: { marginTop: 13 },
  row: { flexDirection: "row", gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 3, width: 330 },
  note: { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 14, backgroundColor: C.yellowBg, marginTop: 22, paddingLeft: 16.2, paddingRight: 14 },
});
