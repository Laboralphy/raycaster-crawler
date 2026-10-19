#!/usr/bin/env node
// Vérifie que les données du jeu se renvoient bien les unes aux autres :
// monstres des hordes, apparences (tiles) et leurs images, armes, tables de
// butin, magasins, musiques. Un nom mal écrit ne provoque pas d'erreur dans
// le jeu : le monstre n'apparaît pas, ou ne lâche rien. D'où ce script.
// Usage : npm run check:data
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GFX_DATA } from '../src-recovered/game/data/GFX_DATA.js';
import { LABY } from '../src-recovered/game/data/LABY.js';
import { WORLD_DATA } from '../src-recovered/game/data/WORLD_DATA.js';
import { MONSTERS_BLUEPRINTS } from '../src-recovered/game/data/MONSTERS_BLUEPRINTS.js';
import { MONSTERS_TILES } from '../src-recovered/game/data/MONSTERS_TILES.js';
import { LOOT_DATA } from '../src-recovered/game/data/LOOT_DATA.js';
import { ITEMS_DATA, ITEMS } from '../src-recovered/game/data/ITEMS_DATA.js';
import { ICONS } from '../src-recovered/game/data/ICONS.js';
import { MAGIC } from '../src-recovered/game/data/MAGIC_DATA.js';
import { MAGIC_DATA_PARAMS } from '../src-recovered/game/data/MAGIC_DATA_PARAMS.js';
import { SPELLS_DATA } from '../src-recovered/game/data/SPELLS_DATA.js';
import { BLUEPRINTS_DATA } from '../src-recovered/game/data/BLUEPRINTS_DATA.js';
import { SOUNDS } from '../src-recovered/game/data/SOUNDS.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { generateLaby, GENERATORS } = createRequire(import.meta.url)('../laby');
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

// le générateur doit exister et produire de quoi entrer et sortir : un
// générateur qui n'en produit pas laisse le joueur sans point de départ
function checkGenerator(f, sFloor) {
    if (!GENERATORS.includes(f.generator)) {
        err(sFloor + ' : générateur inconnu "' + f.generator + '"');
        return;
    }
    const aBlocks = JSON.parse(generateLaby(f.generator, '1', f.options).renderJSON()).flat().map((n) => n & 0xFF);
    const aNeeded = [['BLOCK_ELEVATOR_ENTRANCE', true], ['BLOCK_ELEVATOR_SWITCH_PREV', true],
        ['BLOCK_ELEVATOR_SWITCH_NEXT', !(f.transit && f.transit.exit === false)]];
    for (const [sBlock, bNeeded] of aNeeded) {
        if (bNeeded && !aBlocks.includes(LABY[sBlock])) {
            err(sFloor + ' : le générateur "' + f.generator + '" ne pose pas de ' + sBlock);
        }
    }
}

// une zone hors du parcours doit être reliée dans Adventure.config()
// (sans les lignes defineEvent, qui nomment la zone sans y mener)
const sAdventure = readFileSync(join(ROOT, 'src-recovered/game/Adventure.js'), 'utf8')
    .split('\n').filter((s) => !s.includes('defineEvent(') && !s.includes('defineLevelProcessor(')).join('\n');
// ou par une sortie écrite dans les données d'un autre étage (transit)
const oTransitTargets = {};
for (const sArea in WORLD_DATA.dungeons) {
    WORLD_DATA.dungeons[sArea].forEach((f) => Object.values(f.transit || {}).forEach((t) => {
        const sTo = Array.isArray(t) ? t[0] : t;
        if (typeof sTo === 'string' && sTo !== sArea) {
            oTransitTargets[sTo] = true;
        }
    }));
}
const rxReached = (sArea) => sArea === 'forest' || oTransitTargets[sArea]
    || new RegExp("['.]" + sArea + "\\b").test(sAdventure);

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
        if (!(f.textures in GFX_DATA.textures)) {
            err(sFloor + ' : textures inconnues "' + f.textures + '" (GFX_DATA.textures)');
        }
        if (!(f.visual in GFX_DATA.visuals)) {
            err(sFloor + ' : visuel inconnu "' + f.visual + '" (GFX_DATA.visuals)');
        }
        for (const sKey of ['flats', 'sky']) {
            if (f[sKey] && !existsSync(join(ROOT, f[sKey]))) {
                err(sFloor + ' ' + sKey + ' : image absente "' + f[sKey] + '"');
            }
        }
        if (!('map' in f)) {
            checkGenerator(f, sFloor);
        }
    });
    if (!rxReached(sArea)) {
        aWarnings.push(sArea + " : aucune sortie ni portail n'y mène (Adventure.js), zone inaccessible");
    }
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
    if (b.data && b.data.onWound && !(b.data.onWound.spell in MAGIC)) {
        err('monstre ' + sMob + ' : onWound, sort inconnu "' + b.data.onWound.spell + '" (data/magic)');
    }
    if (b.data && b.data.onWound && typeof b.data.onWound.cooldown === 'string' && !(b.data.onWound.cooldown in MAGIC_DATA_PARAMS.COOLDOWN)) {
        err('monstre ' + sMob + ' : onWound, recharge inconnue "' + b.data.onWound.cooldown + '" (MAGIC_DATA_PARAMS.COOLDOWN)');
    }
}
for (const sTile in MONSTERS_TILES) {
    const t = MONSTERS_TILES[sTile];
    if (t.src && !existsSync(join(ROOT, t.src))) {
        err('apparence ' + sTile + ' : image absente "' + t.src + '"');
    }
}

// objets (data/items/*.json) : l'icône est un nom de ICONS
for (const sItem in ITEMS) {
    if (typeof ITEMS[sItem].icon === 'string' && !(ITEMS[sItem].icon in ICONS)) {
        err('objet ' + sItem + ' : icône inconnue "' + ITEMS[sItem].icon + '" (ICONS)');
    }
    (ITEMS[sItem].spells || []).forEach((o) => {
        if (!(o.ref in SPELLS_DATA)) {
            err('objet ' + sItem + ' : projectile inconnu "' + o.ref + '" (data/spells)');
        }
    });
}
// projectiles (data/spells/*.json) : une chance par effet ; un projectile à
// plusieurs éclairs (missiles) le vérifie pour chacun, avec son plan et son
// apparence, et ses effets tirés au hasard (random)
function checkMissile(p, sWhere) {
    if ((p.effects || []).length !== (p.chances || []).length) {
        err(sWhere + ' : ' + (p.effects || []).length + ' effet(s) mais ' + (p.chances || []).length + ' chance(s)');
    }
    if (p.blueprint && !(p.blueprint in BLUEPRINTS_DATA)) {
        err(sWhere + ' : plan inconnu "' + p.blueprint + '" (BLUEPRINTS_DATA)');
    } else if (p.blueprint && !(BLUEPRINTS_DATA[p.blueprint].tile in GFX_DATA.tiles)) {
        err(sWhere + ' : apparence inconnue "' + BLUEPRINTS_DATA[p.blueprint].tile + '" (GFX_DATA.tiles)');
    }
    if (p.random && !(p.random.count <= (p.random.effects || []).length)) {
        err(sWhere + ' : ' + p.random.count + ' effet(s) au hasard parmi ' + (p.random.effects || []).length);
    }
}
for (const sSpell in SPELLS_DATA) {
    const p = SPELLS_DATA[sSpell];
    if (p.missiles) {
        p.missiles.forEach((m, i) => checkMissile(m, 'projectile ' + sSpell + ', éclair ' + i));
    } else {
        checkMissile(p, 'projectile ' + sSpell);
    }
}

// sorts (data/magic/*.json) : durée de recharge, icône et son par leur nom
for (const sSpell in MAGIC) {
    const m = MAGIC[sSpell];
    if (typeof m.cooldown === 'string' && !(m.cooldown in MAGIC_DATA_PARAMS.COOLDOWN)) {
        err('sort ' + sSpell + ' : recharge inconnue "' + m.cooldown + '" (MAGIC_DATA_PARAMS.COOLDOWN)');
    }
    if (!(m.icon in ICONS)) {
        err('sort ' + sSpell + ' : icône inconnue "' + m.icon + '" (ICONS)');
    }
    if (!(m.sound in SOUNDS)) {
        err('sort ' + sSpell + ' : son inconnu "' + m.sound + '" (SOUNDS)');
    }
    (m.visual || []).forEach((v, i) => {
        if (typeof v === 'string' && isNaN(Number(v))) {
            err('sort ' + sSpell + ' : couleur illisible "' + v + '" (visual[' + i + '])');
        }
    });
}

// butin : chaque table doit servir (étage ou monstre du même nom)
for (const sLoot in LOOT_DATA) {
    for (const sItem in LOOT_DATA[sLoot].items) {
        checkItem(sItem, 'butin ' + sLoot);
    }
    (LOOT_DATA[sLoot].always || []).forEach((sItem) => checkItem(sItem, 'butin ' + sLoot + ' (always)'));
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
