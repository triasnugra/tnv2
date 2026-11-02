# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-02T21:07:14.687Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 4. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 191 | 111 | 29/66 | 31% [22%-40%] | -0.02 | [-0.33, +0.47] | -2.62 | 31.6 |
| Lolos gerbang (tiruan) | 35 | 25 | 12/9 | 57% [37%-76%] | +0.67 | [+0.40, +1.28] | +16.86 | 3.3 |
| Ditolak gerbang (tiruan) | 156 | 86 | 17/57 | 23% [15%-34%] | -0.23 | [-0.45, +0.21] | -19.48 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 114 | 44 | 11/26 | 30% [17%-46%] | -0.04 | [-0.35, +0.32] | -1.91 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 88 | 68 | 11/48 | 19% [11%-30%] | -0.35 | [-0.56, +0.12] | -23.54 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 63 (selesai 24, terisi 24 dari syarat 150; minggu 0 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
