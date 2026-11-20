# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-20T12:41:23.959Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 7. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 292 | 157 | 42/88 | 32% [25%-41%] | +0.01 | [-0.32, +0.41] | +2.24 | 31.6 |
| Lolos gerbang (tiruan) | 53 | 35 | 15/13 | 54% [36%-70%] | +0.56 | [-0.08, +1.09] | +19.50 | 4.1 |
| Ditolak gerbang (tiruan) | 239 | 122 | 27/75 | 26% [19%-36%] | -0.14 | [-0.40, +0.25] | -17.26 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 186 | 74 | 21/39 | 35% [24%-48%] | +0.05 | [-0.27, +0.38] | +3.83 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 118 | 86 | 13/59 | 18% [11%-28%] | -0.36 | [-0.58, -0.03] | -30.66 | 33.9 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 163 (selesai 127, terisi 73 dari syarat 150; minggu 4 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
