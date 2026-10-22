import { describe, it, expect, vi } from 'vitest';

// config.js interroge le navigateur au chargement
vi.stubGlobal('location', { search: '' });
vi.stubGlobal('document', {});
const { ForestTorchLights } = await import('../../../../src/game/levels/ForestTorchLights.js');
const { LABY } = await import('../../../../src/game/data/LABY.js');
const { CONFIG } = await import('../../../../src/game/config.js');

// carte de blocs : '#' mur, 'T' mur à torche, '.' vide
function level(aRows) {
    const blocks = aRows.map((s) => Array.from(s, (c) => ({ '#': LABY.BLOCK_WALL, 'T': LABY.BLOCK_WALL_TORCH, '.': LABY.BLOCK_VOID })[c]));
    const map = aRows.map((s) => Array.from(s, (c) => (c === '.' ? 0 : 0x101)));
    const data = { map, walls: { codes: [[0, 0]] } };
    new ForestTorchLights({ area: 'forest', floor: 0, seed: 1, blocks, data }).run();
    return (data.lights || []).map((o) => [o.x, o.y]);
}

describe('ForestTorchLights', () => {
    it('une lumière sur chaque case vide voisine d\'un mur à torche', () => {
        expect(level([
            '#####',
            '#.T.#',
            '#...#',
            '#####'
        ])).toEqual([[3, 1], [2, 2], [1, 1]]);
    });

    it('une seule lumière entre deux torches, aucune sans torche', () => {
        expect(level([
            '#####',
            '#T.T#',
            '#####'
        ])).toEqual([[2, 1]]);
        expect(level(['###', '#.#', '###'])).toEqual([]);
    });

    it('les réglages de CONFIG.raycaster.wallTorchLight', () => {
        const blocks = [[LABY.BLOCK_WALL_TORCH, LABY.BLOCK_VOID]];
        const data = { map: [[0x101, 0]], walls: { codes: [[0, 0]] } };
        new ForestTorchLights({ area: 'forest', floor: 1, seed: 1, blocks, data }).run();
        const { r0, r1, v } = CONFIG.raycaster.wallTorchLight;
        expect(data.lights).toEqual([{ x: 1, y: 0, r0, r1, v }]);
    });
});
