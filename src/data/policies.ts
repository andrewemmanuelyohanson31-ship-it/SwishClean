// Policy copy. DRAFT — written from the promises shown in the app UI; must be reviewed by a lawyer before launch.
export const POLICIES: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  refund: {
    title: "Kebijakan refund",
    sections: [
      { h: "Pembatalan oleh pelanggan", p: "Batal gratis hingga 24 jam sebelum jadwal. Pembatalan kurang dari 24 jam dikenakan biaya 50% jasa ART untuk menghargai waktu ART." },
      { h: "ART batal atau tidak datang", p: "Kamu bisa memilih ART pengganti di hari yang sama (rating ≥ 4.7) atau refund penuh ke metode bayar asal." },
      { h: "Hasil tidak sesuai", p: "Ajukan komplain maksimal 24 jam setelah pekerjaan selesai, sertakan foto bila ada. Keputusan maksimal 24 jam." },
      { h: "Waktu pencairan", p: "Refund cair 1–3 hari kerja ke metode bayar asal. Biaya layanan ikut dikembalikan bila kesalahan dari pihak ART." },
    ],
  },
  "tanggung-jawab": {
    title: "Kebijakan tanggung jawab",
    sections: [
      { h: "Peran SwishClean", p: "SwishClean mempertemukan pelanggan dengan mitra ART terverifikasi (KTP, foto wajah, SKCK, pelatihan)." },
      { h: "Kewajiban pelanggan", p: "Menyediakan akses rumah sesuai jadwal, menyimpan barang berharga, dan memberi tahu kondisi khusus (hewan, alergi, area terlarang)." },
      { h: "Kewajiban mitra ART", p: "Bekerja sesuai daftar tugas, menjaga privasi rumah, dan melaporkan kerusakan segera melalui aplikasi." },
      { h: "Pelaporan", p: "Laporkan masalah lewat Komplain atau CS 24 jam. Jangan bertransaksi di luar aplikasi agar tetap terlindungi." },
    ],
  },
  asuransi: {
    title: "Asuransi kerusakan",
    sections: [
      { h: "Perlindungan", p: "Kerusakan barang yang terbukti disebabkan ART selama pekerjaan ditanggung hingga Rp10 juta per kejadian." },
      { h: "Cara klaim", p: "Ajukan dalam 24 jam setelah pekerjaan selesai melalui Komplain > Ada barang rusak / hilang, sertakan foto dan perkiraan nilai." },
      { h: "Pengecualian", p: "Barang berharga yang tidak disimpan (uang tunai, perhiasan), keausan wajar, dan kerusakan yang sudah ada sebelumnya." },
    ],
  },
  "kontrak-mitra": {
    title: "Kebijakan & kontrak mitra",
    sections: [
      { h: "Upah", p: "Mitra menerima 100% upah jasa. Biaya layanan dibayar pelanggan. Saldo bisa ditarik kapan saja, cair 1×24 jam." },
      { h: "Ketersediaan", p: "Mitra mengatur hari, jam kerja, dan maksimal order per hari sendiri. Libur diajukan minimal 3 hari sebelumnya." },
      { h: "Pembatalan oleh mitra", p: "Pembatalan mendadak (< 24 jam) dicatat di profil. Tiga catatan dalam 30 hari dapat membatasi order baru." },
      { h: "Keselamatan", p: "Asuransi kerja aktif selama pekerjaan. Gunakan tombol darurat 24 jam bila merasa tidak aman." },
    ],
  },
};
