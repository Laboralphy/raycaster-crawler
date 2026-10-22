import { describe, it, expect } from 'vitest';
import { Nood } from '../../../../../src/libraries/O876/Astar/Nood.js';
import { Point } from '../../../../../src/libraries/O876/Astar/Point.js';
import { assertDefaults, assertNotShared } from '../../../helpers.mjs';

describe('Nood', () => {
    it('valeurs initiales', () => {
        const n = new Nood();
        assertDefaults(n, { fGCost: 0, fHCost: 0, fFCost: 0 });
        expect(n.oParent).toBeInstanceOf(Point);
        expect(n.oPos).toBeInstanceOf(Point);
        assertNotShared(n, new Nood(), ['oParent', 'oPos']);
        expect(n.oParent).not.toBe(n.oPos);
    });

    it('isRoot : le parent est la position', () => {
        const n = new Nood();
        expect(n.isRoot()).toBe(true);
        n.oPos.x = 3;
        expect(n.isRoot()).toBe(false);
        n.oParent.x = 3;
        expect(n.isRoot()).toBe(true);
    });
});
