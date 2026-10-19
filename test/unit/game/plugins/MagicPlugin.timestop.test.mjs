// Arrêt du temps (sort TimeStop) : pendant 9 secondes, seul le lanceur agit ;
// les animations des sprites et des murs se figent, le temps du jeu aussi.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas, stubDocument } from '../../canvas.mjs';

stubDocument();

const { MagicPlugin } = await import('../../../../src-recovered/game/plugins/MagicPlugin.js');
const { Animation } = await import('../../../../src-recovered/libraries/Raycaster/Animation.js');
const { Raycaster } = await import('../../../../src-recovered/libraries/Raycaster/Raycaster.js');
const { Horde } = await import('../../../../src-recovered/libraries/Raycaster/Horde.js');
const { MobileRegister } = await import('../../../../src-recovered/libraries/Raycaster/MobileRegister.js');

beforeEach(stubDocument);

// raycaster de jeu réduit à ce que touche l'arrêt du temps : une horde, un
// mur animé (codes tournants), les effets plein écran
function game() {
    const rc = Object.create(Raycaster.prototype);
    Object.assign(rc, {
        TIME_FACTOR: 40,
        nPlaneSpacing: 64,
        oCanvas: fakeCanvas(),
        oImages: { load: () => ({}) },
        oMobileSectors: new MobileRegister(4),
        oEffects: { addEffect: vi.fn() },
        bRendererReady: false,
        oWall: { codes: [null, [1, 2, 3, 4, 5, 6]], animated: { 1: {} } }
    });
    rc.oHorde = new Horde(rc);
    rc.oHorde.oMobileDispenser.registerBlueprint('b');
    const mobile = (sId) => {
        const m = {
            sId, bActive: true, think: vi.fn(),
            oSprite: { oBlueprint: { sId: 'b' } },
            getData: () => ({ oExtraData: { retrigger: 500 } })
        };
        rc.oHorde.linkMobile(m);
        return m;
    };
    const oPlayer = mobile('player');
    const oMonster = mobile('monster');
    const p = new MagicPlugin();
    p.oGame = { oRaycaster: rc, nTime: 100, nTimeMs: 4000, sys_flash: vi.fn() };
    return { p, rc, oPlayer, oMonster };
}

function walking() {
    const a = new Animation();
    a.assign({ nStart: 10, nCount: 4, nDuration: 10, nLoop: 1, nIndex: 0, nTime: 0 });
    return a;
}

describe('MagicPlugin : arrêt du temps', () => {
    it('seul le lanceur agit, les animations et les murs sont figés', () => {
        const { p, rc, oPlayer, oMonster } = game();
        expect(p.spellTimeStop(oPlayer)).toBe(true);
        expect(rc.oEffects.addEffect).toHaveBeenCalledWith(p.oTimeStopGX);
        rc.oHorde.think();
        expect(oPlayer.think).toHaveBeenCalledTimes(1);
        expect(oMonster.think).not.toHaveBeenCalled();
        const a = walking();
        expect([a.animate(25), a.animate(25)]).toEqual([10, 10]);
        rc.textureAnimation();
        expect(rc.oWall.codes[1]).toEqual([1, 2, 3, 4, 5, 6]);
        p.spellTimeRestart();
    });

    it('un second arrêt du temps pendant le premier échoue', () => {
        const { p, oPlayer } = game();
        p.spellTimeStop(oPlayer);
        expect(p.spellTimeStop(oPlayer)).toBe(false);
        p.spellTimeRestart();
    });

    it('le lanceur rendu inactif quitte la horde', () => {
        const { p, rc, oPlayer } = game();
        p.spellTimeStop(oPlayer);
        oPlayer.bActive = false;
        rc.oHorde.think();
        expect(rc.oHorde.aMobiles.map((m) => m.sId)).toEqual(['monster']);
        p.spellTimeRestart();
    });

    it('le temps repart : tout le monde agit, tout s\'anime, l\'horloge reprend où elle était', () => {
        const { p, rc, oPlayer, oMonster } = game();
        p.spellTimeStop(oPlayer);
        const gx = p.oTimeStopGX;
        gx.terminate = vi.fn();
        p.oGame.nTime = 300;
        p.spellTimeRestart();
        expect([p.oGame.nTime, p.oGame.nTimeMs]).toEqual([100, 4000]);
        expect(gx.terminate).toHaveBeenCalled();
        expect(p.oGame.sys_flash).toHaveBeenCalledWith(0xFFFFFF, 50, 5);
        expect([p.nTimeStop, p.oTimeStopMobile, p.oTimeStopGX]).toEqual([0, null, null]);
        rc.oHorde.think();
        expect(oPlayer.think).toHaveBeenCalledTimes(1);
        expect(oMonster.think).toHaveBeenCalledTimes(1);
        const a = walking();
        expect([a.animate(25), a.animate(25)]).toEqual([12, 10]);
        rc.textureAnimation();
        expect(rc.oWall.codes[1]).toEqual([3, 4, 5, 6, 1, 2]);
        expect(p.spellTimeRestart()).toBe(false);
    });

    it('9 secondes de jeu, puis le temps repart seul', () => {
        const { p, oPlayer } = game();
        p.bDisplayInvalid = false;
        p.spellTimeStop(oPlayer);
        for (let i = 0; i < 8; i++) {
            p.timesecond();
        }
        expect(p.oTimeStopMobile).toBe(oPlayer);
        p.timesecond();
        expect(p.oTimeStopMobile).toBe(null);
    });

    it('quitter l\'étage fait repartir le temps', () => {
        const { p, oPlayer } = game();
        p.spellTimeStop(oPlayer);
        p.exitlevel();
        expect(p.oTimeStopMobile).toBe(null);
        expect(walking().animate(25)).toBe(12);
    });

    it('aucune classe n\'est modifiée : ni Animation, ni Raycaster, ni Horde', () => {
        const { p, rc, oPlayer } = game();
        const snapshot = () => [Animation, Raycaster, Horde].map((C) =>
            Object.getOwnPropertyNames(C.prototype).map((k) => k + ':' + (typeof C.prototype[k] === 'function' ? C.prototype[k].name : C.prototype[k])).join(','));
        const aBefore = snapshot();
        const pThink = rc.oHorde.think;
        p.spellTimeStop(oPlayer);
        expect(snapshot()).toEqual(aBefore);
        expect(rc.oHorde.think).toBe(pThink);
        p.spellTimeRestart();
        expect(snapshot()).toEqual(aBefore);
        expect(Object.keys(rc.oHorde).filter((k) => k.startsWith('__'))).toEqual([]);
    });
});
