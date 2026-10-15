#!/usr/bin/env node
// Vérifie que les données du jeu se renvoient bien les unes aux autres :
// monstres des hordes, apparences (tiles) et leurs images, armes, tables de
// butin, magasins, musiques. Un nom mal écrit ne provoque pas d'erreur dans
// le jeu : le monstre n'apparaît pas, ou ne lâche rien. D'où ce script.
// Usage : npm run check:data
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_DATA } from '../src-recovered/game/data/WORLD_DATA.js';
import { MONSTERS_BLUEPRINTS } from '../src-recovered/game/data/MONSTERS_BLUEPRINTS.js';
import { MONSTERS_TILES } from '../src-recovered/game/data/MONSTERS_TILES.js';
import { LOOT_DATA } from '../src-recovered/game/data/LOOT_DATA.js';
import { ITEMS_DATA } from '../src-recovered/game/data/ITEMS_DATA.js';
import { SOUNDS } from '../src-recovered/game/data/SOUNDS.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// tables de butin demandées par le code plutôt que par les données
const LOOT_FROM_CODE = ['spell_summon_food'];

const aErrors = [], aWarnings = [];
const err = (s) => aErrors.push(s);

function checkItem(sItem, sWhere) {
    const sName = sItem.split('*')[0];
    if (sName !== 'GKEY' && !(sName in ITEMS_DATA)) {
        err(sWhere + ' : objet inconnu "' + sName + '"');
    }
}

// étages
const oLootUsed = {};
for (const sArea in WORLD_DATA.dungeons) {
    WORLD_DATA.dungeons[sArea].forEach((f, i) => {
        const sFloor = sArea + '[' + i + ']';
        for (const sMob in f.horde || {}) {
            oLootUsed[sMob] = true;
            if (!(sMob in MONSTERS_BLUEPRINTS)) {
                err(sFloor + ' horde : monstre inconnu "' + sMob + '"');
            }
        }
        for (const sKind in f.loot || {}) {
            oLootUsed[f.loot[sKind]] = true;
            if (!(f.loot[sKind] in LOOT_DATA)) {
                err(sFloor + ' loot.' + sKind + ' : table inconnue "' + f.loot[sKind] + '"');
            }
        }
        (f.shops || []).forEach((aShop, k) => {
            if (!Array.isArray(aShop)) {
                err(sFloor + ' shops[' + k + '] : magasin indéfini (nom mal écrit dans WORLD_DATA.shops.js ?)');
                return;
            }
            aShop.forEach(([sItem]) => checkItem(sItem, sFloor + ' shops[' + k + ']'));
        });
        if (f.music && !(f.music in SOUNDS)) {
            err(sFloor + ' : musique inconnue "' + f.music + '"');
        }
    });
}

// monstres
for (const sMob in MONSTERS_BLUEPRINTS) {
    const b = MONSTERS_BLUEPRINTS[sMob];
    if (b.tile && !(b.tile in MONSTERS_TILES)) {
        err('monstre ' + sMob + ' : apparence inconnue "' + b.tile + '"');
    }
    if (b.data && b.data.weapon && !(b.data.weapon in ITEMS_DATA)) {
        err('monstre ' + sMob + ' : arme inconnue "' + b.data.weapon + '"');
    }
}
for (const sTile in MONSTERS_TILES) {
    const t = MONSTERS_TILES[sTile];
    if (t.src && !existsSync(join(ROOT, t.src))) {
        err('apparence ' + sTile + ' : image absente "' + t.src + '"');
    }
}

// butin : chaque table doit servir (étage ou monstre du même nom)
for (const sLoot in LOOT_DATA) {
    for (const sItem in LOOT_DATA[sLoot].items) {
        checkItem(sItem, 'butin ' + sLoot);
    }
    if (!oLootUsed[sLoot] && !(sLoot in MONSTERS_BLUEPRINTS) && !LOOT_FROM_CODE.includes(sLoot)) {
        aWarnings.push('butin ' + sLoot + " : ni un monstre ni une table d'étage, jamais utilisée");
    }
}
for (const sMob in oLootUsed) {
    if (sMob in MONSTERS_BLUEPRINTS && !(sMob in LOOT_DATA)) {
        aWarnings.push('monstre ' + sMob + ' : pas de table de butin, ne lâche rien');
    }
}

aWarnings.forEach((s) => console.log('attention : ' + s));
aErrors.forEach((s) => console.log('ERREUR : ' + s));
console.log(aErrors.length ? aErrors.length + ' erreur(s)' : 'données cohérentes');
process.exit(aErrors.length ? 1 : 0);
