# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-11T00:49:40.713Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 5. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 236 | 135 | 36/77 | 32% [24%-41%] | +0.00 | [-0.41, +0.45] | +0.60 | 31.6 |
| Lolos gerbang (tiruan) | 40 | 33 | 13/13 | 50% [32%-68%] | +0.47 | [-0.23, +0.91] | +15.59 | 4.1 |
| Ditolak gerbang (tiruan) | 196 | 102 | 23/64 | 26% [18%-37%] | -0.15 | [-0.47, +0.33] | -14.99 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 151 | 59 | 17/32 | 35% [23%-49%] | +0.06 | [-0.40, +0.47] | +3.62 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 99 | 74 | 12/51 | 19% [11%-30%] | -0.34 | [-0.57, +0.08] | -25.09 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 106 (selesai 71, terisi 49 dari syarat 150; minggu 2 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
