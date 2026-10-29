# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-10-29T14:33:31.632Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 4. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 154 | 89 | 18/57 | 24% [16%-35%] | -0.18 | [-0.36, +0.28] | -16.31 | 31.6 |
| Lolos gerbang (tiruan) | 29 | 19 | 9/8 | 53% [31%-74%] | +0.55 | [+0.33, +1.36] | +10.45 | 3.3 |
| Ditolak gerbang (tiruan) | 125 | 70 | 9/49 | 16% [8%-27%] | -0.38 | [-0.52, -0.09] | -26.76 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 83 | 32 | 5/20 | 20% [9%-39%] | -0.23 | [-0.62, +0.03] | -7.39 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 82 | 57 | 6/42 | 13% [6%-25%] | -0.47 | [-0.63, -0.07] | -27.04 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 22 (selesai 1, terisi 1 dari syarat 150; minggu 0 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
