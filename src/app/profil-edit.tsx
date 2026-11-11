// Ubah profil (no Figma frame — Daftar Pelanggan form fields)
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { getState, setState, showToast } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Avatar, Button, Field, T, TopBar, initialsOf, goBack } from "@/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ProfilEdit() {
  const p = getState().profile;
  const [name, setName] = useState(p.name);
  const [phone, setPhone] = useState(p.phone);
  const [email, setEmail] = useState(p.email);
  const errors = [
    name.trim().length < 2 && "Nama minimal 2 huruf.",
    (phone.replace(/\D/g, "").length < 9 || !/^\+?[\d\s•-]+$/.test(phone)) && "Nomor HP tidak valid.",
    email.trim() !== "" && !EMAIL_RE.test(email.trim()) && "Format email tidak valid.",
  ].filter(Boolean) as string[];

  const save = () => {
    if (errors.length) return showToast(errors[0]);
    setState({ profile: { name: name.trim(), phone: phone.trim(), email: email.trim() } });
    showToast("Profil disimpan");
    goBack("/akun");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Ubah profil" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center" }}>
          <Avatar initials={initialsOf(name)} color="#CFD8F6" size={64} />
        </View>
        <Field label="Nama lengkap" icon={<icons.fUser />} value={name} onChangeText={setName} autoComplete="name" maxLength={60} style={{ marginTop: 16 }} />
        <Field label="Nomor HP" icon={<icons.fPhone />} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={20} style={{ marginTop: 15 }} />
        <Field label="Email (opsional)" icon={<icons.fChat />} value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoComplete="email" maxLength={80} style={{ marginTop: 15 }} />
        {errors.length > 0 && <T size={12} color={C.red} style={{ marginTop: 10 }}>{errors[0]}</T>}
        <T size={11} color={C.muted} style={{ marginTop: 10 }}>Ganti nomor HP akan meminta verifikasi OTP ulang.</T>
        <Button title="Simpan" size={16} style={{ height: 56, marginTop: 24, opacity: errors.length ? 0.5 : 1 }} onPress={save} />
      </ScrollView>
    </View>
  );
}
