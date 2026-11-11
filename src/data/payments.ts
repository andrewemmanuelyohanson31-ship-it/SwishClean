// Payment methods offered at checkout. shortcut: selection only; charge via a gateway (e.g. Midtrans/Xendit) server-side later.
export const PAYMENTS = [
  { id: "qris", name: "QRIS", desc: "Semua e-wallet & m-banking" },
  { id: "gopay", name: "GoPay", desc: "Bayar langsung dari aplikasi Gojek" },
  { id: "ovo", name: "OVO", desc: "Saldo OVO atau OVO PayLater" },
  { id: "dana", name: "DANA", desc: "Saldo DANA" },
  { id: "va", name: "Transfer Bank (VA)", desc: "BCA, BNI, BRI, Mandiri" },
];
