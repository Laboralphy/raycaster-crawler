#!/usr/bin/env node
// Reconstitue le jeu en un seul fichier, en concaténant les sources dans
// l'ordre de chargement (build-order.json) : les classes doivent être
// déclarées après celles qu'elles étendent.
// Usage : node src-recovered/build.js [fichier de sortie]   (défaut : dist/crawler.js)
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const sOut = path.resolve(process.argv[2] || path.join(ROOT, 'dist', 'crawler.js'));
const aOrder = JSON.parse(fs.readFileSync(path.join(ROOT, 'build-order.json'), 'utf8'));

const sBundle = aOrder
    .map((f) => `// ${f}\n` + fs.readFileSync(path.join(ROOT, f), 'utf8'))
    .join('\n');
fs.mkdirSync(path.dirname(sOut), { recursive: true });
fs.writeFileSync(sOut, sBundle);
console.log(`${aOrder.length} fichiers -> ${path.relative(process.cwd(), sOut)}`);
