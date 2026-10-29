// Uji asap dashboard (index.html) tanpa browser:  node scripts/test-dashboard.mjs
// Menjalankan skrip modul index.html dengan DOM tiruan dan server Binance palsu, lalu memeriksa keluarannya.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { install } from './fake-binance.mjs';

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  GAGAL', name, extra); } };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];

console.log('\n[1] Dashboard memuat dan memakai gerbang v2');
const els = new Map();
globalThis.document = { querySelector: s => { if (!els.has(s)) els.set(s, { innerHTML: '', textContent: '', value: '', style: {}, className: '', disabled: false, dataset: {}, children: [], classList: { toggle() {} } }); return els.get(s); } };
const fk = install({ seed: 503 }), realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => (String(u).startsWith('data/') ? (fs.existsSync(path.join(ROOT, u)) ? { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(path.join(ROOT, u), 'utf8')) } : { ok: false, status: 404, json: async () => ({}) }) : realFetch(u, o));
const tmp = path.join(ROOT, '_dash_check.mjs');
fs.writeFileSync(tmp, mod);
let err = null;
try { await import(tmp + '?t=' + Date.now()); } catch (e) { err = e; }
for (let i = 0; i < 100 && !/Selesai|gagal dijangkau/.test(els.get('#st')?.textContent || ''); i++) await new Promise(r => setTimeout(r, 100));
await new Promise(r => setTimeout(r, 300));
fs.rmSync(tmp, { force: true }); fk.restore();
const out = els.get('#out')?.innerHTML || '', st = els.get('#st')?.textContent || '', rl = els.get('#rl')?.innerHTML || '';
ok(!err, 'modul dashboard berjalan tanpa error', String(err && err.stack).slice(0, 300));
ok(/Selesai/.test(st), 'scan selesai dengan data palsu', st);
ok(/MODE UJI/.test(rl) && /0,25%|0\.25%/.test(rl), 'banner MODE UJI tampil dan menyebut batas risiko', rl.slice(0, 120));
ok(/LOLOS v2/.test(out), 'ada setup yang diberi lencana LOLOS v2');
ok(/Ditolak gerbang v2/.test(out) && /Ditolak:/.test(out), 'setup yang ditolak dilipat dan menyebut alasannya');
ok(/\(0\.25%\)|0\.25%/.test(out), 'ukuran posisi memakai batas risiko 0,25% selama belum lulus');
ok(/Total risiko terbuka/.test(out), 'total risiko terbuka ditampilkan');
console.log(`\n${fail ? 'GAGAL' : 'SEMUA LULUS'}: ${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
