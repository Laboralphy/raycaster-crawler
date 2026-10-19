// Easing n'est utilisé nulle part dans le jeu.
import { describe, it, expect } from 'vitest';
import { Easing } from '../../../../src-recovered/libraries/O876/Easing.js';
import { assertDefaults } from '../../helpers.mjs';

describe('Easing', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Easing(), {
            xStart: 0, yStart: 0, xEnd: 0, yEnd: 0, x: 0, y: 0,
            bXCompute: true, bYCompute: true, nTime: 0, iTime: 0,
            fWeight: 1, sFunction: 'smoothstep'
        });
    });

    it('déplace en 2D de manière linéaire', () => {
        const e = new Easing();
        e.setFunction('linear');
        e.setMove(0, 100, 10, 200, 10);
        expect(e.move(5)).toBe(false);
        expect(e.x).toBe(5);
        expect(e.y).toBe(150);
        expect(e.move(10)).toBe(true);
        expect(e.x).toBe(10);
        expect(e.y).toBe(200);
    });

    it('setMove à trois arguments : x, xFin, durée', () => {
        const e = new Easing();
        e.setFunction('linear');
        e.setMove(10, 20, 4);
        expect(e.nTime).toBe(4);
        expect(e.bYCompute).toBe(false);
        e.move(2);
        expect(e.x).toBe(15);
        expect(e.y).toBe(0);
    });

    it('move sans argument avance d\'un pas', () => {
        const e = new Easing();
        e.setFunction('linear');
        e.setMove(0, 4, 4);
        e.move();
        e.move();
        expect(e.iTime).toBe(2);
        expect(e.x).toBe(1);
        e.move();
        e.move();
        expect(e.move()).toBe(true);
        expect(e.x).toBe(4);
    });

    it('utilise smoothstep par défaut', () => {
        const e = new Easing();
        e.setMove(0, 100, 4);
        e.move(1);
        expect(e.x).toBe(100 * e.smoothstep(0.25));
    });

    it('les fonctions vont de 0 à 1', () => {
        const e = new Easing();
        e.nTime = 1;
        for (const f of ['linear', 'smoothstep', 'smoothstepX2', 'smoothstepX3', 'squareAccel',
            'squareDeccel', 'cubeAccel', 'cubeDeccel', 'cosine', 'weightAverage']) {
            expect(Math.abs(e[f](0) - (f === 'weightAverage' ? 1 : 0)) < 1e-6, f + '(0)').toBeTruthy();
            expect(Math.abs(e[f](1) - 1) < 1e-6, f + '(1)').toBeTruthy();
        }
        expect(Math.abs(e.sine(1) - 1) < 1e-6).toBeTruthy();
        expect(e.smoothstep(0.5)).toBe(0.5);
    });
});
