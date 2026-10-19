import { describe, it, expect, vi } from 'vitest';
import { Horde } from '../../../../src-recovered/libraries/Raycaster/Horde.js';
import { MobileRegister } from '../../../../src-recovered/libraries/Raycaster/MobileRegister.js';
import { MobileDispenser } from '../../../../src-recovered/libraries/Raycaster/MobileDispenser.js';
import { Tile } from '../../../../src-recovered/libraries/Raycaster/Tile.js';
import { Blueprint } from '../../../../src-recovered/libraries/Raycaster/Blueprint.js';
import { Mobile } from '../../../../src-recovered/libraries/Raycaster/Mobile.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

// raycaster minimal : chargeur d'images, grille de secteurs 4 × 4 de 64
function raycaster() {
    const rc = {
        nPlaneSpacing: 64,
        oImages: { load: vi.fn((s) => ({ src: s, width: 64, height: 96 })) },
        oMobileSectors: new MobileRegister(4)
    };
    rc.oHorde = new Horde(rc);
    return rc;
}

// une apparence, un plan statique et un plan pensant
function populate(h) {
    h.defineTile('t_gob', { src: 'gob.png', frames: 1, width: 64, height: 96 });
    h.defineBlueprint('b_static', { tile: 't_gob', width: 20, height: 20, thinker: null, fx: 0, type: 1 });
    h.defineBlueprint('b_mob', { tile: 't_gob', width: 40, height: 64, thinker: 'Mob', fx: 0, type: 2 });
    h.oThinkerManager = {
        createThinker: vi.fn(() => ({ think: vi.fn(), oMobile: null }))
    };
}

describe('Raycaster Horde', () => {
    it('valeurs initiales', () => {
        const rc = raycaster();
        const h = rc.oHorde;
        assertDefaults(h, {
            oRaycaster: rc, oThinkerManager: null, aMobiles: [], aStatics: [], aSprites: [],
            oBlueprints: {}, oTiles: {}, nTileCount: 0, oImageLoader: rc.oImages,
            xTonari: [0, 0, 1, 1, 1, 0, -1, -1, -1],
            yTonari: [0, -1, -1, 0, 1, 1, 1, 0, -1]
        });
        expect(h.oMobileDispenser).toBeInstanceOf(MobileDispenser);
        assertNotShared(h, new Horde(rc), ['aMobiles', 'aStatics', 'aSprites', 'oBlueprints', 'oTiles', 'oMobileDispenser']);
    });

    it('defineTile charge l\'image et compte les tuiles', () => {
        const h = raycaster().oHorde;
        const t = h.defineTile('t_a', { src: 'a.png', frames: 1, width: 64, height: 96 });
        expect(t).toBeInstanceOf(Tile);
        expect(t.oImage.src).toBe('a.png');
        expect(h.oTiles.t_a).toBe(t);
        expect(h.nTileCount).toBe(1);
        expect(h.getAllocatedMemory()).toBe(64 * 96 * 4);
    });

    it('defineBlueprint relie l\'apparence', () => {
        const h = raycaster().oHorde;
        populate(h);
        const bp = h.oBlueprints.b_mob;
        expect(bp).toBeInstanceOf(Blueprint);
        expect(bp.sId).toBe('b_mob');
        expect(bp.oTile).toBe(h.oTiles.t_gob);
    });

    it('defineMobile : statique (sans thinker) ou pensant', () => {
        const rc = raycaster();
        const h = rc.oHorde;
        populate(h);
        const s = h.defineMobile({ blueprint: 'b_static', x: 32, y: 32, angle: 0 });
        expect(s).toBeInstanceOf(Mobile);
        expect(h.aStatics).toEqual([s]);
        expect([s.bVisible, s.bEthereal, s.bActive]).toEqual([true, true, true]);
        const m = h.defineMobile({ blueprint: 'b_mob', x: 96, y: 160, angle: 1 });
        expect(h.oThinkerManager.createThinker).toHaveBeenCalledWith('Mob');
        expect(h.aMobiles).toEqual([m]);
        expect([m.x, m.y, m.fTheta, m.nSize, m.xSector, m.ySector]).toEqual([96, 160, 1, 20, 1, 2]);
        expect(m.oThinker.oMobile).toBe(m);
        expect(h.getMobile(0)).toBe(m);
        expect(h.getMobileCount()).toBe(1);
        expect(h.aSprites).toHaveLength(2);
    });

    it('think : un mobile inactif retourne au distributeur, puis est réutilisé', () => {
        const h = raycaster().oHorde;
        populate(h);
        const m = h.spawnMobile('b_mob', 96, 96, 0);
        m.bActive = false;
        h.think();
        expect(m.oThinker.think).toHaveBeenCalled();
        expect(h.getMobileCount()).toBe(0);
        const m2 = h.spawnMobile('b_mob', 160, 96, 2);
        expect(m2).toBe(m);
        expect([m2.x, m2.fTheta, m2.bActive]).toEqual([160, 2, true]);
        expect(h.oThinkerManager.createThinker).toHaveBeenCalledTimes(1);
    });

    it('unlinkMobile retire aussi un statique de sa case', () => {
        const rc = raycaster();
        const h = rc.oHorde;
        populate(h);
        const s = h.defineMobile({ blueprint: 'b_static', x: 32, y: 32, angle: 0 });
        h.unlinkMobile(s);
        expect(h.aStatics).toEqual([]);
        expect([s.xSector, s.ySector]).toEqual([-1, -1]);
        expect(rc.oMobileSectors.get(0, 0)).toEqual([]);
    });

    it('computeCollision : le voisin le plus proche dans les 9 secteurs', () => {
        const h = raycaster().oHorde;
        populate(h);
        const a = h.spawnMobile('b_mob', 96, 96, 0);
        const b = h.spawnMobile('b_mob', 120, 96, 0);
        expect(b.oMobileCollision).toBe(a);
        h.computeCollision(a);
        expect(a.oMobileCollision).toBe(b);
        b.setXY(200, 200);
        h.computeCollision(a);
        expect(a.oMobileCollision).toBe(null);
    });
});
