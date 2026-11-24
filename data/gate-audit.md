# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-24T15:10:58.137Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 8. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 315 | 173 | 50/96 | 34% [27%-42%] | +0.06 | [-0.25, +0.45] | +9.73 | 31.6 |
| Lolos gerbang (tiruan) | 58 | 38 | 17/14 | 55% [38%-71%] | +0.59 | [+0.01, +1.06] | +22.44 | 4.1 |
| Ditolak gerbang (tiruan) | 257 | 135 | 33/82 | 29% [21%-38%] | -0.09 | [-0.36, +0.28] | -12.71 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 200 | 82 | 25/43 | 37% [26%-49%] | +0.09 | [-0.20, +0.42] | +7.57 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 126 | 94 | 17/63 | 21% [14%-31%] | -0.29 | [-0.50, +0.03] | -26.98 | 34.2 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 188 (selesai 158, terisi 89 dari syarat 150; minggu 5 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
