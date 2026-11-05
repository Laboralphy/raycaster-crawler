// Le générateur de labyrinthe tourne dans le navigateur : la carte doit être
// exactement celle que renvoyait server.js (/dynamics/laby/laby.php), qui
// recevait la graine et les options en chaînes dans l'URL et répondait
// generateLaby(g, s, o).renderJSON().
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { generateLevelMap } from '../../../src/game/labyGenerator.js';
import { dungeons } from '../../../src/game/data/WORLD_DATA.dungeons.js';

const require = createRequire(import.meta.url);
const { generateLaby, GENERATORS } = require('../../../laby/index.js');

function serverMap(sGenerator, nSeed, sOptions) {
    return JSON.parse(generateLaby(sGenerator, nSeed.toString(), sOptions).renderJSON());
}

// tous les étages générés du jeu, avec les options ajoutées par
// Adventure.seedLevels (-sN : magasins) et Adventure.config (-p1 : portail)
const aFloors = [];
for (const [sArea, aLevels] of Object.entries(dungeons)) {
    aLevels.forEach((d, i) => {
        if (d.generator && !('map' in d)) {
            aFloors.push([`${sArea}[${i}]`, d.generator, d.options + '-s' + (d.shops ?? []).length + '-p1']);
        }
    });
}

const SEEDS = [0, 1, 12345, 0x0FFFFFFF, 0x10000000 - 1, 987654321];

describe('generateLevelMap', () => {
    it.each(aFloors)('%s (%s %s) : même carte que le serveur', (sName, sGenerator, sOptions) => {
        for (const nSeed of SEEDS) {
            expect(generateLevelMap(sGenerator, nSeed, sOptions), `graine ${nSeed}`)
                .toEqual(serverMap(sGenerator, nSeed, sOptions));
        }
    });

    it.each(GENERATORS)('générateur %s, sans options', (sGenerator) => {
        expect(generateLevelMap(sGenerator, 42, '')).toEqual(serverMap(sGenerator, 42, ''));
    });

    it('graine et options absentes : comme le serveur (0 et chaîne vide)', () => {
        expect(generateLevelMap('dungeon')).toEqual(serverMap('dungeon', 0, ''));
    });

    it('renvoie une grille de nombres, pas une chaîne', () => {
        const aMap = generateLevelMap('dungeon', 7, '-ls1');
        expect(Array.isArray(aMap)).toBe(true);
        expect(aMap.length).toBeGreaterThan(0);
        expect(aMap.every((row) => Array.isArray(row) && row.every((n) => typeof n === 'number'))).toBe(true);
    });

    it('générateur inconnu : erreur', () => {
        expect(() => generateLevelMap('nope', 1, '')).toThrow(/unknown generator/);
    });
});
