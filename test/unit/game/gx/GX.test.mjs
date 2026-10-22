// Effets graphiques du jeu dérivés de GXEffect.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GXEffect } from '../../../../src/libraries/Raycaster/GXEffect.js';
import { GXBlind } from '../../../../src/game/gx/GXBlind.js';
import { GXColorVeil } from '../../../../src/game/gx/GXColorVeil.js';
import { GXConfused } from '../../../../src/game/gx/GXConfused.js';
import { GXFlood } from '../../../../src/game/gx/GXFlood.js';
import { GXIconPad } from '../../../../src/game/gx/GXIconPad.js';
import { GXTimeStop } from '../../../../src/game/gx/GXTimeStop.js';
import { GXUnderwater } from '../../../../src/game/gx/GXUnderwater.js';
import { Effect } from '../../../../src/game/GC/Effect.js';
import { EffectProcessor } from '../../../../src/game/EffectProcessor.js';
import { Creature } from '../../../../src/game/GC/Creature.js';
import { ICONS } from '../../../../src/game/data/ICONS.js';
import { assertDefaults } from '../../helpers.mjs';
import { fakeCanvas, fakeRaycaster, stubDocument } from '../../canvas.mjs';

beforeEach(stubDocument);

function common(oGX, rc) {
    expect(oGX).toBeInstanceOf(GXEffect);
    assertDefaults(oGX, { oRaycaster: rc, oCanvas: rc.oCanvas, oContext: rc.oCanvas.getContext('2d') });
}

// effets « jusqu'à terminate » avec un tampon de la taille de l'écran
describe.each([
    ['GXBlind', GXBlind, 'Blind', 'oFlashCanvas', 'oFlashContext'],
    ['GXConfused', GXConfused, 'Confused', 'oConfCanvas', 'oConfContext'],
    ['GXUnderwater', GXUnderwater, 'Underwater', 'oDistCanvas', 'oDistContext']
])('%s', (sName, GX, sClass, sBuffer, sBufferContext) => {
    it('a des valeurs par défaut', () => {
        const rc = fakeRaycaster();
        const g = new GX(rc);
        common(g, rc);
        assertDefaults(g, { sClass, nTime: 0, bOver: false });
        expect(g[sBuffer].width).toBe(320);
        expect(g[sBuffer].height).toBe(200);
        expect(g[sBufferContext]).toBe(g[sBuffer].getContext('2d'));
        expect(g[sBufferContext].fillRect).toHaveBeenCalledWith(0, 0, 320, 200);
    });

    it('avance, se dessine sur l\'écran, et dure jusqu\'à terminate', () => {
        const rc = fakeRaycaster();
        const g = new GX(rc);
        g.process();
        g.process();
        expect(g.nTime).toBe(2);
        g.render();
        expect(rc.oCanvas.getContext('2d').drawImage).toHaveBeenCalled();
        expect(g.isOver()).toBe(false);
        g.terminate();
        expect(g.isOver()).toBe(true);
        g.done();
        expect(g[sBuffer]).toBe(null);
    });
});

describe('GXUnderwater (second tampon)', () => {
    it('a deux tampons et des ondulations', () => {
        const g = new GXUnderwater(fakeRaycaster());
        expect(g.oDistCanvas2.width).toBe(320);
        expect(g.oDistContext2).toBe(g.oDistCanvas2.getContext('2d'));
        expect(g.y).toEqual([0, 0, 0]);
        g.done();
        expect(g.oDistCanvas2).toBe(null);
    });
});

describe('GXColorVeil', () => {
    it('a des valeurs par défaut', () => {
        const rc = fakeRaycaster();
        const g = new GXColorVeil(rc);
        common(g, rc);
        assertDefaults(g, { sClass: 'ColorVeil', nTime: 0, xStyle: null, yFrom: 0, yTo: 0, nEffectMask: 0 });
        expect(g.isOver()).toBe(true);
    });

    it('expose les masques SNARE, ROOT et HOLD', () => {
        expect([GXColorVeil.SNARE, GXColorVeil.ROOT, GXColorVeil.HOLD]).toEqual([1, 2, 4]);
    });

    it('choisit le voile de l\'effet le plus fort', () => {
        const g = new GXColorVeil(fakeRaycaster());
        g.setEffect(1);
        expect(g.isOver()).toBe(false);
        expect([g.yFrom, g.yTo]).toEqual([100, 200]);
        const xSnare = g.xStyle;
        g.setEffect(2);
        expect(g.xStyle).not.toBe(xSnare);
        g.setEffect(4);
        expect(g.xStyle).toBe('rgb(220, 220, 255)');
        expect([g.yFrom, g.yTo]).toEqual([0, 200]);
        g.clearEffect(4);
        expect(g.nEffectMask).toBe(3);
        expect(g.yFrom).toBe(100);
        g.clearEffect(1);
        g.clearEffect(2);
        expect(g.isOver()).toBe(true);
    });

    it('ne peint que si un effet est actif', () => {
        const rc = fakeRaycaster();
        const ctx = rc.oCanvas.getContext('2d');
        const g = new GXColorVeil(rc);
        g.render();
        expect(ctx.fillRect).not.toHaveBeenCalled();
        g.setEffect(4);
        g.process();
        g.render();
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 320, 200);
        expect(ctx.globalAlpha).toBe(1);
    });
});

describe('GXFlood', () => {
    it('a des valeurs par défaut', () => {
        const rc = fakeRaycaster();
        const g = new GXFlood(rc);
        common(g, rc);
        assertDefaults(g, { sClass: 'Flood', nTime: 0, BUBBLES: 40, TIME_AMP: 16 });
        expect(g.aAmp.length).toBe(80);
        expect(g.aPls.length).toBe(80);
        expect(g.aAmp.every(n => n >= 4 && n <= 32)).toBe(true);
    });

    it('monte jusqu\'à recouvrir l\'écran', () => {
        const rc = fakeRaycaster();
        const g = new GXFlood(rc);
        let n = 0;
        while (!g.isOver()) {
            g.process();
            g.render();
            n++;
        }
        expect(n).toBe(Math.ceil((200 + 128) / 16));
        expect(rc.oCanvas.getContext('2d').arc).toHaveBeenCalledTimes(80 * n);
    });

    it('terminate le finit aussitôt', () => {
        const g = new GXFlood(fakeRaycaster());
        g.terminate();
        expect(g.isOver()).toBe(true);
    });

    it('done passe le niveau sous l\'eau', () => {
        const aEffects = [];
        const oWall = fakeCanvas(128, 96);
        const rc = fakeRaycaster({
            oEffects: { addEffect: e => aEffects.push(e) },
            oVisual: { light: 100, fogDistance: 1 },
            oWall: { image: oWall },
            updateWallTextures: vi.fn(),
            buildGradient: vi.fn()
        });
        new GXFlood(rc).done();
        expect(aEffects.map(e => e.sClass)).toEqual(['Flash', 'Underwater']);
        expect(aEffects[0].oColor).toEqual({ r: 0, g: 32, b: 32, a: 1 });
        expect(rc.oVisual).toEqual({ light: 50, fogDistance: 0.75 });
        expect(rc.updateWallTextures).toHaveBeenCalledOnce();
    });
});

describe('GXTimeStop', () => {
    it('a des valeurs par défaut', () => {
        const rc = fakeRaycaster();
        const g = new GXTimeStop(rc);
        common(g, rc);
        assertDefaults(g, { sClass: 'TimeStop', bOver: false, nTime: 0, wBuff: 320, hBuff: 200, nPixelCount: 64000 });
        expect(g.oPixBuff.byteLength).toBe(256000);
        expect(g.oPixBuff8.buffer).toBe(g.oPixBuff);
        expect(g.oPixBuff32.buffer).toBe(g.oPixBuff);
    });

    it('passe l\'image en niveaux de gris', () => {
        const rc = fakeRaycaster();
        rc.oCanvas.width = 2;
        rc.oCanvas.height = 1;
        const ctx = rc.oCanvas.getContext('2d');
        const g = new GXTimeStop(rc);
        ctx.getImageData.mockReturnValueOnce({ data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 128]) });
        g.render();
        expect([...ctx.putImageData.mock.calls[0][0].data]).toEqual([75, 75, 75, 255, 27, 27, 27, 128]);
    });

    it('process compte le temps, terminate le finit', () => {
        const g = new GXTimeStop(fakeRaycaster());
        g.process();
        expect(g.nTime).toBe(1);
        g.terminate();
        expect(g.isOver()).toBe(true);
    });
});

describe('GXIconPad', () => {
    const oImage = {};
    const raycaster = () => fakeRaycaster({ oHorde: { oTiles: { i_icons: { oImage } } } });

    // BOGUE corrigé : confus une seconde fois avant la fin de la première
    // confusion (effet non cumulable : l'ancien est remplacé, le code est le
    // même), l'icône restait affichée pour toujours une fois l'effet fini
    it('l\'icône disparaît quand un effet réappliqué prend fin', () => {
        const ep = new EffectProcessor();
        ep.setTime(100);
        const c = new Creature();
        c.setEffectProcessor(ep);
        const g = new GXIconPad(raycaster());
        g.setCreature(c);
        const visible = () => Object.keys(g.oIcons || {}).filter((s) => g.oIcons[s].visible);
        ep.applyEffect(c, 'macnfBK');
        g.process();
        expect(visible()).toEqual(['acnf']);
        ep.setTime(105);
        ep.applyEffect(c, 'macnfBK');
        c.processEffects();
        g.process();
        expect(visible()).toEqual(['acnf']);
        ep.setTime(115);
        c.processEffects();
        expect(c.oEffects).toEqual([]);
        g.process();
        expect(visible()).toEqual([]);
    });

    function effect(sEffect, nTimeOut = 100) {
        const e = new Effect();
        e.sEffect = sEffect;
        e.nTimeOut = nTimeOut;
        return e;
    }

    it('a des valeurs par défaut', () => {
        const rc = raycaster();
        const g = new GXIconPad(rc);
        common(g, rc);
        assertDefaults(g, {
            sClass: 'IconPad', oIcons: null, oEffects: null, oCreature: null, sSnapShot: 'xxx',
            PAD_HEIGHT: 48, PAD_Y: 8, PAD_X: 8, PAD_ICON_SPACING: 2, PAD_ICON_SIZE: 48
        });
        expect(g.oRenderCanvas.width).toBe(320 - 16);
        expect(g.oRenderCanvas.height).toBe(48);
        expect(g.isOver()).toBe(false);
    });

    it('getIcon refuse une altération inconnue', () => {
        expect(() => new GXIconPad(raycaster()).getIcon('zzzz')).toThrow(/unknown alteration icon: zzzz/);
    });

    it('affiche une icône par altération, et les redessine si elles changent', () => {
        const g = new GXIconPad(raycaster());
        const oCreature = { oEffects: [effect('xabldBA'), effect('xacnfBA')] };
        g.setCreature(oCreature);
        g.process();
        const ctx = g.oRenderCanvas.getContext('2d');
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(ctx.drawImage).toHaveBeenCalledWith(oImage, ICONS.eff_abld * 48, 0, 48, 48, expect.any(Number), 0, 48, 48);
        expect(g.processIcons()).toBe(false);
        oCreature.oEffects[0].expire();
        oCreature.oEffects.push(effect('xadhpBA'));
        g.process();
        expect(ctx.drawImage).toHaveBeenCalledTimes(4);
        expect(g.oIcons.abld.visible).toBe(false);
    });

    it('garde l\'effet qui dure le plus longtemps', () => {
        const g = new GXIconPad(raycaster());
        const e1 = effect('xabldBA', 100), e2 = effect('xabldBA', 300);
        g.setIconEffect(e1);
        expect(g.setIconEffect(e2).effect).toBe(e2);
        expect(g.setIconEffect(e1).effect).toBe(e2);
    });

    it('reset oublie les icônes', () => {
        const g = new GXIconPad(raycaster());
        g.getIcon('abld');
        g.sSnapShot = 'abc';
        g.reset();
        expect(g.oIcons).toBe(null);
        expect(g.sSnapShot).toBe('xxx');
    });

    it('render pose le bandeau en haut à gauche', () => {
        const rc = raycaster();
        const g = new GXIconPad(rc);
        g.render();
        expect(rc.oCanvas.getContext('2d').drawImage).toHaveBeenCalledWith(g.oRenderCanvas, 8, 8);
    });
});
