import { describe, it, expect } from 'vitest';
import { NoodList } from '../../../../../src-recovered/libraries/O876/Astar/NoodList.js';
import { assertDefaults, assertNotShared } from '../../../helpers.mjs';

const nood = (x, y) => ({ oPos: { x, y } });

describe('NoodList', () => {
    it('est vide au départ', () => {
        const l = new NoodList();
        assertDefaults(l, { aList: {} });
        expect(l.empty()).toBe(true);
        expect(l.count()).toBe(0);
    });

    it('ne partage pas sa liste entre instances', () => {
        assertNotShared(new NoodList(), new NoodList(), ['aList']);
    });

    it('indexe les noeuds par position', () => {
        const l = new NoodList();
        const a = nood(1, 2), b = nood(12, 0);
        l.add(a);
        l.add(b);
        expect(l.count()).toBe(2);
        expect(l.empty()).toBe(false);
        expect(l.exists(1, 2)).toBe(true);
        expect(l.get(12, 0)).toBe(b);
        expect(l.get(5, 5)).toBe(null);
    });

    it('ne confond pas (1, 12) et (11, 2)', () => {
        const l = new NoodList();
        l.set(1, 12, 'a');
        expect(l.exists(11, 2)).toBe(false);
    });

    it('set remplace, del supprime', () => {
        const l = new NoodList();
        l.set(1, 1, 'a');
        l.set(1, 1, 'b');
        expect(l.count()).toBe(1);
        expect(l.get(1, 1)).toBe('b');
        l.del(1, 1);
        expect(l.exists(1, 1)).toBe(false);
        expect(l.empty()).toBe(true);
    });
});
