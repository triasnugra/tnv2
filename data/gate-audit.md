# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-10-30T10:36:14.365Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 4. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 176 | 105 | 26/63 | 29% [21%-39%] | -0.05 | [-0.33, +0.47] | -5.37 | 31.6 |
| Lolos gerbang (tiruan) | 31 | 24 | 12/8 | 60% [39%-78%] | +0.75 | [+0.40, +1.64] | +17.91 | 3.3 |
| Ditolak gerbang (tiruan) | 145 | 81 | 14/55 | 20% [12%-31%] | -0.29 | [-0.45, +0.05] | -23.28 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 103 | 39 | 8/24 | 25% [13%-42%] | -0.15 | [-0.35, +0.05] | -5.71 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 87 | 66 | 9/48 | 16% [9%-27%] | -0.42 | [-0.57, -0.13] | -27.47 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 51 (selesai 17, terisi 17 dari syarat 150; minggu 0 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
