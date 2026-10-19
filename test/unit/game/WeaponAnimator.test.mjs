import { describe, it, expect } from 'vitest';
import { WeaponAnimator } from '../../../src-recovered/game/WeaponAnimator.js';
import { Animation } from '../../../src-recovered/libraries/Raycaster/Animation.js';
import { assertDefaults, assertNotShared } from '../helpers.mjs';

describe('WeaponAnimator', () => {
    it('valeurs initiales', () => {
        const w = new WeaponAnimator();
        assertDefaults(w, {
            oWeaponLayer: null, oRaycaster: null, bInvalid: true, wScreen: 0, hScreen: 0,
            xWeapon: 0, yWeapon: 0, xCalibration: 0, yCalibration: 0, xShift: 0, yShift: 0,
            nDraw: 0, nDrawSpeed: 20, fOscilloSpeed: 0, oAnimationLibrary: null, sTile: '', sAnim: ''
        });
        expect(w.oAnimation).toBeInstanceOf(Animation);
        assertNotShared(w, new WeaponAnimator(), ['oAnimation']);
    });

    it('selectWeapon : tuile, animations du modèle, arme à dégainer', () => {
        const w = new WeaponAnimator();
        w.selectWeapon({ model: 'fyre' });
        expect(w.sTile).toBe('w_wands');
        expect(w.oAnimationLibrary.ready.nStart).toBe(3);
        expect(w.oAnimationLibrary.stabbing.nStart).toBe(4);
        expect(w.nDraw).toBe(120);
        expect(w.sAnim).toBe('ready');
        expect(w.oAnimation.nStart).toBe(3);
    });

    it('compute : l\'arme remonte en dégainant, puis oscille en marchant', () => {
        const w = new WeaponAnimator();
        w.selectWeapon({ model: 'brass' });
        w.calibrateWeapon(100, 50);
        w.compute(0, false, 'ready');
        expect(w.nDraw).toBe(115);
        expect([w.xWeapon, w.yWeapon]).toEqual([100, 165]);
        for (let i = 0; i < 30; i++) {
            w.compute(0, false, 'ready');
        }
        expect(w.nDraw).toBe(0);
        expect([w.xWeapon, w.yWeapon]).toEqual([100, 50]);
        w.fOscilloSpeed = 90;
        w.compute(1, true, 'ready');
        expect(w.xWeapon).toBe(131); // 32 × sin 90° en flottant, tronqué
        expect(w.yWeapon).toBe(50);
    });

    it('compute : change d\'animation', () => {
        const w = new WeaponAnimator();
        w.selectWeapon({ model: 'brass' });
        w.compute(0, false, 'stabbing');
        expect(w.sAnim).toBe('stabbing');
        expect(w.nIndex).toBe(21);
        w.compute(0, false, 'stabbing');
        w.compute(0, false, 'stabbing');
        w.compute(0, false, 'stabbing');
        w.compute(0, false, 'stabbing');
        expect(w.nIndex).toBe(22);
    });
});
