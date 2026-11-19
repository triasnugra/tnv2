# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-19T22:02:44.702Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 7. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 283 | 153 | 41/85 | 33% [25%-41%] | +0.02 | [-0.32, +0.43] | +3.34 | 31.6 |
| Lolos gerbang (tiruan) | 50 | 35 | 15/13 | 54% [36%-70%] | +0.56 | [-0.08, +1.09] | +19.50 | 4.1 |
| Ditolak gerbang (tiruan) | 233 | 118 | 26/72 | 27% [19%-36%] | -0.14 | [-0.41, +0.26] | -16.16 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 181 | 70 | 20/36 | 36% [24%-49%] | +0.07 | [-0.27, +0.43] | +4.93 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 114 | 84 | 13/57 | 19% [11%-29%] | -0.34 | [-0.55, -0.00] | -28.59 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 155 (selesai 122, terisi 69 dari syarat 150; minggu 4 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
