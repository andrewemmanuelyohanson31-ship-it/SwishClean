// App_01_Daftar_Pelanggan (Figma 21:3)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { setState, showToast } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, Chip, Field, T, TopBar, card, useInsets, goBack } from "@/ui";

const TYPES = ["Rumah", "Apartemen", "Kos"];

export default function DaftarPelanggan() {
  const { bottom } = useInsets();
  const [name, setName] = useState("Piero Christian");
  const [phone, setPhone] = useState("+62 812 •••• 4410");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("Jl. Jalur Sutera Barat No. 12");
  const [type, setType] = useState("Rumah");
  const [pets, setPets] = useState(false);
  const [agree, setAgree] = useState(true);
  const digits = phone.replace(/\D/g, "").length;
  const error = name.trim().length < 2 ? "Isi nama lengkap." : digits < 9 || digits > 15 ? "Nomor HP tidak valid." : email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "Format email tidak valid." : !agree ? "Setujui syarat & kebijakan dulu." : "";
  const ok = !error;
  const daftar = () => {
    if (!ok) return showToast(error);
    setState((s) => ({
      profile: { name: name.trim(), phone: phone.trim(), email: email.trim() },
      home: { ...s.home, type, pets },
      addresses: address.trim() ? [{ ...s.addresses[0], detail: address.trim() }, ...s.addresses.slice(1)] : s.addresses,
    }));
    showToast("Kode OTP dikirim via SMS");
    router.replace({ pathname: "/masuk", params: { peran: "pelanggan" } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Daftar akun pelanggan" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 21, paddingBottom: bottom + 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <T size={13} color={C.muted}>Buat akun untuk mulai pesan ART.</T>
        <Field label="Nama lengkap" icon={<icons.fUser />} value={name} onChangeText={setName} autoComplete="name" style={{ marginTop: 6 }} />
        <Field label="Nomor HP (untuk OTP)" icon={<icons.fPhone />} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" style={s.gap} />
        <Field label="Email (opsional)" icon={<icons.fChat />} value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoComplete="email" style={s.gap} />
        <Field label="Alamat utama" icon={<icons.fPin />} value={address} onChangeText={setAddress} autoComplete="street-address" style={s.gap} />

        <T size={13} color={C.muted} style={{ marginTop: 15 }}>Detail rumah (bisa diubah nanti)</T>
        <View style={[s.chips, { marginTop: 3 }]}>
          {TYPES.map((t) => <Chip key={t} label={t} on={t === type} onPress={() => setType(t)} />)}
        </View>
        <View style={[s.chips, { marginTop: 8 }]}>
          <Chip label="70 m²" on={false} />
          <Chip label="2 kamar" on={false} />
          <Chip label="Ada hewan" on={pets} onPress={() => setPets(!pets)} />
        </View>

        <Pressable style={s.agree} accessibilityRole="checkbox" accessibilityState={{ checked: agree }} onPress={() => setAgree(!agree)}>
          <View style={[s.box, agree ? s.boxOn : s.boxOff]}>{agree && <icons.checkWhite />}</View>
          <T size={11} style={{ flex: 1, marginLeft: 10, lineHeight: 16 }}>
            Saya setuju dengan Syarat Layanan, Kebijakan Refund, dan Kebijakan Privasi SwishClean.
          </T>
        </Pressable>

        <Button
          title="Daftar & Kirim OTP"
          size={16}
          style={{ height: 56, marginTop: 30, opacity: ok ? 1 : 0.5 }}
          onPress={daftar}
        />
        {!ok && <T size={12} color={C.red} style={{ textAlign: "center", marginTop: 8 }}>{error}</T>}
        <T size={13} color={C.primary} style={{ textAlign: "center", marginTop: 21 }} accessibilityRole="link" onPress={() => goBack("/masuk")}>
          Sudah punya akun? Masuk
        </T>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  gap: { marginTop: 15 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  agree: { ...card, flexDirection: "row", alignItems: "flex-start", minHeight: 72, borderRadius: 14, marginTop: 20, paddingLeft: 14, paddingRight: 14, paddingTop: 16 },
  box: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: C.primary },
  boxOff: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.faint },
});
