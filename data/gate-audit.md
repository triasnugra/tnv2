# Audit gerbang kualitas Mesin 2 v2

Dibuat 2026-11-05T07:10:25.146Z. Biaya: 0.15% per trade pulang-pergi.

## A. Audit retrospektif (IN-SAMPLE, bukan bukti)

> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).

Minggu independen di data ini: 5. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| Semua sinyal v1 (setelah dedupe) | 200 | 119 | 30/73 | 29% [21%-39%] | -0.07 | [-0.42, +0.35] | -7.87 | 31.6 |
| Lolos gerbang (tiruan) | 38 | 29 | 13/12 | 52% [33%-70%] | +0.54 | [-0.13, +1.10] | +15.75 | 4.1 |
| Ditolak gerbang (tiruan) | 162 | 90 | 17/61 | 22% [14%-32%] | -0.26 | [-0.48, +0.08] | -23.61 | 33.3 |

### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)

| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |
|---|---|---|---|---|---|---|---|---|
| ENTRY_TERLALU_JAUH | 119 | 47 | 11/29 | 28% [16%-43%] | -0.11 | [-0.45, +0.13] | -5.01 | 9.2 |
| MELAWAN_TREN_TANPA_KONFLUENSI | 91 | 69 | 11/49 | 18% [11%-30%] | -0.36 | [-0.57, +0.08] | -24.58 | 32.8 |

Bacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.

## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)

- Kandidat v1 yang punya keputusan gerbang: 69 (selesai 35, terisi 32 dari syarat 150; minggu 2 dari 20)

**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. `--peek` tersedia tetapi hasilnya TIDAK SAH.
