import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Transistate } from '../../../../src-recovered/libraries/Raycaster/Transistate.js';
import { assertDefaults } from '../../helpers.mjs';

// Comme Engine (puis Game) : les états sont des méthodes de la sous-classe,
// choisies dès le constructeur de Transistate.
class Machine extends Transistate {
    stateA() {
        this.aLog.push('A');
    }

    stateB() {
        this.aLog.push('B');
        this.setDoomloop('stateA');
    }
}
Machine.prototype.aLog = null;

function machine(sState) {
    const m = new Machine(sState);
    m.aLog = [];
    return m;
}

describe('Transistate', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('a des valeurs par défaut', () => {
        assertDefaults(machine('stateA'), {
            nInterval: 160, oInterval: null, sDoomloopType: 'interval',
            bPause: false, nTimeModulo: 0, bBound: false
        });
    });

    it('choisit l\'état initial dans le constructeur', () => {
        const m = machine('stateA');
        expect(m.getDoomLoop()).toBe('stateA');
        expect(m.pDoomloop).toBe(Machine.prototype.stateA);
    });

    it('doomloop exécute l\'état courant, qui peut en changer', () => {
        const m = machine('stateB');
        m.doomloop();
        m.doomloop();
        expect(m.aLog).toEqual(['B', 'A']);
        expect(m.getDoomLoop()).toBe('stateA');
    });

    it('initDoomloop exécute l\'état puis le répète à intervalle', () => {
        const m = machine('stateA');
        m.initDoomloop();
        expect(m.aLog).toEqual(['A']);
        expect(m.bBound).toBe(true);
        expect(m.bPause).toBe(true);
        vi.advanceTimersByTime(160 * 3);
        expect(m.aLog).toEqual(['A', 'A', 'A', 'A']);
        m.pause();
    });

    it('pause arrête la boucle, resume la relance', () => {
        const m = machine('stateA');
        m.resume();
        // initDoomloop rappelle pause() : bPause reste à true même en marche
        expect(m.bPause).toBe(true);
        expect(m.oInterval).not.toBe(null);
        vi.advanceTimersByTime(160);
        expect(m.aLog).toEqual(['A', 'A']);
        m.pause();
        expect(m.bPause).toBe(true);
        expect(m.oInterval).toBe(null);
        vi.advanceTimersByTime(1000);
        expect(m.aLog).toEqual(['A', 'A']);
    });

    it('respecte un nInterval modifié', () => {
        const m = machine('stateA');
        m.nInterval = 50;
        m.resume();
        vi.advanceTimersByTime(100);
        expect(m.aLog.length).toBe(3);
        m.pause();
    });
});
