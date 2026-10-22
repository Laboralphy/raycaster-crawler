import { describe, it, expect } from 'vitest';
import { Blueprint } from '../../../../src-recovered/libraries/Raycaster/Blueprint.js';
import { assertDefaults } from '../../helpers.mjs';

describe('Blueprint', () => {
    it('a des valeurs par défaut sans données', () => {
        assertDefaults(new Blueprint(), {
            sId: '', nType: 0, oTile: null, nPhysWidth: 0, nPhysHeight: 0,
            sThinker: '', nFx: 0, nElevation: null, oXData: null
        });
    });

    it('lit les données d\'un plan', () => {
        const b = new Blueprint({
            width: 40, height: 96, thinker: 'Rusher', fx: 2, type: 3,
            data: { vitality: 5 }
        });
        assertDefaults(b, {
            nPhysWidth: 40, nPhysHeight: 96, sThinker: 'Rusher', nFx: 2, nType: 3,
            sId: '', oTile: null
        });
        expect(b.getData('vitality')).toBe(5);
        expect(b.getData('speed')).toBe(null);
    });

    it('a des données vides si le plan n\'en a pas', () => {
        const b = new Blueprint({ width: 1, height: 1, thinker: null, fx: 0, type: 1 });
        expect(b.oXData).toEqual({});
        expect(b.oXData).not.toBe(new Blueprint({ type: 1 }).oXData);
    });

    it('lit la hauteur du centre du sprite au-dessus du sol', () => {
        expect(new Blueprint({ width: 1, height: 1, fx: 0, type: 4, elevation: 24 }).nElevation).toBe(24);
        expect(new Blueprint({ width: 1, height: 1, fx: 0, type: 4 }).nElevation).toBe(null);
    });
});
