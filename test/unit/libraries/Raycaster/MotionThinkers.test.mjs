// Thinkers de déplacement scripté (cinématiques) et de projectile.
import { describe, it, expect, vi } from 'vitest';
import { LinearThinker } from '../../../../src/libraries/Raycaster/LinearThinker.js';
import { NonLinearThinker } from '../../../../src/libraries/Raycaster/NonLinearThinker.js';
import { MissileThinker } from '../../../../src/libraries/Raycaster/MissileThinker.js';
import { MouseKeyboardThinker } from '../../../../src/libraries/Raycaster/MouseKeyboardThinker.js';
import { RC } from '../../../../src/libraries/Raycaster/RC.js';

function mobile() {
    return {
        x: 10, y: 20, fTheta: 0.5,
        setXY: vi.fn(function (x, y) { this.x = x; this.y = y; }),
        setAngle: vi.fn(function (a) { this.fTheta = a; }),
        slide: vi.fn(function (dx, dy) { this.x += dx; this.y += dy; })
    };
}

describe('LinearThinker', () => {
    it('part du mobile si on ne donne pas de départ', () => {
        const t = new LinearThinker();
        t.oMobile = mobile();
        t.setMove(null, undefined, null, 2, 3, 4);
        expect([t.xStart, t.yStart, t.aStart, t.xDelta, t.yDelta, t.nTime]).toEqual([10, 20, 0.5, 2, 3, 4]);
    });

    it('glisse de (dx, dy) pendant nTime + 1 pas puis s\'arrête', () => {
        const t = new LinearThinker();
        const m = t.oMobile = mobile();
        t.setMove(0, 0, 1, 2, 3, 2);
        t.think();
        t.think();
        expect(m.setXY).toHaveBeenCalledWith(0, 0);
        expect(m.setAngle).toHaveBeenCalledWith(1);
        for (let i = 0; i < 10; i++) {
            t.think();
        }
        expect(m.slide).toHaveBeenCalledTimes(3);
        expect([m.x, m.y]).toEqual([6, 9]);
        expect(t.think).toBe(t.thinkStop);
    });
});

describe('NonLinearThinker', () => {
    it('va du départ à l\'arrivée selon la fonction choisie', () => {
        const t = new NonLinearThinker();
        const m = t.oMobile = mobile();
        t.sFunction = 'linear';
        t.setMove(0, 0, 0, 100, 50, 4);
        t.think();
        t.think();
        const aPos = [];
        while (t.think !== t.thinkStop) {
            t.think();
            aPos.push([m.x, m.y]);
        }
        expect(aPos).toEqual([[0, 0], [25, 12.5], [50, 25], [75, 37.5], [100, 50]]);
    });

    it('utilise smoothstepX2 par défaut', () => {
        const t = new NonLinearThinker();
        const m = t.oMobile = mobile();
        t.setMove(0, 0, 0, 100, 0, 4);
        t.think();
        t.think();
        t.think();
        t.think();
        expect(m.x).toBeCloseTo(100 * t.smoothstepX2(0.25));
    });

    it('les fonctions d\'interpolation vont de 0 à 1', () => {
        const t = new NonLinearThinker();
        t.nTime = 1;
        for (const f of ['linear', 'smoothstep', 'smoothstepX2', 'smoothstepX3', 'squareAccel',
            'squareDeccel', 'cubeAccel', 'cubeDeccel', 'cosine']) {
            expect(t[f](0), f).toBeCloseTo(0);
            expect(t[f](1), f).toBeCloseTo(1);
        }
        expect(t.sine(1)).toBeCloseTo(1);
        expect(t.weightAverage(0)).toBe(1);
    });
});

describe('MouseKeyboardThinker', () => {
    class Player extends MouseKeyboardThinker {
        constructor() {
            super();
            this.aLog = [];
        }

        forwardDown() { this.aLog.push('forwardDown'); }
        forwardUp() { this.aLog.push('forwardUp'); }
        forwardCommand() { this.aLog.push('forwardCommand'); }
        button0Down() { this.aLog.push('button0Down'); }
        wheelUp() { this.aLog.push('wheelUp'); }
    }

    function player() {
        const p = new Player();
        p.oKeyboard = { aKeys: [] };
        p.aMouse = [];
        p.oMouse = { inputMouse: () => p.aMouse.shift() };
        p.defineKeys({ forward: 38, use: 32 });
        return p;
    }

    it('defineKeys prépare touches et commandes', () => {
        const p = player();
        expect(p.aKeys).toEqual({ forward: [38, 0], use: [32, 0] });
        expect(p.aCommands).toEqual({ 38: false, 32: false });
    });

    it('appelle <touche>Down, <touche>Command tant qu\'elle est enfoncée, puis <touche>Up', () => {
        const p = player();
        p.oKeyboard.aKeys[38] = 1;
        p.updateKeys();
        p.updateKeys();
        expect(p.getCommandStatus('forward')).toBe(true);
        p.oKeyboard.aKeys[38] = 2;
        p.updateKeys();
        expect(p.getCommandStatus('forward')).toBe(false);
        expect(p.aLog).toEqual(['forwardDown', 'forwardCommand', 'forwardCommand', 'forwardUp']);
    });

    it('relaie les clics et la molette', () => {
        const p = player();
        p.aMouse.push([1, 0, 0, 0], [3, 0, 0, 3]);
        p.updateKeys();
        expect(p.aLog).toEqual(['button0Down', 'wheelUp']);
        expect(p.getCommandStatus('button0')).toBe(true);
    });
});

describe('MissileThinker', () => {
    function missile() {
        const t = new MissileThinker();
        const oSprite = { playAnimationType: vi.fn(), oAnimation: { nDuration: 50, nCount: 4 } };
        t.oGame = { nTime: 0, TIME_FACTOR: 50 };
        t.oMobile = {
            oSprite,
            bActive: true,
            bWallCollision: false,
            oMobileCollision: null,
            nMoves: 0,
            moveForward: vi.fn(function () { this.nMoves++; }),
            rollbackXY: vi.fn(),
            gotoLimbo: vi.fn()
        };
        return t;
    }

    it('est inactif tant qu\'il n\'est pas tiré', () => {
        const t = missile();
        t.think();
        expect(t.oMobile.bActive).toBe(false);
    });

    it('avance de nStepSpeed pas, explose sur un mur, puis disparaît', () => {
        const t = missile();
        const oOwner = {};
        t.nLifeOut = 100;
        t.fire(oOwner);
        expect(t.oOwner).toBe(oOwner);
        expect(t.oMobile.oSprite.playAnimationType).toHaveBeenCalledWith(1);
        t.think();
        expect(t.oMobile.nMoves).toBe(5);
        t.oMobile.bWallCollision = true;
        t.think();
        expect(t.think).toBe(t.thinkHit);
        expect(t.nExplosionMaxTime).toBe(200);
        expect(t.oMobile.bEthereal).toBe(true);
        for (let i = 0; i < 4; i++) {
            t.think();
        }
        expect(t.oMobile.gotoLimbo).toHaveBeenCalledOnce();
        expect(t.think).toBe(t.thinkIdle);
    });

    it('traverse son lanceur à la sortie, pas après', () => {
        const t = missile();
        const oOwner = { getType: () => RC.OBJECT_TYPE_MOB };
        t.fire(oOwner);
        t.oMobile.oMobileCollision = oOwner;
        expect(t.isCollisioned()).toBe(false);
        t.oMobile.oMobileCollision = null;
        expect(t.isCollisioned()).toBe(false);
        expect(t.bExiting).toBe(false);
        t.oMobile.oMobileCollision = oOwner;
        expect(t.isCollisioned()).toBe(true);
    });

    it('ignore les autres projectiles et les objets', () => {
        const t = missile();
        t.fire({});
        t.bExiting = false;
        t.oMobile.oMobileCollision = { getType: () => RC.OBJECT_TYPE_MISSILE };
        expect(t.isCollisioned()).toBe(false);
        t.oMobile.oMobileCollision = { getType: () => RC.OBJECT_TYPE_MOB };
        expect(t.isCollisioned()).toBe(true);
    });

    it('s\'éteint en fin de vie', () => {
        const t = missile();
        t.fire({});
        t.oGame.nTime = 5;
        t.think();
        expect(t.oMobile.gotoLimbo).toHaveBeenCalledOnce();
        expect(t.oMobile.oSprite.playAnimationType).toHaveBeenLastCalledWith(-1);
        expect(t.think).toBe(t.thinkIdle);
    });
});
