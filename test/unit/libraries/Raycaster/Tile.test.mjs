import { describe, it, expect } from 'vitest';
import { Tile } from '../../../../src/libraries/Raycaster/Tile.js';
import { Animation } from '../../../../src/libraries/Raycaster/Animation.js';
import { assertDefaults } from '../../helpers.mjs';

describe('Tile', () => {
    it('valeurs initiales, sans données', () => {
        assertDefaults(new Tile(), {
            oImage: null, nWidth: 0, nHeight: 0, sSource: null, nFrames: 0,
            aAnimations: null, bShading: true, nScale: 1
        });
    });

    it('lit les données', () => {
        const t = new Tile({ src: 'a.png', frames: 4, width: 64, height: 96, scale: 2, noshading: true });
        assertDefaults(t, {
            oImage: null, sSource: 'a.png', nFrames: 4, nWidth: 64, nHeight: 96,
            nScale: 2, bShading: false, aAnimations: null
        });
        expect(new Tile({ src: 'a.png' }).bShading).toBe(true);
        expect(new Tile({ src: 'a.png' }).nScale).toBe(1);
    });

    it('8 animations (une par direction) par animation, null gardé', () => {
        const t = new Tile({
            src: 'a.png', frames: 59, width: 64, height: 96,
            animations: [[[25, 31, 37, 43, 1, 7, 13, 19], 3, 150, 2], null]
        });
        expect(t.aAnimations).toHaveLength(16);
        const a = t.aAnimations[4];
        expect(a).toBeInstanceOf(Animation);
        expect([a.nStart, a.nCount, a.nDuration, a.nLoop]).toEqual([1, 3, 150, 2]);
        expect(t.aAnimations.slice(8)).toEqual(Array(8).fill(null));
        expect(t.aAnimations[0]).not.toBe(t.aAnimations[1]);
    });
});
