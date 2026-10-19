// Liste les classes qui restent à migrer (voir PROTOTYPES.md), rangées par
// niveau de dépendance : niveau 0 = n'importe aucun module hors données.
// Usage : npm run report:prototypes
import fs from 'fs'; import path from 'path';
const files = [];
(function walk(d){ for (const f of fs.readdirSync(d)) { const p = path.join(d,f); if (fs.statSync(p).isDirectory()) { if (f!=='original' && f!=='data') walk(p) } else if (f.endsWith('.js')) files.push(p) } })('src-recovered');
const info = {};
for (const f of files) {
  const src = fs.readFileSync(f,'utf8');
  info[f] = {
    imps: [...src.matchAll(/^import .* from '(\..*)';/gm)].map(m => path.normalize(path.join(path.dirname(f), m[1]))).filter(d => !d.includes('/data/')),
    proto: /Object\.assign\(\w+\.prototype/.test(src), patch: /\w+\.prototype\.\w+\s*=/.test(src),
    ctor: /__construct/.test(src) };
}
const lvl = {}, stack = new Set(); let cyc = new Set();
function L(f) { if (f in lvl) return lvl[f]; if (stack.has(f)) { cyc.add(f); return 0 } stack.add(f);
  const d = (info[f]?.imps||[]); const v = d.length ? 1 + Math.max(...d.map(L)) : 0; stack.delete(f); return lvl[f] = v; }
files.forEach(L);
const todo = files.filter(f => info[f].proto || info[f].patch || info[f].ctor);
const by = {};
for (const f of todo) (by[lvl[f]] ??= []).push(f);
for (const k of Object.keys(by).sort((a,b)=>a-b)) {
  console.log(`\n### Level ${k}\n`);
  for (const f of by[k].sort()) {
    const tags = [info[f].proto && 'prototype defaults', info[f].ctor && '__construct', info[f].patch && 'runtime patch'].filter(Boolean).join(', ');
    const deps = info[f].imps.map(d => path.basename(d, '.js')).join(', ');
    console.log(`- [ ] \`${f.replace('src-recovered/','')}\` (${tags})${deps ? ', depends on: ' + deps : ''}`);
  }
}
console.log(`\n${todo.length} fichiers restants`);
if (cyc.size) console.log('cycles d\'import :', [...cyc].join(', '));
