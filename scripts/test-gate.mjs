// Uji otomatis gerbang kualitas Mesin 2 v2 (offline):  node scripts/test-gate.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { kl, feat, scanInput } from '../core.mjs';
import { install, SYMS } from './fake-binance.mjs';
import { CFG, evaluate, validateSymbol, validateSetup, staleTp, triggerAge, distinctTriggers, selectDaily, riskPlan, readiness, wilson, breakevenWin, RISK_CAP, HIPOTESIS } from '../gate.mjs';
import { engineHash, verifyChain, makeProtocol, analyze } from '../forward-lib.mjs';

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  GAGAL', name, extra); } };
const near = (a, b, name, tol = 1e-9) => ok(Math.abs(a - b) < tol, name, `(dapat ${a}, harapan ${b})`);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 864e5;

// setup LONG sehat: harga 100, entry 98 (jarak 2%), SL 94 (4,08%), TP 106 (RR 2), searah tren, dua pemicu
const flat = () => Array.from({ length: 90 }, (_, i) => ({ t: i * DAY, o: 100, h: 101, l: 99, c: 100, v: 1 }));
const mk = (o = {}) => ({
  s: 'ABC', px: 100, side: 1, tr: 1, entry: 98, sl: 94, tp: 106, qv: 5e7, trig: 'dev', L: 97, H: 130, monL: 96, monH: 120,
  why: ['deviasi bawah lalu recovery', 'sweep Monday Low lalu reclaim', 'searah tren'], obvDiv: 0, rsiDiv: 0, k: flat(), ...o,
});
const rs = (f, ctx = { btc: { tr: 1 } }) => evaluate(f, ctx).reasons;

console.log('\n[1] Validasi dini (INVALID tertangkap sebelum masuk jurnal)');
{
  ok(validateSymbol('') === 'SYMBOL_KOSONG' && validateSymbol(undefined) === 'SYMBOL_KOSONG' && validateSymbol('  ') === 'SYMBOL_KOSONG', 'symbol kosong/undefined/spasi ditolak');
  ok(validateSymbol('BTC') === null && validateSymbol('1000PEPE') === null, 'symbol normal lolos');
  ok(validateSymbol('btc usdt') === 'SYMBOL_ANEH' && validateSymbol('A') === 'SYMBOL_ANEH', 'symbol aneh ditolak');
  ok(evaluate(mk({ s: '' })).reasons.includes('SYMBOL_KOSONG') && !evaluate(mk({ s: '' })).ok, 'setup tanpa symbol tidak lolos gerbang');
  ok(rs(mk({ entry: NaN })).includes('DATA_TIDAK_VALID'), 'angka NaN ditolak');
  ok(rs(mk({ tp: Infinity })).includes('DATA_TIDAK_VALID'), 'angka tak terhingga ditolak');
  ok(rs(mk({ sl: 99 + 0, entry: 98 })).includes('URUTAN_HARGA_SALAH'), 'LONG dengan SL di atas entry ditolak');
  ok(rs(mk({ tp: 97 })).includes('URUTAN_HARGA_SALAH'), 'LONG dengan TP di bawah entry ditolak');
  ok(rs(mk({ side: 0 })).includes('ARAH_TIDAK_VALID'), 'arah 0 ditolak');
  ok(rs(mk({ sl: 80, entry: 98, tp: 138 })).includes('SL_TERLALU_LEBAR'), 'SL > 15% ditolak');
  ok(rs(mk({ tp: 99 })).includes('RR_KURANG'), 'RR < 1,5 ditolak');
  ok(rs(mk({ qv: 1e6 })).includes('VOLUME_TIPIS'), 'volume tipis ditolak');
  ok(validateSetup(mk()).length === 0, 'setup sehat tidak punya masalah validasi');
}

console.log('\n[2] Setup basi (EXPIRED/noise)');
{
  const f = mk(), g = evaluate(f, { btc: { tr: 1 } });
  ok(g.ok && g.reasons.length === 0, 'setup sehat LOLOS', JSON.stringify(g));
  const kS = flat(); kS[kS.length - 4].h = 107; // 3 hari lalu high sudah >= TP 106
  ok(staleTp(mk({ k: kS })) && rs(mk({ k: kS })).includes('SETUP_BASI_TP_SUDAH_TERSENTUH'), 'LONG: harga sudah menyentuh TP 3 hari lalu -> basi');
  const kOld = flat(); kOld[kOld.length - 10].h = 107; // 9 hari lalu: di luar jendela 5 hari
  ok(!staleTp(mk({ k: kOld })), 'TP tersentuh 9 hari lalu (di luar jendela) tidak dianggap basi');
  const kCur = flat(); kCur[kCur.length - 1].h = 120; // candle sintetis hari ini tidak boleh dipakai
  ok(!staleTp(mk({ k: kCur })), 'candle hari ini (sintetis) tidak dipakai untuk uji basi');
  const kSh = flat(); kSh[kSh.length - 3].l = 89;
  const sh = mk({ side: -1, tr: -1, entry: 102, sl: 106, tp: 94, k: kSh, trig: 'dev', H: 103, why: ['deviasi atas gagal bertahan', 'sweep Monday High lalu reclaim', 'searah tren'] });
  ok(staleTp(sh) && evaluate(sh, { btc: { tr: -1 } }).reasons.includes('SETUP_BASI_TP_SUDAH_TERSENTUH'), 'SHORT: harga sudah menyentuh TP -> basi');
  // umur pemicu
  const kM = flat(); kM[kM.length - 2] = { ...kM[0], l: 95, c: 98 }; // sweep kemarin (umur 0)
  ok(triggerAge(mk({ trig: 'mon', k: kM })) === 0, 'umur pemicu Monday: sweep candle terakhir tertutup = 0 hari');
  const kM5 = flat(); kM5[kM5.length - 5] = { ...kM5[0], l: 95, c: 98 };
  ok(triggerAge(mk({ trig: 'mon', k: kM5 })) === 3 && rs(mk({ trig: 'mon', k: kM5 })).includes('TRIGGER_BASI'), 'sweep Monday 3 hari lalu -> TRIGGER_BASI');
  ok(triggerAge(mk({ trig: 'zone' })) === null, 'pemicu tanpa umur (zone) tidak dinilai umurnya');
}

console.log('\n[3] Tren, BTC dan jarak entry');
{
  ok(distinctTriggers(['deviasi bawah lalu recovery', 'searah tren']) === 1, 'hanya satu pemicu independen');
  ok(distinctTriggers(['Three Tap: 2 sentuhan lalu manipulasi di bawah', 'deviasi bawah lalu recovery']) === 1, 'Three Tap dan deviasi = kejadian yang sama, tidak dihitung dua kali');
  ok(distinctTriggers(['deviasi bawah lalu recovery', 'sweep Monday Low lalu reclaim', 'OBV divergence']) === 2, 'divergence bukan pemicu; dua pemicu berbeda = 2');
  const one = ['sweep Monday Low lalu reclaim'];
  ok(rs(mk({ tr: -1, why: one, trig: 'mon' })).includes('MELAWAN_TREN_TANPA_KONFLUENSI'), 'melawan tren dengan satu pemicu ditolak');
  ok(!rs(mk({ tr: -1 })).includes('MELAWAN_TREN_TANPA_KONFLUENSI'), 'melawan tren dengan dua pemicu independen boleh');
  ok(rs(mk({ tr: 0, why: one, trig: 'mon' })).includes('MELAWAN_TREN_TANPA_KONFLUENSI'), 'tren netral diperlakukan sama seperti melawan tren');
  ok(!rs(mk({ tr: 1, why: one, trig: 'mon' })).includes('MELAWAN_TREN_TANPA_KONFLUENSI'), 'searah tren dengan satu pemicu boleh');
  ok(rs(mk(), { btc: { tr: -1 } }).includes('MELAWAN_BTC'), 'altcoin LONG saat tren BTC turun ditolak');
  const sh = mk({ side: -1, tr: -1, entry: 102, sl: 106, tp: 94, trig: 'dev', H: 103, why: ['deviasi atas gagal bertahan', 'sweep Monday High lalu reclaim'] });
  ok(rs(sh, { btc: { tr: 1 } }).includes('MELAWAN_BTC') && !rs(sh, { btc: { tr: -1 } }).includes('MELAWAN_BTC'), 'altcoin SHORT saat tren BTC naik ditolak (simetris), searah BTC boleh');
  ok(!rs(mk(), { btc: { tr: 0 } }).includes('MELAWAN_BTC'), 'BTC netral tidak memblokir');
  ok(rs(mk(), {}).includes('BTC_TIDAK_TERSEDIA') && rs(mk(), { btc: { tr: NaN } }).includes('BTC_TIDAK_TERSEDIA'), 'tanpa data BTC: gagal tertutup (tidak ada sinyal)');
  ok(!rs(mk({ s: 'BTC' }), {}).includes('BTC_TIDAK_TERSEDIA'), 'sinyal BTC sendiri tidak butuh gerbang BTC');
  ok(rs(mk({ entry: 94.5, sl: 90, tp: 103.5 })).includes('ENTRY_TERLALU_JAUH'), 'entry limit 5,5% dari harga ditolak');
  ok(!rs(mk({ entry: 97.2, sl: 93, tp: 105.6 })).includes('ENTRY_TERLALU_JAUH'), 'entry limit 2,8% dari harga boleh');
}

console.log('\n[4] Batas portofolio per scan');
{
  const it = (s, side, score, entry = 98) => ({ f: mk({ s, side, entry }), g: { ok: true, reasons: [], score } });
  const items = [it('A', 1, 2), it('B', 1, 5), it('C', 1, 3), it('D', 1, 4), it('E', 1, 1), it('F', -1, 2), it('G', 1, 6)];
  const { keep, drop } = selectDaily(items);
  ok(keep.length === CFG.maxSignalsPerScan, `maksimal ${CFG.maxSignalsPerScan} sinyal per scan`);
  ok(keep.filter(x => x.f.side === 1).length <= CFG.maxSameSidePerScan, `maksimal ${CFG.maxSameSidePerScan} sinyal searah`);
  ok(keep[0].f.s === 'G' && keep[1].f.s === 'B', 'urut skor tertinggi lebih dulu');
  ok(drop.every(d => d.reason === 'DI_LUAR_BATAS_HARIAN') && keep.length + drop.length === items.length, 'yang tidak terpilih diberi alasan, tidak ada yang hilang');
  const again = selectDaily([...items].reverse());
  ok(JSON.stringify(again.keep.map(x => x.f.s)) === JSON.stringify(keep.map(x => x.f.s)), 'deterministik: urutan input tidak mengubah pilihan');
  const r = selectDaily(items, { total: 4, long: 3, short: 1 });
  ok(r.keep.length === 1, 'sinyal yang sudah tercatat hari ini ikut dihitung (run berulang tidak melampaui batas)');
  ok(selectDaily([]).keep.length === 0, 'kosong aman');
}

console.log('\n[5] Ukuran posisi dan kesiapan uang nyata');
{
  let p = riskPlan({ capital: 1000, riskPct: 1, entry: 100, sl: 95, lulus: false });
  near(p.riskPctEff, RISK_CAP.belumLulus, 'belum lulus: risiko dibatasi 0,25%');
  near(p.riskUsd, 2.5, 'risiko USD = 0,25% dari modal');
  near(p.qty, 0.5, 'qty = risiko / jarak SL');
  ok(p.notes.some(n => /dibatasi/.test(n)), 'pembatasan dijelaskan');
  p = riskPlan({ capital: 1000, riskPct: 1, entry: 100, sl: 95, lulus: true });
  near(p.riskPctEff, 1, 'sudah lulus: 1% diizinkan'); near(p.notional, 200, 'notional benar');
  p = riskPlan({ capital: 1000, riskPct: 0.1, entry: 100, sl: 95, lulus: false });
  near(p.riskPctEff, 0.1, 'permintaan lebih kecil dari batas dihormati');
  p = riskPlan({ capital: 1000, riskPct: 1, entry: 100, sl: 99.9, lulus: true });
  ok(p.leverage > 1.05 && p.notes.some(n => /leverage/.test(n)), 'leverage tinggi diberi peringatan');
  ok(riskPlan({ capital: 0, riskPct: 1, entry: 1, sl: 0.9 }).qty === 0 && riskPlan({ capital: 100, riskPct: 1, entry: 1, sl: 1 }).qty === 0, 'input tidak lengkap: qty 0, tanpa error');
  const w = wilson(17, 65);
  ok(w.lo > 0.16 && w.lo < 0.18 && w.hi > 0.37 && w.hi < 0.39, 'Wilson 17/65 ~ [17%, 38%] (cocok dengan monitor)', JSON.stringify(w));
  ok(wilson(0, 0) === null, 'Wilson n=0 aman');
  near(breakevenWin(2, 0), 1 / 3, 'win rate impas RR 2 = 33,3%');
  ok(breakevenWin(2, 0.03) > 1 / 3, 'biaya menaikkan win rate impas');
  ok(!readiness(null).lulus, 'tanpa laporan: belum siap');
  const lock = { chain: { ok: true }, ready: false, progress: { trade_terisi: [74, 150], minggu: [3, 20] } };
  ok(!readiness(lock).lulus && readiness(lock).items.length === 4, 'belum memenuhi syarat: belum siap');
  const good = { chain: { ok: true }, ready: true, verdict: { pass: true }, progress: { trade_terisi: [160, 150], minggu: [22, 20] } };
  ok(readiness(good).lulus, 'semua syarat terpenuhi: siap');
  ok(!readiness({ ...good, verdict: { pass: false } }).lulus && !readiness({ ...good, chain: { ok: false } }).lulus, 'verdict gagal atau jurnal rusak: tidak siap');
  ok(HIPOTESIS.length >= 5 && Object.isFrozen(CFG), 'hipotesis tercatat dan CFG beku');
}

console.log('\n[6] Mesin v1 tidak tersentuh (forward test v1 tetap sah)');
{
  const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const pf = path.join(ROOT, 'data/forward-protocol.json');
  if (fs.existsSync(pf)) {
    const P = JSON.parse(fs.readFileSync(pf, 'utf8'));
    ok(engineHash(read('core.mjs'), read('trade-sim.mjs')) === P.engine, `hash core.mjs + trade-sim.mjs masih ${P.engine} (sama dengan protokol v1)`);
  } else ok(true, 'protokol v1 belum ada di repo ini (dilewati)');
  const m = makeProtocol('E', 1000);
  ok(m.agen === 'Aturan Eliz' && m.versi === 1 && !m.hipotesis && /core\.mjs, trade-sim\.mjs/.test(m.larangan[0]), 'makeProtocol bawaan tetap menghasilkan protokol v1');
  const m2 = makeProtocol('E', 1000, { agen: 'Eliz v2', versi: 2, files: ['core.mjs', 'trade-sim.mjs', 'gate.mjs'], hipotesis: HIPOTESIS, cfg: CFG });
  ok(m2.agen === 'Eliz v2' && m2.hipotesis.length === HIPOTESIS.length && m2.konfigurasi_gerbang.maxDistPct === CFG.maxDistPct && /gate\.mjs/.test(m2.larangan[0]), 'protokol v2 memuat hipotesis, konfigurasi gerbang, dan gate.mjs dalam larangan');
}

console.log('\n[7] Integrasi: jurnal.mjs sungguhan (server Binance palsu)');
{
  // seed yang menghasilkan >= 2 kandidat v1 dan >= 1 lolos gerbang
  let seed = null;
  for (let s = 500; s < 900 && seed == null; s++) {
    const fk = install({ seed: s }), F = [];
    for (const sy of SYMS) { try { const sc = scanInput(await kl(sy + 'USDT')); F.push({ s: sy, ...feat(sc.bars, sc.qv) }); } catch { /* abaikan */ } }
    fk.restore();
    const btc = F.find(f => f.s === 'BTC'), cand = F.filter(f => f.side && f.slp <= 15);
    if (cand.length >= 3 && cand.some(f => evaluate(f, { btc }).ok) && cand.some(f => !evaluate(f, { btc }).ok)) seed = s;
  }
  ok(seed != null, 'ditemukan data palsu dengan kandidat yang lolos DAN yang ditolak', String(seed));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gt-'));
  for (const f of ['core.mjs', 'trade-sim.mjs', 'forward-lib.mjs', 'gate.mjs']) fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f));
  fs.cpSync(path.join(ROOT, 'scripts'), path.join(tmp, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'data'));
  const run = () => spawnSync(process.execPath, ['--import', pathToFileURL(path.join(tmp, 'scripts/fake-binance-preload.mjs')).href, 'scripts/jurnal.mjs'], { cwd: tmp, env: { ...process.env, FORCE: '1', USE_AI: '', FAKE_SEED: String(seed) }, encoding: 'utf8', timeout: 120000 });
  const rd = f => JSON.parse(fs.readFileSync(path.join(tmp, f), 'utf8'));
  const r1 = run();
  ok(r1.status === 0 && !/ReferenceError|TypeError|SyntaxError/.test(r1.stderr + r1.stdout), 'jurnal.mjs berjalan tanpa error', (r1.stderr || '').slice(0, 300));
  ok(/gerbang v2:/.test(r1.stdout) && /Protokol forward test v2 DIMULAI/.test(r1.stdout), 'protokol v2 dibuat dan gerbang berjalan');
  const j = rd('data/journal.json'), v1 = j.filter(r => r.agen === 'Aturan Eliz'), v2 = j.filter(r => r.agen === 'Eliz v2');
  const P1 = rd('data/forward-protocol.json'), P2 = rd('data/forward-protocol-v2.json');
  ok(P1.agen === 'Aturan Eliz' && P2.agen === 'Eliz v2' && P1.engine !== P2.engine, 'dua protokol terpisah dengan hash mesin berbeda');
  ok(Array.isArray(P2.hipotesis) && P2.hipotesis.length >= 5 && P2.konfigurasi_gerbang.maxDistPct === CFG.maxDistPct, 'hipotesis dan konfigurasi tercatat di protokol v2 sebelum ada hasil');
  ok(v1.length >= 3 && v2.length >= 1 && v2.length < v1.length, `v1 ${v1.length} baris, v2 ${v2.length} baris (v2 adalah subset yang lebih selektif)`);
  ok(v1.every(r => r.engine === P1.engine) && v2.every(r => r.engine === P2.engine), 'tiap baris membawa hash mesin agennya');
  ok(v2.every(r => { const m = v1.find(x => x.aset === r.aset && x.id.split('|')[0] === r.id.split('|')[0]); return m && m.entry === r.entry && m.sl === r.sl && m.tp === r.tp && m.arah === r.arah; }), 'gerbang tidak pernah mengubah entry/SL/TP/arah: baris v2 identik dengan baris v1');
  ok(v2.length <= CFG.maxSignalsPerScan, 'batas harian dipatuhi');
  ok(verifyChain(j).ok, 'satu rantai hash tetap valid dengan dua agen', JSON.stringify(verifyChain(j).errors));
  const gl = rd('data/gate-log.json');
  ok(v1.every(r => gl.some(x => x.id === r.id)), 'setiap kandidat v1 punya catatan keputusan gerbang');
  ok(gl.filter(x => x.v2 === 'LOLOS').length === v2.length, 'jumlah LOLOS di gate-log = jumlah baris v2');
  ok(gl.filter(x => x.v2 === 'TOLAK').every(x => x.alasan.length >= 1), 'setiap penolakan punya kode alasan');
  const snap = JSON.stringify(j.map(r => [r.id, r.h]));
  const r2 = run(), j2 = rd('data/journal.json');
  ok(r2.status === 0 && !/DIMULAI/.test(r2.stdout), 'run kedua tidak membuat protokol baru');
  ok(JSON.stringify(j2.slice(0, j.length).map(r => [r.id, r.h])) === snap && j2.filter(r => r.agen === 'Eliz v2').length === v2.length, 'run kedua idempoten: tidak ada baris v2 tambahan');
  ok(new Set(rd('data/gate-log.json').map(x => x.id)).size === rd('data/gate-log.json').length, 'gate-log tanpa duplikat');
  // laporan dua protokol
  const rep = spawnSync(process.execPath, ['scripts/forward.mjs', 'report'], { cwd: tmp, encoding: 'utf8' });
  ok(rep.status === 0 && fs.existsSync(path.join(tmp, 'data/forward-report.json')) && fs.existsSync(path.join(tmp, 'data/forward-report-v2.json')), 'laporan v1 dan v2 sama-sama ditulis', rep.stderr.slice(0, 200));
  const a2 = rd('data/forward-report-v2.json');
  ok(a2.locked && a2.protocol.agen === 'Eliz v2' && !JSON.stringify(a2).includes('"mean"'), 'laporan v2 terkunci dan tidak membocorkan angka kinerja');
  ok(/Eliz v2/.test(fs.readFileSync(path.join(tmp, 'data/forward-report-v2.md'), 'utf8')), 'judul laporan v2 menyebut agen');
  // mengubah gate.mjs = mesin v2 berubah
  fs.appendFileSync(path.join(tmp, 'gate.mjs'), '\n// perubahan\n');
  const r3 = run();
  ok(/PERINGATAN: mesin v2 berubah/.test(r3.stdout), 'mengubah gate.mjs memicu peringatan mesin v2 berubah');
  ok(!/PERINGATAN: mesin berubah/.test(r3.stdout), 'mesin v1 tidak terpengaruh oleh perubahan gate.mjs');
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${fail ? 'GAGAL' : 'SEMUA LULUS'}: ${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
