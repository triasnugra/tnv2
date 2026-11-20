# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-20T03:40:52.303Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 7. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 292 | 154 | 41/86 | 32% [25%-41%] | +0.02 | [-0.33, +0.42] | +2.32 | 31.6 |
| Lolos gerbang (tiruan) | 53 | 35 | 15/13 | 54% [36%-70%] | +0.56 | [-0.08, +1.09] | +19.50 | 4.1 |
| Ditolak gerbang (tiruan) | 239 | 119 | 26/73 | 26% [19%-36%] | -0.14 | [-0.42, +0.25] | -17.18 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 186 | 71 | 20/37 | 35% [24%-48%] | +0.06 | [-0.29, +0.41] | +3.92 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 118 | 85 | 13/58 | 18% [11%-29%] | -0.35 | [-0.56, -0.01] | -29.61 | 32.9 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 163 (selesai 124, terisi 70 dari syarat 150; minggu 4 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
