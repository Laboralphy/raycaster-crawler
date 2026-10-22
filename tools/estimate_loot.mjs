#!/usr/bin/env node
// Estime, étage par étage, ce que le joueur peut trouver : monstres, coffres,
// placards, bibliothèques, magasins, et l'or et les objets qu'ils donnent.
//
// Chaque étage est généré avec plusieurs graines (comme le jeu, avec le même
// générateur) ; on compte les blocs posés, puis on calcule l'espérance de
// chaque table de butin (LOOT_DATA) : nombre moyen d'objets tirés × poids de
// chaque objet, plus les objets « always ».
//
// Usage : npm run estimate:loot -- [options]
//   --seeds N    nombre de graines par étage (20 par défaut)
//   --area nom   un seul donjon (d1, crypts...)
//   --items      détail des objets attendus par étage
import { createRequire } from 'node:module';
import { LABY } from '../src/game/data/LABY.js';
import { WORLD_DATA } from '../src/game/data/WORLD_DATA.js';
import { LOOT_DATA } from '../src/game/data/LOOT_DATA.js';

const { generateLaby } = createRequire(import.meta.url)('../laby');

const aArgs = process.argv.slice(2);
const arg = (s, x) => {
    const i = aArgs.indexOf(s);
    return i < 0 ? x : aArgs[i + 1];
};
const N_SEEDS = arg('--seeds', 20) | 0;
const S_AREA = arg('--area', null);
const B_ITEMS = aArgs.includes('--items');

const MOB_FIRST = LABY.BLOCK_MOB_LEVEL_0;
const MOB_LAST = LABY.BLOCK_MOB_LEVEL_X;
const SHELVES = [LABY.BLOCK_LIBRARY_BOOK, LABY.BLOCK_LIVING_BOOK, LABY.BLOCK_LABO_BOOK];

// ajoute o2 × f à o1 (comptes par nom)
function addTo(o1, o2, f = 1) {
    for (const s in o2) {
        o1[s] = (o1[s] || 0) + o2[s] * f;
    }
    return o1;
}

// espérance d'une table de butin : { objet: nombre moyen d'unités }
const oExpectCache = {};
function expectLoot(sTable) {
    if (sTable in oExpectCache) {
        return oExpectCache[sTable];
    }
    const t = LOOT_DATA[sTable];
    const o = {};
    if (t) {
        let nW = 0, nCount = 0;
        for (const c in t.chances) {
            nW += t.chances[c];
            nCount += (c | 0) * t.chances[c];
        }
        const fCount = nW ? nCount / nW : 0;
        let nItemW = 0;
        for (const s in t.items) {
            nItemW += t.items[s];
        }
        const pick = (sEntry, f) => {
            const [sItem, sMul] = sEntry.split('*');
            o[sItem] = (o[sItem] || 0) + f * (sMul ? sMul | 0 : 1);
        };
        for (const s in t.items) {
            pick(s, fCount * t.items[s] / nItemW);
        }
        (t.always || []).forEach((s) => pick(s, 1));
    }
    return (oExpectCache[sTable] = o);
}

// blocs d'un étage (moyenne sur les graines)
function countBlocks(f) {
    const aMaps = [];
    if ('map' in f) {
        aMaps.push(f.map);
    } else {
        // comme Adventure.seedLevels : une pièce par magasin
        const sOptions = (f.options || '') + (f.shops && f.shops.length ? '-s' + f.shops.length : '');
        for (let i = 1; i <= N_SEEDS; i++) {
            aMaps.push(JSON.parse(generateLaby(f.generator, String(i * 7919), sOptions).renderJSON()));
        }
    }
    const o = { mobs: new Array(MOB_LAST - MOB_FIRST + 1).fill(0), chest: 0, bigchest: 0, closet: 0, shelf: 0 };
    for (const aMap of aMaps) {
        for (const aRow of aMap) {
            for (const n of aRow) {
                const b = n & 0xFF;
                if (b >= MOB_FIRST && b <= MOB_LAST) {
                    o.mobs[b - MOB_FIRST]++;
                } else if (b === LABY.BLOCK_TREASURE) {
                    o.chest++;
                } else if (b === LABY.BLOCK_WATCH_TREASURE) {
                    o.bigchest++;
                } else if (b === LABY.BLOCK_LABO_CLOSET_X || b === LABY.BLOCK_LABO_CLOSET_Y) {
                    o.closet++;
                } else if (SHELVES.includes(b)) {
                    o.shelf++;
                }
            }
        }
    }
    const k = aMaps.length;
    o.mobs = o.mobs.map((n) => n / k);
    ['chest', 'bigchest', 'closet', 'shelf'].forEach((s) => (o[s] /= k));
    return o;
}

// monstres attendus : chaque place de niveau L prend au hasard un monstre de
// la horde qui a L dans ses niveaux (Game.rld_chooseObject), sinon reste vide
function expectMobs(f, aMobs) {
    const o = {};
    aMobs.forEach((nPlaces, nLevel) => {
        const aRoster = Object.keys(f.horde || {}).filter((s) => f.horde[s].levels.includes(nLevel));
        aRoster.forEach((s) => (o[s] = (o[s] || 0) + nPlaces / aRoster.length));
    });
    return o;
}

const fmt = (x) => x >= 10 ? x.toFixed(0) : x.toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

function report(sTitle, r) {
    const sMobs = Object.keys(r.mobs).sort((a, b) => r.mobs[b] - r.mobs[a])
        .map((s) => s.replace(/^m_/, '') + ' ' + fmt(r.mobs[s])).join(', ');
    const nMobs = Object.values(r.mobs).reduce((a, b) => a + b, 0);
    const nItems = Object.keys(r.items).filter((s) => s !== 'gold').reduce((a, s) => a + r.items[s], 0);
    console.log(pad(sTitle, 12) + padl(fmt(nMobs), 5) + padl(fmt(r.chest), 7) + padl(fmt(r.bigchest), 6) +
        padl(fmt(r.closet), 7) + padl(fmt(r.shelf), 7) + padl(r.shops, 6) +
        padl(fmt(r.goldChests), 7) + padl(fmt(r.goldMobs), 7) + padl(fmt(nItems), 7) + padl(r.shopPrice || '', 7) +
        '  ' + sMobs);
    if (B_ITEMS) {
        const aItems = Object.keys(r.items).filter((s) => s !== 'gold' && r.items[s] >= 0.05).sort((a, b) => r.items[b] - r.items[a]);
        console.log(' '.repeat(12) + 'objets : ' + aItems.map((s) => s + ' ' + fmt(r.items[s])).join(', '));
        if (r.shopItems.length) {
            console.log(' '.repeat(12) + 'en vente : ' + r.shopItems.join(', '));
        }
    }
}

const newTotal = () => ({ mobs: {}, chest: 0, bigchest: 0, closet: 0, shelf: 0, shops: 0, goldChests: 0, goldMobs: 0, items: {}, shopPrice: 0, shopItems: [] });
const oGame = newTotal();

console.log('moyenne sur ' + N_SEEDS + ' graine(s) par étage ; « or » = pièces attendues ; objets = hors or');
console.log(pad('étage', 12) + padl('mobs', 5) + padl('coffre', 7) + padl('gros', 6) + padl('plac.', 7) +
    padl('biblio', 7) + padl('magas', 6) + padl('or cof', 7) + padl('or mob', 7) + padl('objets', 7) + padl('prix', 7) + '  monstres');
for (const sArea in WORLD_DATA.dungeons) {
    if (S_AREA && sArea !== S_AREA) {
        continue;
    }
    const oArea = newTotal();
    WORLD_DATA.dungeons[sArea].forEach((f, iFloor) => {
        const b = countBlocks(f);
        const r = newTotal();
        r.mobs = expectMobs(f, b.mobs);
        r.chest = b.chest;
        r.bigchest = b.bigchest;
        r.closet = b.closet;
        r.shelf = b.shelf;
        const loot = f.loot || {};
        const oChests = {};
        addTo(oChests, expectLoot(loot.chest), b.chest);
        addTo(oChests, expectLoot(loot.bigchest), b.bigchest);
        addTo(oChests, expectLoot(loot.closet), b.closet);
        const oMobLoot = {};
        for (const s in r.mobs) {
            addTo(oMobLoot, expectLoot(s), r.mobs[s]);
        }
        r.goldChests = oChests.gold || 0;
        r.goldMobs = oMobLoot.gold || 0;
        addTo(addTo(r.items, oChests), oMobLoot);
        (f.shops || []).forEach((aShop) => {
            if (Array.isArray(aShop)) {
                r.shops++;
                aShop.forEach(([sItem, nPrice]) => {
                    r.shopPrice += nPrice;
                    r.shopItems.push(sItem + ' ' + nPrice);
                });
            }
        });
        report(sArea + '[' + iFloor + ']', r);
        for (const o of [oArea, oGame]) {
            addTo(o.mobs, r.mobs);
            addTo(o.items, r.items);
            ['chest', 'bigchest', 'closet', 'shelf', 'shops', 'goldChests', 'goldMobs', 'shopPrice'].forEach((s) => (o[s] += r[s]));
        }
    });
    report('= ' + sArea, oArea);
    console.log('');
}
report('= TOTAL', oGame);
