# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-16T15:24:43.537Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 6. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 265 | 146 | 40/82 | 33% [25%-42%] | +0.04 | [-0.32, +0.50] | +5.75 | 31.6 |
| Lolos gerbang (tiruan) | 43 | 34 | 14/13 | 52% [34%-69%] | +0.52 | [-0.15, +1.03] | +17.54 | 4.1 |
| Ditolak gerbang (tiruan) | 222 | 112 | 26/69 | 27% [19%-37%] | -0.11 | [-0.40, +0.34] | -11.79 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 173 | 66 | 20/35 | 36% [25%-50%] | +0.11 | [-0.26, +0.50] | +7.20 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 110 | 79 | 13/54 | 19% [12%-30%] | -0.31 | [-0.54, +0.11] | -24.56 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 138 (selesai 110, terisi 62 dari syarat 150; minggu 3 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
