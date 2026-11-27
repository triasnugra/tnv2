# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-27T13:00:30.875Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 8. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 341 | 183 | 54/96 | 36% [29%-44%] | +0.11 | [-0.22, +0.49] | +19.66 | 31.6 |
| Lolos gerbang (tiruan) | 62 | 44 | 18/14 | 56% [39%-72%] | +0.60 | [+0.06, +1.00] | +26.21 | 4.1 |
| Ditolak gerbang (tiruan) | 279 | 139 | 36/82 | 31% [23%-39%] | -0.05 | [-0.33, +0.35] | -6.54 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 221 | 86 | 28/43 | 39% [29%-51%] | +0.16 | [-0.15, +0.51] | +13.74 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 129 | 96 | 19/63 | 23% [15%-33%] | -0.24 | [-0.47, +0.14] | -23.06 | 34.2 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 213 (selesai 171, terisi 98 dari syarat 150; minggu 5 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
