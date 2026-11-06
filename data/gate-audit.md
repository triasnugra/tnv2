# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-06T01:56:12.891Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 5. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 214 | 124 | 35/73 | 32% [24%-42%] | +0.02 | [-0.42, +0.54] | +1.93 | 31.6 |
| Lolos gerbang (tiruan) | 39 | 29 | 13/12 | 52% [33%-70%] | +0.54 | [-0.13, +1.10] | +15.75 | 4.1 |
| Ditolak gerbang (tiruan) | 175 | 95 | 22/61 | 27% [18%-37%] | -0.15 | [-0.48, +0.39] | -13.82 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 132 | 52 | 16/29 | 36% [23%-50%] | +0.09 | [-0.45, +0.60] | +4.79 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 93 | 70 | 12/49 | 20% [12%-31%] | -0.32 | [-0.57, +0.19] | -22.63 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 86 (selesai 43, terisi 40 dari syarat 150; minggu 2 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
