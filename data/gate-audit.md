# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-11T22:38:21.034Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 6. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 236 | 138 | 38/78 | 33% [25%-42%] | +0.03 | [-0.36, +0.53] | +3.48 | 31.6 |
| Lolos gerbang (tiruan) | 40 | 33 | 13/13 | 50% [32%-68%] | +0.47 | [-0.23, +0.91] | +15.59 | 4.1 |
| Ditolak gerbang (tiruan) | 196 | 105 | 25/65 | 28% [20%-38%] | -0.12 | [-0.43, +0.40] | -12.11 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 151 | 62 | 19/33 | 37% [25%-50%] | +0.10 | [-0.29, +0.54] | +6.49 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 99 | 75 | 13/51 | 20% [12%-32%] | -0.31 | [-0.55, +0.20] | -23.12 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 106 (selesai 75, terisi 52 dari syarat 150; minggu 3 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
