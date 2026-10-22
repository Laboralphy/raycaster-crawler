// Effets du moteur dérivés de GXEffect : GXDoor, GXSecret, GXFade, GXFlash, GXMessage.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GXEffect } from '../../../../src/libraries/Raycaster/GXEffect.js';
import { GXDoor } from '../../../../src/libraries/Raycaster/GXDoor.js';
import { GXSecret } from '../../../../src/libraries/Raycaster/GXSecret.js';
import { GXFade } from '../../../../src/libraries/Raycaster/GXFade.js';
import { GXFlash } from '../../../../src/libraries/Raycaster/GXFlash.js';
import { GXMessage } from '../../../../src/libraries/Raycaster/GXMessage.js';
import { Marker } from '../../../../src/libraries/O876/Marker.js';
import { assertDefaults } from '../../helpers.mjs';
import { fakeRaycaster, stubDocument } from '../../canvas.mjs';

// carte factice : codes physiques, décalages, et secteurs de mobiles
function mapRaycaster(nCode) {
    const oPhys = {};
    const key = (x, y) => x + ',' + y;
    const rc = fakeRaycaster({
        oDoors: Marker.create(),
        nPlaneSpacing: 64,
        PHYS_DOOR_SLIDING_DOUBLE: 5,
        PHYS_DOOR_SLIDING_LEFT: 6,
        PHYS_DOOR_SLIDING_RIGHT: 7,
        PHYS_SECRET_BLOCK: 9,
        aMobiles: [],
        oPhys,
        getMapXYPhysical: (x, y) => oPhys[key(x, y)] ?? nCode,
        setMapXYPhysical: vi.fn((x, y, n) => { oPhys[key(x, y)] = n; }),
        setMapXYOffset: vi.fn()
    });
    rc.oMobileSectors = { get: () => rc.aMobiles };
    return rc;
}

function runUntilOver(oGX, nMax = 1000) {
    let n = 0;
    while (!oGX.isOver() && n++ < nMax) {
        oGX.process();
    }
    return n;
}

describe('GXDoor', () => {
    it('a des valeurs par défaut', () => {
        const rc = mapRaycaster(3);
        const d = new GXDoor(rc);
        expect(d).toBeInstanceOf(GXEffect);
        assertDefaults(d, {
            sClass: 'Door', oRaycaster: rc, nPhase: 0, x: 0, y: 0, fOffset: 0,
            nMaxTime: 3000, nTime: 3000, fSpeed: 0, nLimit: 0, nCode: 0,
            nAutoclose: 50
        });
    });

    it('setAutoClose', () => {
        const d = new GXDoor(mapRaycaster(3));
        d.setAutoClose(false);
        expect(d.nAutoclose).toBe(0);
        d.setAutoClose(true);
        expect(d.nAutoclose).toBe(50);
    });

    it('s\'ouvre, reste ouverte, puis se referme', () => {
        const rc = mapRaycaster(3);
        const d = new GXDoor(rc);
        d.x = 2;
        d.y = 4;
        d.process();
        expect(Marker.getMarkXY(rc.oDoors, 2, 4)).toBe(d);
        expect(d.nLimit).toBe(96);
        expect(d.fSpeed).toBe(6);
        while (d.nPhase === 1) {
            d.process();
        }
        expect(rc.oPhys['2,4']).toBe(0);
        expect(d.fOffset).toBe(95);
        while (d.nPhase === 2) {
            d.process();
        }
        expect(rc.oPhys['2,4']).toBe(3);
        runUntilOver(d);
        expect(d.nPhase).toBe(4);
        expect(Marker.getMarkXY(rc.oDoors, 2, 4)).toBeFalsy();
        expect(rc.setMapXYOffset).toHaveBeenLastCalledWith(2, 4, 0);
    });

    it('les portes coulissantes ont leur course', () => {
        const d2 = new GXDoor(mapRaycaster(5));
        d2.process();
        expect(d2.nLimit).toBe(32);
        expect(d2.fSpeed).toBe(3);
        const d1 = new GXDoor(mapRaycaster(6));
        d1.process();
        expect(d1.nLimit).toBe(64);
    });

    it('ne se referme pas sur un mobile', () => {
        const rc = mapRaycaster(3);
        const d = new GXDoor(rc);
        while (d.nPhase < 2) {
            d.process();
        }
        rc.aMobiles = [{}];
        d.nTime = 0;
        d.process();
        expect(d.nPhase).toBe(2);
        expect(d.nTime).toBe(1500);
    });

    it('close(true) force la fermeture d\'une porte ouverte', () => {
        const d = new GXDoor(mapRaycaster(3));
        while (d.nPhase < 2) {
            d.process();
        }
        d.close(true);
        expect(d.nPhase).toBe(3);
        expect(d.nTime).toBe(0);
    });

    it('terminate avant ouverture', () => {
        const d = new GXDoor(mapRaycaster(3));
        d.terminate();
        expect(d.isOver()).toBe(true);
    });
});

describe('GXSecret', () => {
    it('a des valeurs par défaut', () => {
        const rc = mapRaycaster(0);
        assertDefaults(new GXSecret(rc), {
            sClass: 'Secret', oRaycaster: rc, nPhase: 0, x: 0, y: 0,
            fOffset: 0, fSpeed: 0, nLimit: 64
        });
    });

    it('pousse le bloc secret vers un bloc voisin puis libère le passage', () => {
        const rc = mapRaycaster(0);
        rc.oPhys['3,2'] = rc.PHYS_SECRET_BLOCK;
        rc.oPhys['4,2'] = rc.PHYS_SECRET_BLOCK;
        const s = new GXSecret(rc);
        s.x = 3;
        s.y = 2;
        s.process();
        expect(s.fSpeed).toBe(2);
        expect(Marker.getMarkXY(rc.oDoors, 3, 2)).toBe(s);
        runUntilOver(s);
        expect(s.nPhase).toBe(3);
        expect(s.x).toBe(4);
        expect(rc.oPhys['3,2']).toBe(0);
        expect(rc.oPhys['4,2']).toBe(0);
        expect(Marker.getMarkXY(rc.oDoors, 4, 2)).toBeFalsy();
    });

    it('terminate avant de bouger', () => {
        const s = new GXSecret(mapRaycaster(0));
        s.terminate();
        expect(s.isOver()).toBe(true);
    });
});

describe.each([
    ['GXFade', GXFade, 'FadeOut'],
    ['GXFlash', GXFlash, 'Flash']
])('%s', (sName, GX, sClass) => {
    it('a des valeurs par défaut', () => {
        const rc = fakeRaycaster();
        assertDefaults(new GX(rc), {
            sClass, oRaycaster: rc, oCanvas: rc.oCanvas, oContext: rc.oCanvas.getContext('2d'),
            nTime: 0, fAlpha: 0, fAlphaFade: 0, oColor: null
        });
    });

    it('peint la couleur avec l\'alpha courant', () => {
        const rc = fakeRaycaster();
        const g = new GX(rc);
        g.oColor = { r: 255, g: 0, b: 0, a: 1 };
        g.fAlpha = 0.5;
        g.fAlphaFade = 0.25;
        g.process();
        g.render();
        const ctx = rc.oCanvas.getContext('2d');
        expect(g.oColor.a).toBe(0.5);
        expect(ctx.fillStyle).toBe('rgba(255, 0, 0, 0.5)');
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 320, 200);
    });
});

describe('GXFade (fondu)', () => {
    it('monte jusqu\'à 1 ou descend jusqu\'à 0 selon fAlphaFade', () => {
        const g = new GXFade(fakeRaycaster());
        g.oColor = { r: 0, g: 0, b: 0, a: 0 };
        g.fAlphaFade = 0.25;
        expect(runUntilOver(g)).toBe(4);
        expect(g.fAlpha).toBe(1);
        g.fAlphaFade = -0.5;
        expect(runUntilOver(g)).toBe(2);
        g.fAlphaFade = 0.1;
        g.terminate();
        expect(g.fAlpha).toBe(1);
    });
});

describe('GXFlash (éclair)', () => {
    it('s\'éteint de fAlphaFade à chaque pas', () => {
        const g = new GXFlash(fakeRaycaster());
        g.oColor = { r: 0, g: 0, b: 0, a: 0 };
        g.fAlpha = 1;
        g.fAlphaFade = 0.25;
        expect(runUntilOver(g)).toBe(4);
        g.fAlpha = 1;
        g.terminate();
        expect(g.isOver()).toBe(true);
    });
});

describe('GXMessage', () => {
    beforeEach(stubDocument);

    it('se dimensionne d\'après le style par défaut', () => {
        const rc = fakeRaycaster();
        const m = new GXMessage(rc);
        assertDefaults(m, {
            sClass: 'Message', oRaycaster: rc, wSize: 512, hSize: 40, fTimePerChar: 100,
            yOfs: 48, nTextHeight: 13, sFontFamily: 'monospace', sTextAlign: 'left',
            sMessage: '', nState: 0, fAlpha: 1, iPath: 0, oIcon: null,
            xPos: (320 - 512) >> 1, yPos: 0, xTo: (320 - 512) >> 1, yTo: 16,
            xTextPos: 20, yTextPos: 26
        });
        expect(m.oStyle).toEqual({
            background: 'rgb(255, 255, 255)', border: 'rgb(64, 64, 64)',
            shadow: 'rgb(220, 220, 220)', text: 'rgb(0, 0, 0)',
            width: 512, height: 40, font: 'monospace 13', speed: 100, position: 48
        });
        expect(m.oMessageCanvas.width).toBe(512);
        expect(m.oMessageCanvas.height).toBe(40);
        expect(m.aPath.length).toBeGreaterThan(0);
        expect(m.aPath.at(-1)[2]).toBe(1);
    });

    it('setMessage calcule la durée d\'affichage', () => {
        const m = new GXMessage(fakeRaycaster());
        m.setMessage('hello');
        expect(m.sMessage).toBe('hello');
        expect(m.getTime()).toBe(10);
    });

    it('descend, attend, remonte puis se termine', () => {
        const m = new GXMessage(fakeRaycaster());
        m.setMessage('hello');
        m.process();
        expect(m.nState).toBe(1);
        expect(m.oMessageCanvas.getContext('2d').fillText).toHaveBeenCalledWith('hello', 22, 28);
        const n = runUntilOver(m);
        expect(n).toBeLessThan(100);
        expect(m.nState).toBe(4);
        expect(m.oMessageCanvas).toBe(null);
    });

    it('coupe un message trop long sur deux lignes', () => {
        const m = new GXMessage(fakeRaycaster());
        m.setMessage('word '.repeat(30).trim());
        m.process();
        expect(m.oMessageCanvas.getContext('2d').fillText).toHaveBeenCalledTimes(4);
    });

    it('dessine l\'icône et décale le texte', () => {
        const m = new GXMessage(fakeRaycaster());
        const oImg = {};
        m.setIcon(oImg, 1, 2, 3, 4);
        m.setMessage('hi');
        m.process();
        expect(m.oMessageCanvas.getContext('2d').drawImage).toHaveBeenCalledWith(oImg, 1, 2, 3, 4, 4, 4, 32, 32);
        expect(m.xTextPos).toBe(52);
        expect(m.oIcon).toBe(null);
    });

    it('render n\'affiche que si l\'alpha est positif', () => {
        const rc = fakeRaycaster();
        const m = new GXMessage(rc);
        m.fAlpha = 0;
        m.render();
        expect(rc.oCanvas.getContext('2d').drawImage).not.toHaveBeenCalled();
        m.fAlpha = 0.5;
        m.render();
        expect(rc.oCanvas.getContext('2d').drawImage).toHaveBeenCalledOnce();
    });

    it('les instances ne partagent pas leur trajectoire', () => {
        expect(new GXMessage(fakeRaycaster()).aPath).not.toBe(new GXMessage(fakeRaycaster()).aPath);
    });
});
