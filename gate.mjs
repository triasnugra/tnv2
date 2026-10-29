// Gerbang kualitas Mesin 2 v2. Fungsi murni (tanpa jaringan), dipakai bersama oleh
// scripts/jurnal.mjs (pencatatan), index.html (dashboard) dan scripts/audit-gate.mjs.
//
// Prinsip desain:
//  - Gerbang ini berdiri DI ATAS feat() di core.mjs. core.mjs dan trade-sim.mjs TIDAK diubah, jadi
//    logika entry/SL/TP dan penilaian TP/SL yang sudah dicek manual di TradingView tetap sama persis,
//    dan hash forward test v1 tetap valid.
//  - Gerbang hanya MENOLAK setup. Ia tidak pernah membuat atau mengubah angka entry/SL/TP.
//  - Semua ambang ada di CFG (satu tempat). Mengubah CFG = mesin v2 berubah = protokol baru.
//  - Tiap penolakan punya kode alasan, supaya bisa diaudit: apakah yang ditolak memang lebih sering rugi?

export const CFG = Object.freeze({
  versi: 2,
  maxSlPct: 15,              // SL lebih lebar dari ini ditolak (aturan Eliz: swing maks 15%)
  minRR: 1.5,                // TP minimal 1,5x jarak SL
  minQuoteVolUsd: 2e7,       // volume dolar harian kemarin; di bawah ini slippage uang nyata tidak realistis
  maxDistPct: 3,             // entry limit maksimal 3% dari harga saat scan; lebih jauh = order menggantung
  staleDays: 5,              // bila dalam 5 candle harian tertutup terakhir harga sudah menyentuh TP, setup sudah "terlambat"
  maxTriggerAgeDays: 2,      // sweep Monday / deviasi harus terjadi maksimal 2 hari lalu
  counterTrendMinTriggers: 2,// melawan tren makro hanya boleh bila >= 2 pemicu independen
  btcGate: true,             // altcoin tidak boleh berlawanan arah dengan tren makro BTC
  maxSignalsPerScan: 5,      // batas sinyal baru per hari: sinyal sehari saling berkorelasi (satu rezim pasar)
  maxSameSidePerScan: 4,
});

// Hipotesis dicatat DI MUKA (masuk ke data/forward-protocol-v2.json). Alasan tiap aturan: lihat UPGRADE-V2.md.
export const HIPOTESIS = [
  'H1 (validitas): setup dengan symbol kosong/aneh, angka tidak terhingga, urutan entry/SL/TP salah, SL > 15% atau RR < 1,5 tidak pernah dicatat.',
  'H2 (basi): setup yang harganya sudah menyentuh TP dalam 5 hari tertutup terakhir, atau pemicunya (sweep Monday/deviasi) lebih dari 2 hari lalu, memberi hasil lebih buruk daripada setup segar.',
  'H3 (tren): setup melawan tren makro tanpa >= 2 pemicu independen memberi R/trade lebih buruk daripada setup searah tren.',
  'H4 (BTC): altcoin yang berlawanan dengan tren makro BTC memberi R/trade lebih buruk (aturan Eliz "BTC adalah gerbang", dipakai simetris untuk long dan short).',
  'H5 (eksekusi): entry limit lebih dari 3% dari harga scan lebih sering tidak terisi atau terisi di rezim berbeda; maksimal 5 sinyal baru per hari karena sinyal sehari saling berkorelasi.',
  'Keputusan: v2 dianggap lebih baik dari v1 hanya bila v2 LULUS (CI 95% bawah R/trade > 0 setelah biaya pada >= 150 trade dan >= 20 minggu) dan R/trade v2 lebih tinggi dari v1 pada periode yang sama. Selain itu v2 tidak dipakai.',
];

const ok = x => Number.isFinite(+x) && x !== '' && x !== null;
export const SYMBOL_RE = /^[A-Z0-9]{2,15}$/;

// ---------- statistik kecil ----------
// Interval Wilson 95% untuk proporsi (win rate). Jauh lebih jujur daripada angka tunggal pada sampel kecil.
export function wilson(k, n, z = 1.96) {
  if (!n) return null;
  const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { p, lo: Math.max(0, (c - m) / d), hi: Math.min(1, (c + m) / d), n };
}
// Win rate impas untuk RR tertentu setelah biaya (biayaR = biaya dalam satuan R, mis. 0,03).
export const breakevenWin = (rr = 2, biayaR = 0) => (1 + biayaR) / (rr + 1);

// ---------- 1) validasi dini ----------
export function validateSymbol(s) {
  if (s === undefined || s === null || String(s).trim() === '') return 'SYMBOL_KOSONG';
  if (!SYMBOL_RE.test(String(s))) return 'SYMBOL_ANEH';
  return null;
}

// Memeriksa kebersihan data dan geometri setup. Tidak memakai pendapat strategi apa pun.
export function validateSetup(f, cfg = CFG) {
  const R = [], sy = validateSymbol(f.s);
  if (sy) R.push(sy);
  if (![f.px, f.entry, f.sl, f.tp].every(ok) || !(f.px > 0) || !(f.entry > 0)) { R.push('DATA_TIDAK_VALID'); return R; }
  const s = f.side;
  if (s !== 1 && s !== -1) { R.push('ARAH_TIDAK_VALID'); return R; }
  if (!(s * (f.entry - f.sl) > 0 && s * (f.tp - f.entry) > 0)) { R.push('URUTAN_HARGA_SALAH'); return R; }
  const slp = (Math.abs(f.entry - f.sl) / f.entry) * 100, rr = Math.abs(f.tp - f.entry) / Math.abs(f.entry - f.sl);
  if (slp > cfg.maxSlPct) R.push('SL_TERLALU_LEBAR');
  if (rr < cfg.minRR) R.push('RR_KURANG');
  if (ok(f.qv) && f.qv < cfg.minQuoteVolUsd) R.push('VOLUME_TIPIS');
  return R;
}

// ---------- 2) setup basi ----------
// Candle k = f.k (90 candle terakhir, yang terakhir adalah candle sintetis hari ini berisi harga open saja).
const closedTail = (f, n) => (f.k || []).slice(-1 - n, -1);
export function staleTp(f, cfg = CFG) {
  const c = closedTail(f, cfg.staleDays);
  if (!c.length) return false;
  return f.side === 1 ? c.some(q => q.h >= f.tp) : c.some(q => q.l <= f.tp);
}
// Umur pemicu (hari) untuk pemicu yang bisa "menggantung" beberapa hari: sweep Monday dan deviasi.
// null bila tidak berlaku atau tidak ditemukan.
export function triggerAge(f) {
  const lvl = f.trig === 'mon' ? (f.side === 1 ? f.monL : f.monH) : f.trig === 'dev' ? (f.side === 1 ? f.L : f.H) : null;
  if (!ok(lvl)) return null;
  const c = closedTail(f, 7);
  for (let i = c.length - 1; i >= 0; i--) {
    const q = c[i];
    if (f.side === 1 ? q.l < lvl && q.c > lvl : q.h > lvl && q.c < lvl) return c.length - 1 - i;
  }
  return null;
}

// ---------- 3) pemicu independen ----------
const GROUPS = [['dd', /^Double Deviation/], ['three', /^Three (Tap|Top)/], ['dev', /^(deviasi|Deviasi)/], ['zone', /retest zona/], ['mon', /Monday/], ['bo', /ber-close, retest/], ['wolf', /^Wolf/], ['fib', /^Fib 0\.75/]];
export function distinctTriggers(why = []) {
  const g = new Set();
  for (const w of why) for (const [k, re] of GROUPS) if (re.test(w)) g.add(k === 'three' ? 'dev' : k); // Three Tap/Top = deviasi yang sama
  return g.size;
}
export function score(f) {
  return distinctTriggers(f.why) + (f.obvDiv === f.side ? 1 : 0) + (f.rsiDiv === f.side ? 1 : 0) + (f.tr === f.side ? 1 : 0);
}

// ---------- 4) evaluasi satu setup ----------
// f   : hasil feat() + f.s (simbol). ctx: { btc: hasil feat() BTC }.
// Hasil: { ok, reasons:[kode], score }
export function evaluate(f, ctx = {}, cfg = CFG) {
  const reasons = validateSetup(f, cfg);
  if (reasons.length && reasons.some(r => r === 'SYMBOL_KOSONG' || r === 'SYMBOL_ANEH' || r === 'DATA_TIDAK_VALID' || r === 'ARAH_TIDAK_VALID' || r === 'URUTAN_HARGA_SALAH'))
    return { ok: false, reasons, score: 0 };
  const sc = score(f);
  const dist = Math.abs(f.px - f.entry) / f.px * 100;
  if (dist > cfg.maxDistPct) reasons.push('ENTRY_TERLALU_JAUH');
  if (staleTp(f, cfg)) reasons.push('SETUP_BASI_TP_SUDAH_TERSENTUH');
  const age = triggerAge(f);
  if (age !== null && age > cfg.maxTriggerAgeDays) reasons.push('TRIGGER_BASI');
  if (f.tr !== f.side && distinctTriggers(f.why) < cfg.counterTrendMinTriggers) reasons.push('MELAWAN_TREN_TANPA_KONFLUENSI');
  if (cfg.btcGate && f.s !== 'BTC') {
    if (!ctx.btc || !ok(ctx.btc.tr)) reasons.push('BTC_TIDAK_TERSEDIA'); // gagal tertutup: tanpa data BTC tidak ada sinyal
    else if (ctx.btc.tr === -f.side) reasons.push('MELAWAN_BTC');
  }
  return { ok: !reasons.length, reasons, score: sc };
}

// ---------- 5) batas portofolio per scan ----------
// items: [{ f, g }] yang sudah lolos evaluate(). already: { total, long, short } sinyal v2 yang sudah dicatat hari ini.
// Urutan: skor tertinggi, lalu entry terdekat, lalu simbol (deterministik, hasil sama di run mana pun).
export function selectDaily(items, already = {}, cfg = CFG) {
  const sorted = [...items].sort((a, b) => b.g.score - a.g.score || Math.abs(a.f.px - a.f.entry) / a.f.px - Math.abs(b.f.px - b.f.entry) / b.f.px || String(a.f.s).localeCompare(String(b.f.s)));
  let tot = already.total || 0, lg = already.long || 0, sh = already.short || 0;
  const keep = [], drop = [];
  for (const it of sorted) {
    const isL = it.f.side === 1;
    if (tot >= cfg.maxSignalsPerScan || (isL ? lg : sh) >= cfg.maxSameSidePerScan) { drop.push({ item: it, reason: 'DI_LUAR_BATAS_HARIAN' }); continue; }
    keep.push(it); tot++; if (isL) lg++; else sh++;
  }
  return { keep, drop };
}

// ---------- 6) ukuran posisi dan kesiapan uang nyata ----------
export const RISK_CAP = Object.freeze({ belumLulus: 0.25, lulus: 1, risikoTerbukaMaks: 3 });
// riskPct yang diminta dibatasi: 0,25% selama forward test belum lulus, 1% sesudahnya.
export function riskPlan({ capital, riskPct, entry, sl, lulus = false }) {
  const cap = lulus ? RISK_CAP.lulus : RISK_CAP.belumLulus, req = +riskPct || 0, eff = Math.min(req, cap), notes = [];
  if (!(capital > 0) || !(entry > 0) || !(sl > 0) || entry === sl) return { riskPctEff: 0, riskUsd: 0, qty: 0, notional: 0, leverage: 0, notes: ['data posisi tidak lengkap'] };
  if (req > cap) notes.push(`risiko dibatasi ${cap}% (diminta ${req}%)${lulus ? '' : ': forward test belum lulus'}`);
  const riskUsd = capital * eff / 100, qty = riskUsd / Math.abs(entry - sl), notional = qty * entry, leverage = notional / capital;
  if (leverage > 1.05) notes.push(`leverage ${leverage.toFixed(1)}x`);
  return { riskPctEff: eff, riskUsd, qty, notional, leverage, notes };
}

// Daftar periksa kesiapan uang nyata dari laporan forward test v2 (data/forward-report-v2.json).
export function readiness(a) {
  if (!a) return { lulus: false, items: [{ ok: false, t: 'Forward test v2 belum berjalan (laporan tidak ditemukan)' }] };
  const p = a.progress || {}, items = [
    { ok: !!(a.chain && a.chain.ok), t: 'Integritas jurnal (rantai hash) utuh' },
    { ok: !!p.trade_terisi && p.trade_terisi[0] >= p.trade_terisi[1], t: `Trade terisi ${p.trade_terisi ? p.trade_terisi[0] + ' dari ' + p.trade_terisi[1] : '-'}` },
    { ok: !!p.minggu && p.minggu[0] >= p.minggu[1], t: `Minggu berbeda ${p.minggu ? p.minggu[0] + ' dari ' + p.minggu[1] : '-'}` },
    { ok: !!(a.ready && a.verdict && a.verdict.pass === true), t: a.ready ? (a.verdict && a.verdict.pass ? 'CI 95% bawah R/trade > 0: LULUS' : 'CI 95% bawah R/trade tidak > 0: TIDAK LULUS') : 'Keputusan menunggu syarat di atas' },
  ];
  return { lulus: items.every(i => i.ok), items };
}
