import { describe, it, expect } from 'vitest';
import { CovenThrone } from '../../../../src/game/levels/CovenThrone.js';
import { HellkeepThrone } from '../../../../src/game/levels/HellkeepThrone.js';
import { LevelProcessor } from '../../../../src/game/levels/LevelProcessor.js';

// salle de 7 × 7 cases vides dans un mur : distances au mur 1, 2, 3, 4
function hall(pClass) {
    const n = 9;
    const map = [];
    for (let y = 0; y < n; ++y) {
        map.push([]);
        for (let x = 0; x < n; ++x) {
            const bWall = x === 0 || y === 0 || x === n - 1 || y === n - 1;
            map[y].push(bWall ? LevelProcessor.cell(1, LevelProcessor.PHYS_WALL) : 0);
        }
    }
    const blocks = map.map((aRow) => aRow.map(() => 0));
    const data = { map, walls: { codes: [[0, 0], [5, 5]] }, flats: { codes: [[0, 1], [0, 1]] } };
    const p = new pClass({ area: 'x', floor: 0, seed: 1, blocks, data });
    p.run();
    return { p, data };
}

describe.each([['CovenThrone', CovenThrone], ['HellkeepThrone', HellkeepThrone]])('%s', (sName, pClass) => {
    it('au milieu de la salle (à plus de 2 cases du mur), pas de plafond', () => {
        const { data } = hall(pClass);
        const nSky = LevelProcessor.materialOf(data.map[4][4]);
        expect(nSky).toBeGreaterThan(1);
        expect(data.flats.codes[nSky][1]).toBe(-1);
        expect(data.map[3][3]).toBe(data.map[4][4]);
        expect(data.map[2][2]).toBe(0);
    });

    it('à 2 cases du mur, un mur transparent de texture 61 à l\'étage', () => {
        const { data } = hall(pClass);
        const nGlass = data.uppermap[2][2];
        expect(LevelProcessor.physOf(nGlass)).toBe(LevelProcessor.PHYS_TRANSPARENT_BLOCK);
        expect(data.walls.codes[LevelProcessor.materialOf(nGlass)]).toEqual([61, 61]);
        expect(data.uppermap[1][1]).toBe(0);
        expect(data.uppermap[4][4]).toBe(0);
    });
});

describe('HellkeepThrone', () => {
    it('reprend le traitement de la salle du trône du cercle des sorcières', () => {
        expect(new HellkeepThrone({ data: {} })).toBeInstanceOf(CovenThrone);
        expect(HellkeepThrone.UPPER_TEXTURE).toBe(61);
    });
});
