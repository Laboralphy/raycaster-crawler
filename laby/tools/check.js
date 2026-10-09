#!/usr/bin/env node
// Vérifie la cohérence des niveaux générés : génération sans erreur,
// carte rectangulaire, point de départ et sortie présents, chaque porte
// verrouillée a sa clé et chaque clé a sa porte (ou un support vide).
// Usage : node laby/tools/check.js [nombre de graines]
const { generateLaby } = require('..');

// configurations utilisées par le jeu
const CONFIGS = [
    ['forest', '-ls1'], ['forest', '-w1'],
    ['dungeon', ''], ['dungeon', '-rs1-ls1'], ['dungeon', '-ls2'], ['dungeon', '-ls2-rs1'], ['dungeon', '-ts3-rs1-t1'],
    ['boss', ''], ['boss', '-d1'], ['special', ''],
    ['mines', ''], ['mines', '-ls1'], ['cave', ''], ['cave', '-ls1-d1'],
];
const nSeeds = Number(process.argv[2] || 300);
let nFail = 0;

for (const [g, o] of CONFIGS) {
    const aErrors = [];
    for (let s = 0; s < nSeeds; s++) {
        let oLevel;
        try {
            oLevel = generateLaby(g, s, o);
        } catch (e) {
            aErrors.push(`graine ${s} : ${e.message}`);
            continue;
        }
        const B = oLevel.B;
        const has = (sName) => sName in B;
        const aMap = oLevel.toArray();
        const aCells = aMap.flat();
        if (aMap.some((r) => r.length !== aMap[0].length)) {
            aErrors.push(`graine ${s} : carte non rectangulaire`);
        }
        const count = (n) => aCells.filter((c) => c === n).length;
        if (count(B.BLOCK_ELEVATOR_ENTRANCE) !== 1) {
            aErrors.push(`graine ${s} : ${count(B.BLOCK_ELEVATOR_ENTRANCE)} point(s) de départ`);
        }
        if (count(B.BLOCK_ELEVATOR_EXIT) !== 1 && g !== 'special') {
            aErrors.push(`graine ${s} : ${count(B.BLOCK_ELEVATOR_EXIT)} sortie(s)`);
        }
        if (has('BLOCK_KEY_0')) {
            for (let k = 0; k < 4; k++) {
                const nDoors = count(B.BLOCK_LOCKEDDOOR_0 + k);
                const nKeys = count(B.BLOCK_KEY_0 + k);
                if (nDoors && nKeys !== 1) {
                    aErrors.push(`graine ${s} : porte ${k} verrouillée, ${nKeys} clé(s)`);
                }
                if (nKeys && !nDoors) {
                    aErrors.push(`graine ${s} : clé ${k} sans porte`);
                }
            }
        }
    }
    nFail += aErrors.length;
    console.log(`${g} '${o}' : ${aErrors.length ? aErrors.length + ' problème(s)' : 'ok'}`);
    aErrors.slice(0, 5).forEach((s) => console.log('   ' + s));
}
process.exit(nFail ? 1 : 0);
