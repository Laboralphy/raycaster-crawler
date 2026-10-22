import { describe, it, expect } from 'vitest';
import { MobileRegister } from '../../../../src/libraries/Raycaster/MobileRegister.js';
import { assertDefaults } from '../../helpers.mjs';

const mobile = (x, y) => ({ xSector: x, ySector: y, nSectorRank: -1 });

describe('MobileRegister', () => {
    it('crée une grille de secteurs vides', () => {
        const r = new MobileRegister(3);
        assertDefaults(r, { nSize: 3 });
        expect(r.get(2, 2)).toEqual([]);
        expect(r.get(0, 0)).not.toBe(r.get(0, 1));
    });

    it('get renvoie null hors de la grille', () => {
        const r = new MobileRegister(3);
        for (const [x, y] of [[-1, 0], [0, -1], [3, 0], [0, 3]]) {
            expect(r.get(x, y)).toBe(null);
        }
    });

    it('register range le mobile et note son rang', () => {
        const r = new MobileRegister(3);
        const a = mobile(1, 2), b = mobile(1, 2);
        r.register(a);
        r.register(b);
        expect(r.get(1, 2)).toEqual([a, b]);
        expect(a.nSectorRank).toBe(0);
        expect(b.nSectorRank).toBe(1);
    });

    it('unregister du dernier mobile remet son rang à -1', () => {
        const r = new MobileRegister(3);
        const a = mobile(0, 0);
        r.register(a);
        r.unregister(a);
        expect(r.get(0, 0)).toEqual([]);
        expect(a.nSectorRank).toBe(-1);
    });

    it('unregister met le dernier mobile à la place du mobile retiré', () => {
        const r = new MobileRegister(3);
        const a = mobile(0, 0), b = mobile(0, 0), c = mobile(0, 0);
        [a, b, c].forEach(m => r.register(m));
        r.unregister(a);
        expect(r.get(0, 0)).toEqual([c, b]);
        expect(c.nSectorRank).toBe(0);
    });

    it('ignore les mobiles hors de la grille', () => {
        const r = new MobileRegister(2);
        const m = mobile(5, 0);
        r.register(m);
        expect(m.nSectorRank).toBe(-1);
        r.unregister(m);
    });
});
