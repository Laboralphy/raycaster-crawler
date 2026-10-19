import { describe, it, expect, vi } from 'vitest';
import { GXManager } from '../../../../src-recovered/libraries/Raycaster/GXManager.js';
import { assertNotShared } from '../../helpers.mjs';

function fx(nLife) {
    return {
        nLife,
        process: vi.fn(function () { this.nLife--; }),
        isOver: vi.fn(function () { return this.nLife <= 0; }),
        render: vi.fn(),
        done: vi.fn(),
        terminate: vi.fn()
    };
}

describe('GXManager', () => {
    it('valeurs initiales', () => {
        const m = new GXManager();
        expect(m.aEffects).toEqual([]);
        assertNotShared(m, new GXManager(), ['aEffects']);
    });

    it('addEffect, count, render', () => {
        const m = new GXManager();
        const a = fx(1);
        expect(m.addEffect(a)).toBe(a);
        m.addEffect(fx(1));
        expect(m.count()).toBe(2);
        m.render();
        expect(a.render).toHaveBeenCalled();
    });

    it('process : retire les effets finis, après done', () => {
        const m = new GXManager();
        const a = m.addEffect(fx(1));
        const b = m.addEffect(fx(2));
        m.process();
        expect(a.done).toHaveBeenCalled();
        expect(m.aEffects).toEqual([b]);
        m.process();
        expect(m.count()).toBe(0);
    });

    it('clear : termine tout', () => {
        const m = new GXManager();
        const a = m.addEffect(fx(5));
        m.clear();
        expect(a.terminate).toHaveBeenCalled();
        expect(a.done).toHaveBeenCalled();
        expect(m.count()).toBe(0);
    });
});
