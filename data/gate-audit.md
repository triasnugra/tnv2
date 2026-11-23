# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-23T19:10:35.446Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 7. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 303 | 172 | 49/96 | 34% [27%-42%] | +0.05 | [-0.26, +0.41] | +7.77 | 31.6 |
| Lolos gerbang (tiruan) | 54 | 38 | 17/14 | 55% [38%-71%] | +0.59 | [+0.01, +1.06] | +22.44 | 4.1 |
| Ditolak gerbang (tiruan) | 249 | 134 | 32/82 | 28% [21%-37%] | -0.11 | [-0.37, +0.24] | -14.68 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 195 | 81 | 24/43 | 36% [25%-48%] | +0.07 | [-0.22, +0.38] | +5.61 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 120 | 94 | 17/63 | 21% [14%-31%] | -0.29 | [-0.50, +0.03] | -26.98 | 34.2 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 174 (selesai 157, terisi 88 dari syarat 150; minggu 4 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
