// Tarik dana (no Figma frame — Pendapatan saldo card + Daftar form field + Komplain policy box)
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { rupiah } from "@/data/arts";
import { pushPayout } from "@/data/remote";
import { setState, showToast, useStore } from "@/data/store";
import { icons } from "@/icons";
import { C } from "@/theme";
import { Button, Chip, Field, T, TopBar, useInsets, goBack } from "@/ui";

const MIN = 50000;

export default function TarikDana() {
  const balance = useStore((s) => s.balance);
  const { bottom } = useInsets();
  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/\D/g, "")) || 0;
  const error = !amount ? "" : amount < MIN ? `Minimal penarikan ${rupiah(MIN)}.` : amount > balance ? "Melebihi saldo yang bisa ditarik." : "";
  const ok = amount >= MIN && amount <= balance;
  const quick = [500000, 1000000, balance].filter((v, i, a) => v >= MIN && v <= balance && a.indexOf(v) === i);

  const [busy, setBusy] = useState(false);
  const submit = () => {
    if (busy) return;
    if (!ok) return showToast(error || "Masukkan jumlah penarikan.");
    setBusy(true);
    // The server checks the amount against finished-job earnings; only deduct locally once it agrees.
    pushPayout(amount).then(() => {
      setState((s) => ({ balance: s.balance - amount, payouts: [{ id: `p${Date.now()}`, amount, at: "Hari ini" }, ...s.payouts] }));
      showToast(`Penarikan ${rupiah(amount)} diproses, cair 1×24 jam`);
      goBack("/mitra/pendapatan");
    }).catch((e) => showToast(/saldo/.test(e?.message ?? "") ? "Saldo di server tidak cukup untuk penarikan ini." : "Penarikan gagal dikirim. Coba lagi.")).finally(() => setBusy(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TopBar title="Tarik dana" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 14, paddingBottom: bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={s.saldo}>
          <T size={12} color={C.greet}>Saldo bisa ditarik</T>
          <T b size={26} color={C.white} style={{ marginTop: 2, lineHeight: 37 }}>{rupiah(balance)}</T>
          <T size={11} color={C.greet}>ke BCA •••• 2201 • a.n. Siti Rahmawati</T>
        </View>

        <Field
          label="Jumlah penarikan"
          icon={<icons.mWallet />}
          value={amount ? rupiah(amount) : ""}
          onChangeText={setRaw}
          placeholder="Rp0"
          keyboardType="number-pad"
          maxLength={14}
          style={{ marginTop: 16 }}
        />
        {error ? <T size={12} color={C.red} style={{ marginTop: 6 }}>{error}</T> : null}
        <View style={s.chips}>
          {quick.map((v) => <Chip key={v} label={v === balance ? "Semua saldo" : rupiah(v)} on={amount === v} onPress={() => setRaw(String(v))} />)}
        </View>

        <View style={s.note}>
          <icons.mShieldMd style={{ marginTop: 2 }} />
          <T size={11} color={C.primaryDark} style={{ flex: 1, marginLeft: 12, lineHeight: 17 }}>
            {`Tanpa biaya admin. Minimal ${rupiah(MIN)}. Cair 1×24 jam ke rekening yang sudah diverifikasi.`}
          </T>
        </View>

        <Button title={ok ? `Tarik ${rupiah(amount)}` : "Tarik dana"} size={16} color={C.navy} style={{ height: 56, marginTop: 24, opacity: ok ? 1 : 0.5 }} onPress={submit} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  saldo: { borderRadius: 20, backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  note: { flexDirection: "row", alignItems: "flex-start", borderRadius: 16, backgroundColor: C.mintBg, marginTop: 16, padding: 15 },
});
