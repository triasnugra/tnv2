#!/usr/bin/env node
// Audit gerbang kualitas v2.  node scripts/audit-gate.mjs [--peek]
//  A) Audit RETROSPEKTIF pada jurnal v1 yang sudah ada. Hanya memakai gerbang yang bisa ditiru dari kolom
//     tersimpan (tren searah, jarak entry, validitas). Aturan itu dipilih SETELAH melihat data ini, jadi
//     angkanya bersifat in-sample: hipotesis, bukan bukti.
//  B) Audit FORWARD: menggabungkan data/gate-log.json (keputusan gerbang sebelum hasil ada) dengan hasil baris
//     v1 yang dinilai otomatis. Ini diagnosis filter yang sah, tetapi sama seperti forward test ia DIKUNCI sampai
//     syarat evaluasi v2 terpenuhi (atau --peek, diberi label TIDAK SAH).
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { summarize, bootCI, FILLED } from './backtest-lib.mjs';
import { CFG, wilson, distinctTriggers, validateSymbol } from '../gate.mjs';
import { RES } from '../forward-lib.mjs';

const COST = 2 * 0.05 + 0.05; // persen per trade pulang-pergi (fee 0,05% x2 + slippage 0,05%), sama dengan protokol
const slpOf = r => Math.abs(r.entry - r.sl) / r.entry * 100;
const net = r => ({ hasil: r.hasil, R: FILLED(r.hasil) ? +r.R - COST / slpOf(r) : 0, exitT: r.tx ?? r.due, t: r.t });
const isSig = r => (r.arah === 'LONG' || r.arah === 'SHORT') && Number.isFinite(+r.entry) && r.hasil !== 'tidak valid' && r.hasil !== 'NO_TRADE';

// satu order aktif per koin (aturan yang sama dengan forward test)
export function dedupe(rows) {
  const busy = new Map(), kept = [];
  for (const r of [...rows].sort((a, b) => a.t - b.t)) {
    if (r.t < (busy.get(r.aset) ?? 0)) continue;
    kept.push(r); busy.set(r.aset, RES(r.hasil) ? (r.tx ?? r.due) : Infinity);
  }
  return kept;
}

// Tiruan gerbang dari kolom tersimpan. Mengembalikan kode alasan (kosong = lolos).
export function proxyReasons(r) {
  const R = [], sy = validateSymbol(r.aset);
  if (sy) R.push(sy);
  const s = r.arah === 'LONG' ? 1 : -1, why = String(r.alasan || '').split(', ');
  if (!(s * (r.entry - r.sl) > 0 && s * (r.tp - r.entry) > 0)) R.push('URUTAN_HARGA_SALAH');
  if (Math.abs(r.entry - r.harga_awal) / r.harga_awal * 100 > CFG.maxDistPct) R.push('ENTRY_TERLALU_JAUH');
  const searah = why.includes('searah tren');
  if (!searah && distinctTriggers(why) < CFG.counterTrendMinTriggers) R.push('MELAWAN_TREN_TANPA_KONFLUENSI');
  return R;
}

const pct = x => (Number.isFinite(x) ? (x * 100).toFixed(0) + '%' : '-');
const rr = x => (Number.isFinite(x) ? (x >= 0 ? '+' : '') + x.toFixed(2) : '-');
function line(name, rows) {
  const S = summarize(rows.map(net)), w = wilson(S.tp, S.tp + S.sl), C = bootCI(rows.map(net), { B: 3000, seed: 1 });
  return `| ${name} | ${S.signals} | ${S.filled} | ${S.tp}/${S.sl} | ${pct(S.win)}${w ? ` [${pct(w.lo)}-${pct(w.hi)}]` : ''} | ${rr(S.mean)} | ${C ? `[${rr(C.lo)}, ${rr(C.hi)}]` : 'n/a'} | ${rr(S.total)} | ${S.maxDD.toFixed(1)} |`;
}
const HEAD = '| Kelompok | Sinyal | Terisi | TP/SL | Win% [CI 95% Wilson] | R/trade | CI 95% R/trade (bootstrap minggu) | Total R | MaxDD (R) |\n|---|---|---|---|---|---|---|---|---|\n';

export function auditRetro(all) {
  const rows = dedupe(all.filter(r => r.agen === 'Aturan Eliz' && isSig(r))), keep = [], drop = [], byReason = new Map();
  for (const r of rows) { const p = proxyReasons(r); if (p.length) { drop.push(r); for (const c of p) { if (!byReason.has(c)) byReason.set(c, []); byReason.get(c).push(r); } } else keep.push(r); }
  let md = `## A. Audit retrospektif (IN-SAMPLE, bukan bukti)\n\n`;
  md += `> Aturan v2 dirancang setelah melihat jurnal ini, jadi angka di bawah pasti terlihat lebih baik daripada kenyataan ke depan. Hanya tiga gerbang yang bisa ditiru dari kolom tersimpan (tren searah, jarak entry, validitas); gerbang basi/BTC/batas harian butuh data candle dan tidak ikut. Sinyal sehari saling berkorelasi, jadi jumlah sinyal jauh lebih besar daripada jumlah sampel independen (hitungan minggu).\n\n`;
  const wk = bootCI(rows.map(net), { B: 200, seed: 1 })?.clusters ?? 0;
  md += `Minggu independen di data ini: ${wk}. Interval bootstrap per minggu dengan kurang dari ~12 minggu tidak bisa diandalkan; lihat Wilson dan jumlah TP/SL mentah.\n\n`;
  md += HEAD + line('Semua sinyal v1 (setelah dedupe)', rows) + '\n' + line('Lolos gerbang (tiruan)', keep) + '\n' + line('Ditolak gerbang (tiruan)', drop) + '\n';
  md += `\n### Per alasan penolakan (satu sinyal bisa punya lebih dari satu alasan)\n\n` + HEAD;
  for (const [c, L] of [...byReason].sort((a, b) => b[1].length - a[1].length)) md += line(c, L) + '\n';
  md += `\nBacaan jujur: bandingkan baris "Ditolak" dengan "Lolos". Bila yang ditolak memang jauh lebih buruk, hipotesis H3/H5 masuk akal untuk diuji ke depan. Belum lebih dari itu.\n`;
  return { md, n: rows.length, keep: keep.length, drop: drop.length };
}

export function auditForward(all, log, P2, { peek = false } = {}) {
  const gl = new Map(log.map(x => [x.id, x]));
  const joined = dedupe(all.filter(r => r.fwd && r.agen === 'Aturan Eliz' && isSig(r) && P2 && r.t >= P2.mulai_ms && gl.has(r.id)));
  const done = joined.filter(r => RES(r.hasil)), filled = done.filter(r => FILLED(r.hasil));
  const weeks = bootCI(done.map(net), { B: 200, seed: 1 })?.clusters ?? 0;
  const need = P2?.syarat_evaluasi || { min_trade_terisi: 150, min_minggu_berbeda: 20 };
  const ready = filled.length >= need.min_trade_terisi && weeks >= need.min_minggu_berbeda;
  let md = `## B. Audit forward (keputusan gerbang dicatat sebelum hasil ada)\n\n`;
  md += `- Kandidat v1 yang punya keputusan gerbang: ${joined.length} (selesai ${done.length}, terisi ${filled.length} dari syarat ${need.min_trade_terisi}; minggu ${weeks} dari ${need.min_minggu_berbeda})\n`;
  if (!ready && !peek) return { md: md + `\n**TERKUNCI.** Perbandingan lolos vs ditolak disembunyikan sampai syarat evaluasi terpenuhi, supaya gerbang tidak diubah-ubah berdasarkan hasil sementara. \`--peek\` tersedia tetapi hasilnya TIDAK SAH.\n`, locked: true };
  if (!ready) md += `\n> INTIP: syarat evaluasi belum terpenuhi. Angka di bawah TIDAK sah sebagai hasil uji.\n`;
  const by = f => joined.filter(r => f(gl.get(r.id)));
  md += '\n' + HEAD + line('Lolos gerbang v2', by(g => g.v2 === 'LOLOS')) + '\n' + line('Ditolak gerbang v2', by(g => g.v2 === 'TOLAK')) + '\n';
  const reasons = new Set(log.filter(x => x.v2 === 'TOLAK').flatMap(x => x.alasan));
  md += `\n### Per alasan penolakan\n\n` + HEAD;
  for (const c of [...reasons].sort()) md += line(c, by(g => g.v2 === 'TOLAK' && g.alasan.includes(c))) + '\n';
  md += `\nGerbang yang menolak sinyal dengan R/trade LEBIH BAIK daripada yang lolos adalah gerbang yang merugikan: buang lewat protokol baru, jangan diubah diam-diam.\n`;
  return { md, locked: false, ready };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const JF = 'data/journal.json', GL = 'data/gate-log.json', PF = 'data/forward-protocol-v2.json';
  if (!fs.existsSync(JF)) { console.log('data/journal.json tidak ditemukan'); process.exit(0); }
  const all = JSON.parse(fs.readFileSync(JF, 'utf8')), log = fs.existsSync(GL) ? JSON.parse(fs.readFileSync(GL, 'utf8')) : [], P2 = fs.existsSync(PF) ? JSON.parse(fs.readFileSync(PF, 'utf8')) : null;
  const A = auditRetro(all), B = auditForward(all, log, P2, { peek: process.argv.includes('--peek') });
  const md = `# Audit gerbang kualitas Mesin 2 v2\n\nDibuat ${new Date().toISOString()}. Biaya: ${COST.toFixed(2)}% per trade pulang-pergi.\n\n${A.md}\n${B.md}`;
  fs.writeFileSync('data/gate-audit.md', md);
  console.log(md);
}
