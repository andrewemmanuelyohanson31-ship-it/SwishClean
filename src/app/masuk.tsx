// App_00_Masuk_Pelanggan (Figma 17:4) + App_00_Masuk_Mitra_ART (17:88) — same screen, role toggle.
import { ComponentRef, FC, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { SvgProps } from "react-native-svg";
import { Role, session } from "@/data/session";
import { icons } from "@/icons";
import { C, F } from "@/theme";
import { Button, T, useInsets } from "@/ui";

const ROLES: { id: Role; title: string; desc: string; Icon: FC<SvgProps> }[] = [
  { id: "pelanggan", title: "Pelanggan", desc: "Pesan ART &\natur jadwal", Icon: icons.navHomeOn },
  { id: "mitra", title: "Mitra ART", desc: "Terima order &\natur kerja", Icon: icons.briefcase },
];

/** "SwishClean" wordmark; the "i" is drawn as a little broom (4 Figma vectors). */
function Wordmark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }} accessibilityLabel="SwishClean">
      <T b size={32} color={C.white}>Sw</T>
      <View style={{ width: 6.75, height: 48 }}>
        <icons.iDot style={s.iPart} />
        <icons.iStem style={[s.iPart, { top: 15.9 }]} />
        <icons.iBand style={{ position: "absolute", left: 0, top: 25.2 }} />
        <icons.iBroom style={{ position: "absolute", left: -1.6, top: 26.8 }} />
      </View>
      <T b size={32} color={C.white}>sh</T>
      <T b size={32} color={C.mint}>Clean</T>
    </View>
  );
}

export default function Masuk() {
  const { peran } = useLocalSearchParams<{ peran?: Role }>();
  const { top, bottom } = useInsets();
  const [role, setRole] = useState<Role>(peran === "mitra" ? "mitra" : "pelanggan");
  const [phone, setPhone] = useState("+62 812 •••• 4410");
  const [otp, setOtp] = useState("739152");
  const [wait, setWait] = useState(42);
  const otpRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const masuk = () => {
    // shortcut: any 6-digit code is accepted; verify the OTP server-side before going live.
    if (otp.length !== 6) return otpRef.current?.focus();
    session.role = role;
    session.phone = phone;
    router.replace(role === "mitra" ? "/mitra" : "/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <StatusBar style="light" />
      <View style={s.blob} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[s.header, { paddingTop: top + 27 }]}>
          <icons.logoLg />
          <View style={{ marginTop: 16 }}><Wordmark /></View>
          <T size={12} color={C.greet} style={{ marginTop: 6 }}>Satu aplikasi untuk pelanggan & mitra ART</T>
        </View>

        <View style={[s.sheet, { paddingBottom: bottom + 18 }]}>
          <T b size={22} accessibilityRole="header">Masuk ke SwishClean</T>
          <T size={13} color={C.muted}>Pilih peranmu, beranda akan menyesuaikan.</T>

          <View style={s.roles} accessibilityRole="radiogroup">
            {ROLES.map(({ id, title, desc, Icon }) => {
              const on = id === role;
              return (
                <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setRole(id)} style={[s.role, on ? s.roleOn : s.roleOff]}>
                  <View style={[s.roleIcon, { backgroundColor: on ? C.white : C.bg }]}><Icon /></View>
                  {on ? <View style={s.check}><icons.checkSm /></View> : <View style={s.radio} />}
                  <T b size={15} style={{ marginTop: 11 }}>{title}</T>
                  <T size={11} color={C.muted} style={{ lineHeight: 15, marginTop: 1 }}>{desc}</T>
                </Pressable>
              );
            })}
          </View>

          <T size={13} color={C.muted} style={{ marginTop: 20 }}>Nomor HP</T>
          <View style={s.field}>
            <icons.phonePrimary />
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" accessibilityLabel="Nomor HP" style={s.input} />
          </View>

          <T size={13} color={C.muted} style={{ marginTop: 15 }}>Kode OTP (dikirim via SMS)</T>
          <Pressable style={s.otpRow} onPress={() => otpRef.current?.focus()} accessibilityLabel="Kode OTP">
            {Array.from({ length: 6 }, (_, i) => (
              <View key={i} style={[s.otpBox, i === Math.min(otp.length, 5) && { borderColor: C.primary }]}>
                <T b size={18}>{otp[i] ?? ""}</T>
              </View>
            ))}
            <TextInput
              ref={otpRef}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              maxLength={6}
              style={s.hiddenInput}
            />
          </Pressable>
          <T size={12} color={wait ? C.faint : C.primary} style={{ textAlign: "right", marginTop: 10 }} onPress={wait ? undefined : () => setWait(42)}>
            {wait ? `Kirim ulang 00:${String(wait).padStart(2, "0")}` : "Kirim ulang kode"}
          </T>

          <Button title={`Masuk sebagai ${role === "mitra" ? "Mitra ART" : "Pelanggan"}`} size={16} style={{ height: 56, marginTop: 18 }} onPress={masuk} />
          <T size={13} color={C.primary} style={{ textAlign: "center", marginTop: 23 }} accessibilityRole="link"
            onPress={() => router.push(role === "mitra" ? "/mitra/daftar" : "/daftar")}>
            Belum punya akun? Daftar
          </T>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  blob: { position: "absolute", left: 270, top: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "#124B54" },
  header: { alignItems: "center", height: 246 },
  iPart: { position: "absolute", left: 0.35, top: 8 },
  sheet: { flex: 1, backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 28 },
  roles: { flexDirection: "row", gap: 12, marginTop: 11 },
  role: { flex: 1, height: 128, borderRadius: 18, paddingHorizontal: 15, paddingTop: 15 },
  roleOn: { backgroundColor: C.mintBg, borderWidth: 2, borderColor: C.primary },
  roleOff: { backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  check: { position: "absolute", right: 11, top: 11, width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  radio: { position: "absolute", right: 12.5, top: 12.5, width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.faint, backgroundColor: C.white },
  field: { flexDirection: "row", alignItems: "center", height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, marginTop: 6, paddingLeft: 15 },
  input: { flex: 1, marginLeft: 13.5, fontFamily: F.reg, fontSize: 15, color: C.ink, paddingVertical: 0, outlineStyle: "none" } as object,
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  otpBox: { width: 50.3, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
});
