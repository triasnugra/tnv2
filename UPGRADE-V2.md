# Mesin 2 v2: gerbang kualitas

Tujuan: mengurangi sinyal berkualitas buruk SEBELUM sampai ke jurnal dan ke dompet, tanpa mengubah satu pun angka
entry/SL/TP dan tanpa mengubah aturan penilaian TP/SL yang sudah kamu cek manual di TradingView.

**Yang tidak disentuh:** `core.mjs` (feat), `trade-sim.mjs` (penilaian), `data/journal.json`, `data/forward-protocol.json`.
Hash mesin v1 `0537067ed55fc5be` tetap valid, jadi forward test v1 terus berjalan sah. Ini dijaga oleh uji otomatis
(`scripts/test-gate.mjs` bagian 6).

## Apa yang terlihat di data (monitor 28 Okt dan jurnal)
| Pengamatan | Angka |
|---|---|
| Win rate Mesin 2 | 17 TP / 48 SL = 26,2% [17%-38%]; impas pada RR 2 butuh sekitar 34% |
| LONG vs SHORT | LONG 7,0% (n=43, -34R); SHORT 63,6% (n=22, +20R) |
| "sweep Monday Low lalu reclaim" tanpa konfirmasi lain | 0 menang dari 28, -28R. Tanpa baris itu total R menjadi +14R |
| Jurnal v1 (107 TP/SL): searah tren vs melawan tren | 14/34 (41%) vs 12/73 (16%) |
| Setup berhasil terisi | order limit jauh dari harga sering tidak terisi atau terisi di rezim lain |

Penyebab struktural di `core.mjs`: filter tren memberi pengecualian pada banyak pemicu, termasuk Monday Low, sehingga
LONG melawan tren makro tetap lolos. Aturan Eliz "BTC adalah gerbang" ada di teks prompt dan kartu strategi, tetapi
tidak dikodekan di mesin aturan. `dist` (jarak entry ke harga) dihitung tetapi tidak pernah dipakai untuk menyaring.

## Aturan v2 (hipotesis, dicatat di muka)
| Kode | Aturan | Menjawab |
|---|---|---|
| H1 | Tolak symbol kosong/aneh, angka tidak valid, urutan entry/SL/TP salah, SL > 15%, RR < 1,5, volume harian < $20 juta | INVALID: terdeteksi sebelum masuk jurnal |
| H2 | Tolak bila 5 candle harian tertutup terakhir sudah menyentuh TP, atau pemicu Monday/deviasi lebih dari 2 hari lalu | EXPIRED/noise |
| H3 | Melawan tren makro hanya boleh dengan >= 2 pemicu independen | LONG melawan tren |
| H4 | Altcoin tidak boleh berlawanan dengan tren makro BTC (simetris long/short); data BTC hilang = tidak ada sinyal | Gerbang BTC |
| H5 | Entry maksimal 3% dari harga scan; maksimal 5 sinyal baru per hari (maks 4 searah), urut skor | Order menggantung, sinyal sehari berkorelasi |

Semua ambang ada di `CFG` (gate.mjs). Gerbang hanya menolak; tiap penolakan punya kode alasan di `data/gate-log.json`.

## Cara v2 diuji (jujur tentang batasnya)
- Aturan di atas dirancang setelah melihat 4 minggu data v1. Jadi data itu TIDAK bisa membuktikan v2. Angka retrospektif
  di `data/gate-audit.md` (bagian A) bersifat in-sample dan pasti terlalu optimis.
- Bukti sah baru datang dari **forward test v2** (`data/forward-protocol-v2.json`, dibuat otomatis pada run jurnal
  pertama sesudah deploy): agen "Eliz v2", syarat sama dengan v1 (>= 150 trade terisi, >= 20 minggu, batas bawah CI 95%
  R/trade setelah biaya > 0). Sinyal v1 dan v2 dicatat pada hari yang sama, jadi bisa dibandingkan langsung.
- Karena gerbang menolak, jumlah trade v2 lebih sedikit; syarat 20 minggu tetap yang paling menentukan (paling cepat
  akhir Maret 2027).
- Audit forward (`scripts/audit-gate.mjs`) menunjukkan apakah yang ditolak gerbang memang lebih sering rugi. Sama seperti
  forward test, perbandingannya terkunci sampai syarat terpenuhi.
- **Keputusan:** v2 dipakai hanya bila v2 LULUS dan R/trade v2 lebih tinggi dari v1 pada periode yang sama.

## Uang nyata
Dashboard menampilkan banner MODE UJI selama forward test v2 belum lulus. Kalkulator posisi membatasi risiko 0,25% per
trade (1% sesudah lulus) dan memperingatkan total risiko terbuka di atas 3%. Lulus tidak berarti pasti untung; pasar
berubah dan sampelnya terbatas. Naikkan ukuran posisi bertahap.

## Menjalankan
```
node scripts/test-gate.mjs        # 84 uji: validasi, basi, tren, BTC, batas harian, integrasi jurnal, v1 tidak berubah
node scripts/test-forward.mjs     # 56 uji forward test (lama)
node scripts/test-backtest.mjs    # 69 uji backtester (lama)
node scripts/test-dashboard.mjs   # uji asap index.html
node scripts/audit-gate.mjs       # tulis data/gate-audit.md (tambahkan --peek untuk intip bagian B, TIDAK SAH)
```
Mengubah `gate.mjs` mengubah hash mesin v2. Baris sesudahnya tidak dihitung; untuk ide baru hapus
`data/forward-protocol-v2.json` dan tulis hipotesisnya dulu.

## Belum dikerjakan (sengaja)
- Funding futures belum dimodelkan di biaya. Model eksekusi memakai order limit dengan asumsi terisi saat disentuh.
- Backtest riwayat panjang untuk v2 belum dijalankan: butuh akses Binance (`scripts/backtest.mjs`) yang tidak tersedia
  di lingkungan ini. Jalankan lewat GitHub Actions bila ingin angka historis tambahan; tetap in-sample.
- Circuit breaker otomatis (berhenti setelah rangkaian SL) belum dibuat, karena akan membocorkan hasil sementara
  forward test. Layak ditambahkan setelah v2 lulus.
