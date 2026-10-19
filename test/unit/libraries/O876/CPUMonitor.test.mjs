// CPUMonitor n'est utilisé nulle part dans le jeu.
import { describe, it, expect, vi } from 'vitest';
import { CPUMonitor } from '../../../../src-recovered/libraries/O876/CPUMonitor.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

function context() {
    const aRects = [];
    return {
        aRects,
        fillStyle: '',
        fillRect(x, y, w, h) {
            aRects.push([this.fillStyle, x, y, w, h]);
        }
    };
}

describe('CPUMonitor', () => {
    it('a des valeurs par défaut', () => {
        const m = new CPUMonitor();
        assertDefaults(m, { nTimes: 0, nIdleTime: 0 });
        expect(m.aTimes.length).toBe(32);
        expect(m.sTimes.length).toBe(32);
        expect(m.aColors.length).toBe(7);
    });

    it('ne partage pas ses tableaux entre instances', () => {
        assertNotShared(new CPUMonitor(), new CPUMonitor(), ['aTimes', 'sTimes', 'aColors']);
    });

    it('mesure les tranches et le temps mort entre deux cycles', () => {
        const now = vi.spyOn(Date, 'now').mockImplementation(() => 1000);
        const m = new CPUMonitor();
        m.start();
        m.trigger('ai', 1004);
        m.trigger('render', 1010);
        now.mockImplementation(() => 1016);
        m.start();
        expect(m.nIdleTime).toBe(6);
        expect(m.nTimes).toBe(1);
        expect(m.sTimes[0]).toBe('ai');
        expect(m.sTimes[1]).toBe('render');
    });

    it('dessine une barre par tranche puis le temps mort', () => {
        vi.spyOn(Date, 'now').mockImplementation(() => 0);
        const m = new CPUMonitor();
        m.start();
        m.trigger('a', 4);
        m.trigger('b', 10);
        m.nIdleTime = 5;
        const ctx = context();
        m.render(ctx, 100, 20);
        expect(ctx.aRects).toEqual([
            ['#F00', 100, 20, 4, 8],
            ['#0F0', 104, 20, 6, 8],
            ['#FF0', 110, 20, 5, 8]
        ]);
    });
});
