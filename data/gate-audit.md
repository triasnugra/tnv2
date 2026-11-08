# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-08T00:59:23.010Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 5. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 221 | 129 | 35/73 | 32% [24%-42%] | +0.02 | [-0.42, +0.50] | +2.84 | 31.6 |
| Lolos gerbang (tiruan) | 40 | 32 | 13/12 | 52% [33%-70%] | +0.52 | [-0.13, +0.91] | +16.62 | 4.1 |
| Ditolak gerbang (tiruan) | 181 | 97 | 22/61 | 27% [18%-37%] | -0.14 | [-0.48, +0.37] | -13.78 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 138 | 54 | 16/29 | 36% [23%-50%] | +0.09 | [-0.45, +0.54] | +4.82 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 94 | 71 | 12/49 | 20% [12%-31%] | -0.32 | [-0.57, +0.16] | -22.97 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 96 (selesai 62, terisi 44 dari syarat 150; minggu 2 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
