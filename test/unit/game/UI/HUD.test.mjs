import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas } from '../../canvas.mjs';

function stubBrowser() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
}
stubBrowser();
beforeEach(stubBrowser);

const { HUD } = await import('../../../../src-recovered/game/UI/HUD.js');
const { TileGrid } = await import('../../../../src-recovered/libraries/H5UI/TileGrid.js');

const row = (h, y) => h.oHUD._aCells[y].join(' ');

describe('HUD', () => {
    it('valeurs initiales', () => {
        const h = new HUD();
        expect(h.oHUD).toBeInstanceOf(TileGrid);
        expect([h.oCanvas, h.oContext]).toEqual([null, null]);
        expect(h.POSITIONS.genkeys).toEqual({ x: 6, y: 1, max: 99, pad: 2 });
        expect([h.TILE_VOID, h.TILE_ZERO, h.TILE_KEY_IRON, h.TILE_KEY_NONE, h.TILE_ZERO_GREEN]).toEqual([0, 1, 12, 17, 21]);
    });

    it('icônes posées à la construction, clés vides', () => {
        const h = new HUD();
        expect(row(h, 0)).toBe('-1 -1 -1 18 -1 -1 -1 -1 20 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1');
        expect(row(h, 1)).toBe('-1 -1 -1 19 -1 -1 -1 -1 12 -1 -1 17 17 17 17 -1 -1 -1 -1 -1');
    });

    it('vie, énergie, nourriture (verte si pleine), clés', () => {
        const h = new HUD();
        h.printLife(42);
        h.printEnergy(1234);
        h.printFood(1000, 1000); // plafonnée à 999, en vert
        h.printKeys(5);
        h.printGenericKeys(3);
        expect(row(h, 0)).toBe('0 5 3 18 -1 30 30 30 20 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1');
        expect(row(h, 1)).toBe('10 10 10 19 -1 -1 0 4 12 -1 -1 14 17 16 17 -1 -1 -1 -1 -1');
        expect(h.TILE_ZERO).toBe(1);
        h.printFood(500, 1000);
        expect(row(h, 0).split(' ').slice(5, 8)).toEqual(['6', '1', '1']);
    });

    it('rendu doublé sur le canvas de jeu', () => {
        const h = new HUD();
        const c = fakeCanvas(640, 400);
        h.setRenderCanvas(c);
        h.render();
        expect(c.getContext().drawImage).toHaveBeenCalledWith(h.oHUD._oCanvas, 0, 0, h.oHUD._nWidth, h.oHUD._nHeight, 0, 0, h.oHUD._nWidth * 2, h.oHUD._nHeight * 2);
        h.clear();
        expect(c.getContext().clearRect).toHaveBeenCalledWith(0, 0, 640, 400);
    });
});
