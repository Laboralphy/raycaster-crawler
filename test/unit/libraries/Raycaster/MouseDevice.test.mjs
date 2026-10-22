import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MouseDevice } from '../../../../src/libraries/Raycaster/MouseDevice.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

// élément DOM minimal qui garde ses écouteurs
function element() {
    const oListeners = {};
    return {
        oListeners,
        addEventListener: vi.fn((s, f) => { oListeners[s] = f; }),
        removeEventListener: vi.fn((s) => { delete oListeners[s]; })
    };
}

describe('MouseDevice', () => {
    beforeEach(() => vi.stubGlobal('window', {}));

    function plugged() {
        const m = new MouseDevice();
        const e = element();
        m.plugEvents(e);
        return [m, e.oListeners, e];
    }

    it('a des valeurs par défaut', () => {
        assertDefaults(new MouseDevice(), {
            nButtons: 0, aEvents: [], nKeyBufferSize: 16, bUseBuffer: true,
            nSecurityDelay: 0, oElement: null
        });
    });

    it('ne partage pas son tampon entre instances', () => {
        assertNotShared(new MouseDevice(), new MouseDevice(), ['aEvents']);
    });

    it('plugEvents branche les écouteurs, unplugEvents les retire', () => {
        const [m, oListeners, e] = plugged();
        expect(window.__mouseDevice).toBe(m);
        expect(m.oElement).toBe(e);
        expect(Object.keys(oListeners).sort()).toEqual(['DOMMouseScroll', 'click', 'mousedown', 'mouseup', 'mousewheel']);
        m.unplugEvents();
        expect(oListeners).toEqual({});
    });

    it('met les clics en tampon : [1 appui | 0 relâché, x, y, bouton]', () => {
        const [m, on] = plugged();
        expect(on.mousedown({ buttons: 1, clientX: 10, clientY: 20, button: 0 })).toBe(false);
        expect(m.nButtons).toBe(1);
        on.mouseup({ buttons: 0, clientX: 11, clientY: 21, button: 0 });
        expect(m.nButtons).toBe(0);
        expect(m.inputMouse()).toEqual([1, 10, 20, 0]);
        expect(m.inputMouse()).toEqual([0, 11, 21, 0]);
        expect(m.inputMouse()).toBe(undefined);
    });

    it('bloque la propagation du clic droit', () => {
        const [, on] = plugged();
        const e = { button: 2, stopPropagation: vi.fn() };
        on.mousedown(e);
        expect(e.stopPropagation).toHaveBeenCalledOnce();
        expect(e.cancelBubble).toBe(true);
        const c = { button: 2, stopPropagation: vi.fn() };
        expect(on.click(c)).toBe(false);
        expect(c.cancelBubble).toBe(true);
        const l = { button: 0 };
        on.click(l);
        expect(l.cancelBubble).toBe(undefined);
    });

    it('traduit la molette en ±3', () => {
        const [m, on] = plugged();
        on.mousewheel({ wheelDelta: 120 });
        on.mousewheel({ wheelDelta: -120 });
        on.DOMMouseScroll({ detail: 3 });
        on.DOMMouseScroll({ detail: -3 });
        expect(m.aEvents).toEqual([[3, 0, 0, 3], [-3, 0, 0, 3], [-3, 0, 0, 3], [3, 0, 0, 3]]);
    });

    it('limite le tampon et peut le désactiver', () => {
        const [m, on] = plugged();
        for (let i = 0; i < 20; i++) {
            on.mousedown({ button: 0 });
        }
        expect(m.aEvents.length).toBe(16);
        m.clearEvents();
        m.bUseBuffer = false;
        on.mousedown({ button: 0 });
        expect(m.aEvents).toEqual([]);
    });

    it('le délai de sécurité vide le tampon pendant quelques lectures', () => {
        const [m, on] = plugged();
        m.nSecurityDelay = 1;
        on.mousedown({ button: 0 });
        expect(m.inputMouse()).toBe(null);
        expect(m.aEvents).toEqual([]);
        on.mousedown({ button: 0, clientX: 1, clientY: 2 });
        expect(m.inputMouse()).toEqual([1, 1, 2, 0]);
    });
});
