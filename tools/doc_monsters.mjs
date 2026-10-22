#!/usr/bin/env node
// Écrit documentation/monster.md : une section par monstre, tirée des données
// du jeu (MONSTERS_BLUEPRINTS, ITEMS_DATA, SPELLS_DATA, LOOT_DATA, hordes des
// donjons). Image : celle du bestiaire si elle existe, sinon la première vue
// du monstre découpée dans sa planche (documentation/images/).
// Usage : npm run doc:monsters (vite-node, car STRINGS importe sans extension)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MONSTERS_BLUEPRINTS } from '../src/game/data/MONSTERS_BLUEPRINTS.js';
import { MONSTERS_TILES } from '../src/game/data/MONSTERS_TILES.js';
import { BLUEPRINTS_DATA } from '../src/game/data/BLUEPRINTS_DATA.js';
import { ITEMS_DATA } from '../src/game/data/ITEMS_DATA.js';
import { SPELLS_DATA } from '../src/game/data/SPELLS_DATA.js';
import { LOOT_DATA } from '../src/game/data/LOOT_DATA.js';
import { WORLD_DATA } from '../src/game/data/WORLD_DATA.js';
import { MAGIC_DATA_PARAMS } from '../src/game/data/MAGIC_DATA_PARAMS.js';
import { BOOKS } from '../src/game/data/BOOKS.js';
import { STRINGS } from '../src/game/data/STRINGS.js';
import { EffectProcessor } from '../src/game/EffectProcessor.js';
import { DescriptorPlugin } from '../src/game/plugins/DescriptorPlugin.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = join(ROOT, 'documentation');
const IMAGES = join(DOC, 'images');
// niveau des monstres : Game.js le fixe à 1 pour tous
const MOB_LEVEL = 1;

STRINGS.setLanguage('en');
const ep = new EffectProcessor();
const desc = new DescriptorPlugin();
desc.oGame = { oDungeon: { oEffectProcessor: ep } };

// image du bestiaire de chaque monstre (le nom ne suit pas toujours l'identifiant)
const BOOK_IMAGES = {
    m_myco: 'book_m_myco.png',
    m_myco2: 'book_m_myco2.png',
    m_myco3: 'book_m_myco3.png',
    m_zombie: 'zombie_attack_front-left.png',
    m_goblin: 'book_m_goblin.png',
    m_goblin_warrior: 'book_m_goblin_warrior.png',
    m_skeleton: 'book_m_skeleton.png',
    m_bigarmor: 'book_m_knight.png',
    m_acidblob: 'book_m_acid_blob.png',
    m_fireblob: 'book_m_fire_blob.png',
    m_wasp: 'book_m_wasp.png',
    m_raven: 'book_m_raven.png',
    m_bat: 'book_m_bat.png',
    m_spider: 'book_m_spider.png',
    m_cube: 'book_m_cube.png',
    m_witch: 'book_m_witch.png',
    m_witch_dark: 'book_m_dark_witch.png',
    m_witch_queen: 'book_m_witch_queen.png',
    m_succubus: 'book_m_succubus.png',
    m_zombie_monarch: 'book_m_zombie_monarch.png'
};

const THINKERS = {
    Rusher: 'charges straight at its target and strikes on contact.',
    Rushooter: 'charges at its target; at each reaction it has a 25 % chance to fire (only if it sees the target, so never while blind), and strikes on contact.',
    Boomer: 'charges at its target and explodes on contact (its weapon is the explosion), dying in the blast.',
    Dasher: 'darts forward three steps at a time, stings on contact, and veers off when it bumps into a wall or another monster.',
    Wavedasher: 'a dasher that weaves: it turns by a random angle at each reaction.',
    Shooter: 'keeps its distance: backs away when closer than one cell, strafes left or right at 1 to 3 cells, walks in from farther. Fires with a 33 % chance per reaction when close, 40 % at mid range.',
    Caster: 'moves like a shooter (backs away, strafes, walks in). Each cast first tries its magic spells (data.casts), then its wand slots: 40 % slot 0, 30 % slot 1, 20 % slot 2, 10 % slot 3 (missing slots fall back to slot 0).',
    Healer: 'follows its target; at each reaction it heals the most wounded monster within 512 units (cast slot 1), otherwise shoots at the target.',
    Sentry: 'never walks or wanders; turns towards its target and fires.',
    Stealer: 'flies at its target, steals once on contact (gold, rings, earrings, weighted 7/2/1 among what you carry) and then fights.'
};

const MISSILE_PATTERNS = {
    l1: 'single shot',
    l3: 'triple fan (0, ±0.2 rad)',
    l5: 'five-shot fan (0, ±0.2, ±0.4 rad)',
    w1: 'single wave (sine)',
    w2: 'double wave (sine and cosine)',
    w3: 'triple wave (sine, cosine and straight)'
};

const MISSILE_OPTIONS = {
    h: 'heavy',
    b: 'bounces off walls',
    s: 'sine path',
    c: 'cosine path',
    r: 'random path',
    p: 'spares bosses (bursts on them harmlessly)'
};

function bestiary() {
    const o = {};
    for (const sBook in BOOKS.en) {
        const b = BOOKS.en[sBook];
        (b.images || []).forEach((sImg, i) => {
            const sPage = b.pages[i];
            if (sPage) {
                const [sTitle, ...aText] = sPage.split('\n');
                o[sImg.split('/').pop()] = { title: sTitle, text: aText.join(' ').trim(), book: b.title };
            }
        });
    }
    return o;
}

function itemName(sItem) {
    const [sId, sCount] = sItem.split('*');
    const oItem = ITEMS_DATA[sId];
    let s = '`' + sId + '`';
    if (oItem && oItem.name) {
        const sName = STRINGS._(oItem.name);
        if (sName && !sName.startsWith('~')) {
            s = sName + ' (`' + sId + '`)';
        }
    }
    return sCount ? s + ' × ' + sCount : s;
}

function effect(sEffect, nChance) {
    let s = desc.getEffectDescription(sEffect).replace(/\s+/g, ' ').trim();
    if (nChance !== undefined && nChance !== 1) {
        s += ' (' + Math.round(nChance * 100) + ' %)';
    }
    return s + ' `' + sEffect + '`';
}

function pct(n, nTotal) {
    return Math.round(1000 * n / nTotal) / 10 + ' %';
}

function locations(sId) {
    const a = [];
    for (const sArea in WORLD_DATA.dungeons) {
        WORLD_DATA.dungeons[sArea].forEach((oFloor, iFloor) => {
            if (oFloor.horde && sId in oFloor.horde) {
                a.push('`' + sArea + '[' + iFloor + ']` (spawn points ' + oFloor.horde[sId].levels.join(', ') + ')');
            }
        });
    }
    return a;
}

function spellLines(oSpell) {
    const a = [];
    const aMissiles = oSpell.missiles || null;
    if (aMissiles) {
        aMissiles.forEach((m) => {
            a.push('    - missile `' + m.blueprint + '`, angle ' + m.angle + (m.options ? ', options `' + m.options + '`' : ''));
            m.effects.forEach((e, i) => a.push('      - ' + effect(e, m.chances[i])));
        });
        return a;
    }
    const s2 = oSpell.options.substr(0, 2);
    const sOpt = oSpell.options.substr(2);
    const aOpt = [];
    for (let i = 0; i < sOpt.length; i++) {
        const c = sOpt.charAt(i);
        if (c === 'a') {
            const n = sOpt.charAt(i + 1) | 0;
            aOpt.push('area of effect' + (n ? ' (radius ' + n + ' half-cells)' : ''));
            i++;
        } else {
            aOpt.push(MISSILE_OPTIONS[c] || c);
        }
    }
    const bp = BLUEPRINTS_DATA[oSpell.blueprint];
    let sBp = '`' + oSpell.blueprint + '`';
    if (bp && bp.data) {
        sBp += ' (speed ' + bp.data.speed + ', range ' + bp.data.range + ')';
    }
    a.push('    - projectile ' + sBp + ', ' + (MISSILE_PATTERNS[s2] || s2) + (aOpt.length ? ', ' + aOpt.join(', ') : '') +
        ', energy cost ' + oSpell.cost);
    oSpell.effects.forEach((e, i) => a.push('      - ' + effect(e, oSpell.chances[i])));
    return a;
}

function cooldown(x, sSpell) {
    if (typeof x === 'string') {
        return MAGIC_DATA_PARAMS.COOLDOWN[x] / 1000 + ' s (' + x + ')';
    }
    return typeof x === 'number' ? x / 1000 + ' s' : 'the spell\'s own (' + sSpell + ')';
}

// vue de face (animation de repos, cinquième direction), agrandie ×2
function cropSprite(sId) {
    const t = MONSTERS_TILES[MONSTERS_BLUEPRINTS[sId].tile];
    if (!t) {
        return null;
    }
    const sSrc = join(ROOT, t.src);
    if (!existsSync(sSrc)) {
        return null;
    }
    const nFrame = t.animations[0][0][4];
    const sOut = join(IMAGES, sId + '.png');
    execFileSync('python3', ['-c', `
import sys
from PIL import Image
src, out, w, h, f = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
im = Image.open(src).convert('RGBA')
cols = im.size[0] // w
fr = im.crop(((f % cols) * w, (f // cols) * h, (f % cols) * w + w, (f // cols) * h + h))
box = fr.getbbox() or (0, 0, w, h)
fr.crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2), Image.NEAREST).save(out)
`, sSrc, sOut, String(t.width), String(t.height), String(nFrame)]);
    return 'images/' + sId + '.png';
}

function section(sId, oBest) {
    const bp = MONSTERS_BLUEPRINTS[sId];
    const d = bp.data;
    const sBookImg = BOOK_IMAGES[sId];
    const oPage = sBookImg ? oBest[sBookImg] : null;
    const a = [];
    a.push('## ' + (oPage ? oPage.title.replace(/^The /, '') + ' (`' + sId + '`)' : '`' + sId + '`'), '');
    let sImg = null;
    if (sBookImg && existsSync(join(ROOT, 'resources/gfx/books', sBookImg))) {
        sImg = '../resources/gfx/books/' + sBookImg;
    } else {
        sImg = cropSprite(sId);
    }
    if (sImg) {
        a.push('![' + sId + '](' + sImg + ')', '');
    }
    if (oPage && oPage.text) {
        a.push('> ' + oPage.text + ' — *' + oPage.book + '*', '');
    }

    a.push('### Vitals', '', '| | |', '|---|---|');
    a.push('| Thinker | `' + bp.thinker + '` |');
    a.push('| Vitality (hit points) | ' + MOB_LEVEL * d.vitality + ' |');
    a.push('| Move speed | ' + d.speed + ' |');
    a.push('| Power | ' + (d.power ? MOB_LEVEL * d.power : 0) + ' |');
    a.push('| Boss | ' + (d.flags.includes('B') ? 'yes (seals the level exit until killed)' : 'no') + ' |');
    a.push('| Score | ' + d.score + ' |');
    a.push('| Size | ' + bp.width + ' × ' + bp.height + ' |');
    a.push('| Tile | `' + bp.tile + '` |', '');
    a.push('**Behaviour:** ' + (THINKERS[bp.thinker] || '?'), '');

    a.push('### Resistances and properties', '');
    if (d.properties && d.properties.length) {
        d.properties.forEach((s) => {
            a.push('- ' + effect(ep.setEffectLevel(s, ep.getEffectLevel(s) + MOB_LEVEL)) + ' (data: `' + s + '`, +' + MOB_LEVEL + ' for the monster level)');
        });
    } else {
        a.push('None.');
    }
    a.push('');

    a.push('### Equipment', '');
    const oWeapon = ITEMS_DATA[d.weapon];
    if (oWeapon) {
        a.push('- **' + itemName(d.weapon) + '**, ' + oWeapon.type + ', one attack every ' + oWeapon.speed + ' ms');
        oWeapon.spells.forEach((oSlot, i) => {
            a.push('  - slot ' + i + ': `' + oSlot.ref + '`' + (oSlot.time ? ', charge ' + oSlot.time + ' ms' : ''));
            const oSpell = SPELLS_DATA[oSlot.ref];
            if (oSpell) {
                a.push(...spellLines(oSpell));
            }
        });
    } else {
        a.push('- unknown weapon `' + d.weapon + '`');
    }
    if (d.onWound) {
        a.push('- **When wounded:** casts ' + d.onWound.spell + ' on itself, at most once every ' + cooldown(d.onWound.cooldown, d.onWound.spell));
    }
    (d.casts || []).forEach((c) => {
        a.push('- **Magic:** ' + c.spell + ', ' + c.chance + ' % per cast, cooldown ' + cooldown(c.cooldown, c.spell) +
            (c.time ? ', ' + c.time + ' ms incantation' : ''));
    });
    a.push('');

    a.push('### Loot', '');
    const oLoot = LOOT_DATA[sId];
    if (oLoot) {
        const nC = Object.values(oLoot.chances).reduce((x, y) => x + y, 0);
        a.push('Number of items: ' + Object.entries(oLoot.chances).map(([n, w]) => n + ' (' + pct(w, nC) + ')').join(', ') + '.', '');
        const nI = Object.values(oLoot.items).reduce((x, y) => x + y, 0);
        a.push('| Item | Weight | Per draw |', '|---|---|---|');
        Object.entries(oLoot.items).forEach(([s, w]) => a.push('| ' + itemName(s) + ' | ' + w + ' | ' + pct(w, nI) + ' |'));
        if (oLoot.always && oLoot.always.length) {
            a.push('', 'Always dropped: ' + oLoot.always.map(itemName).join(', ') + '.');
        }
    } else {
        a.push('Nothing.');
    }
    a.push('');

    a.push('### Locations', '');
    const aLoc = locations(sId);
    a.push(aLoc.length ? aLoc.map((s) => '- ' + s).join('\n') : 'Not placed in any horde (spawned by a level script, or unused).');
    a.push('');
    return a.join('\n');
}

mkdirSync(IMAGES, { recursive: true });
const oBest = bestiary();
const aIds = Object.keys(MONSTERS_BLUEPRINTS);
const aOut = [
    '# Monsters',
    '',
    'Generated by `npm run doc:monsters` from the game data; do not edit by hand.',
    '',
    'Values are those of a monster in game: Game.js creates every monster at level ' + MOB_LEVEL +
    ', which multiplies vitality and power, and adds ' + MOB_LEVEL + ' to the level of each property.',
    'Effect codes are 7 characters: type, 4-letter subtype, level and duration (base 64, `A` = 0).',
    '',
    aIds.map((s) => {
        const oPage = BOOK_IMAGES[s] ? oBest[BOOK_IMAGES[s]] : null;
        const sTitle = oPage ? oPage.title.replace(/^The /, '') + ' (`' + s + '`)' : '`' + s + '`';
        const sAnchor = sTitle.toLowerCase().replace(/[^a-z0-9 _-]/g, '').replace(/ /g, '-');
        return '- [' + sTitle + '](#' + sAnchor + ')';
    }).join('\n'),
    '',
    ...aIds.map((s) => section(s, oBest))
];
writeFileSync(join(DOC, 'monster.md'), aOut.join('\n'));
console.log('documentation/monster.md: ' + aIds.length + ' monsters');
