# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-14T13:17:08.248Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 6. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 256 | 141 | 38/80 | 32% [24%-41%] | +0.02 | [-0.36, +0.47] | +2.27 | 31.6 |
| Lolos gerbang (tiruan) | 42 | 33 | 13/13 | 50% [32%-68%] | +0.47 | [-0.23, +0.91] | +15.59 | 4.1 |
| Ditolak gerbang (tiruan) | 214 | 108 | 25/67 | 27% [19%-37%] | -0.12 | [-0.42, +0.34] | -13.32 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 166 | 63 | 19/33 | 37% [25%-50%] | +0.12 | [-0.26, +0.55] | +7.33 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 107 | 77 | 13/53 | 20% [12%-31%] | -0.33 | [-0.56, +0.09] | -25.17 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 129 (selesai 99, terisi 56 dari syarat 150; minggu 3 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
