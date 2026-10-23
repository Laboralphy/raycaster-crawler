import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChargerThinker } from '../../../../src/game/thinkers/ChargerThinker.js';
import { MobThinker } from '../../../../src/game/thinkers/MobThinker.js';
import { SOUNDS } from '../../../../src/game/data/SOUNDS.js';

afterEach(() => vi.restoreAllMocks());

// chevalier en (0, 0), joueur à d pixels à l'est, visible
function scene(d = 256) {
    const oPlayer = {
        x: d, y: 0,
        oThinker: { oPulse: { x: 0, y: 0 } },
        getData: () => ({ getAttribute: () => 0 })
    };
    const t = new ChargerThinker();
    t.oGame = {
        nTime: 0, nTimeMs: 10000, TIME_FACTOR: 40,
        getPlayer: () => oPlayer,
        gc_attack: vi.fn(),
        sys_playSound: vi.fn()
    };
    t.oCreature = { getAttribute: () => 0 };
    t.oMobile = {
        x: 0, y: 0, fTheta: 2, oMobileCollision: null,
        oSprite: { playAnimationType: vi.fn() }
    };
    t.TIME_REACTIVITY = 10;
    t.oTarget = oPlayer;
    t.processEffects = vi.fn();
    t.searchForTarget = vi.fn(() => true);
    return { t, oPlayer };
}

describe('MobThinker.move', () => {
    it('la vitesse de marche est multipliée par fSpeedFactor', () => {
        const t = new MobThinker();
        t.oGame = { TIME_FACTOR: 40, oDungeon: { getCreatureMoveSpeed: () => 100 } };
        t.oMobile = { moveForward: vi.fn(), oMobileCollision: null, oWallCollision: { x: 0, y: 0 } };
        t.move();
        expect(t.oMobile.fSpeed).toBeCloseTo(4);
        t.fSpeedFactor = 3;
        t.move();
        expect(t.oMobile.fSpeed).toBeCloseTo(12);
    });
});

describe('ChargerThinker.canRush', () => {
    it('joueur visible, à bonne distance, tirage favorable : il charge', () => {
        const { t } = scene();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(t.canRush()).toBe(true);
    });

    it('tirage défavorable : non', () => {
        const { t } = scene();
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(t.canRush()).toBe(false);
    });

    it('trop près ou trop loin : non', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(scene(ChargerThinker.RUSH_MIN_DISTANCE - 1).t.canRush()).toBe(false);
        expect(scene(ChargerThinker.RUSH_MAX_DISTANCE + 1).t.canRush()).toBe(false);
    });

    it('joueur hors de vue, monstre confus, ou charge trop récente : non', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const a = scene().t;
        a.searchForTarget = () => false;
        expect(a.canRush()).toBe(false);
        const b = scene().t;
        b.bConfused = true;
        expect(b.canRush()).toBe(false);
        const c = scene().t;
        c.nNextRushTime = c.oGame.nTimeMs + 1;
        expect(c.canRush()).toBe(false);
        // joueur invisible (sans vision magique pour le monstre)
        const e = scene();
        e.oPlayer.getData = () => ({ getAttribute: (s) => (s === 'invisible' ? 1 : 0) });
        expect(e.t.canRush()).toBe(false);
    });
});

describe('ChargerThinker : la charge', () => {
    it('_follow lance la charge vers le joueur', () => {
        const { t } = scene();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        t.move = vi.fn();
        t._follow(0);
        expect(t.think).toBe(t.thinkRush);
        expect(t.fSpeedFactor).toBe(ChargerThinker.RUSH_SPEED_FACTOR);
        expect(t.oMobile.fTheta).toBeCloseTo(0);
        expect(t.move).not.toHaveBeenCalled();
        expect(t.oGame.sys_playSound).toHaveBeenCalledWith(SOUNDS.BOSS_RUSH, 0, 0);
        expect(SOUNDS.BOSS_RUSH).toBe('atk_rush_rumble');
    });

    it('_follow, hors des instants de réaction ou sans charge possible : poursuite normale', () => {
        const { t } = scene();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        t.move = vi.fn(() => t.COLLISION_NONE);
        t._follow(1);
        expect(t.think).not.toBe(t.thinkRush);
        expect(t.move).toHaveBeenCalled();
    });

    it('fonce tout droit, sans viser à nouveau le joueur qui s\'écarte', () => {
        const { t, oPlayer } = scene();
        t.startRush();
        oPlayer.y = 100;
        t.move = vi.fn(() => t.COLLISION_NONE);
        t.thinkRush();
        expect(t.move).toHaveBeenCalled();
        expect(t.oMobile.fTheta).toBeCloseTo(0);
        expect(t.think).toBe(t.thinkRush);
    });

    it('percute le joueur : le frappe, le repousse, puis attaque', () => {
        const { t, oPlayer } = scene();
        t.startRush();
        t.move = vi.fn(() => t.COLLISION_TARGET);
        t.thinkRush();
        expect(t.oGame.gc_attack).toHaveBeenCalledWith(t.oMobile, 0);
        expect(oPlayer.oThinker.oPulse.x).toBe(ChargerThinker.RUSH_KNOCKBACK);
        expect(oPlayer.oThinker.oPulse.y).toBeCloseTo(0);
        expect(t.think).toBe(t.thinkAttack);
        expect(t.fSpeedFactor).toBe(1);
        expect(t.nNextRushTime).toBe(t.oGame.nTimeMs + ChargerThinker.RUSH_COOLDOWN);
    });

    it('heurte un mur ou un autre monstre : la charge s\'arrête', () => {
        for (const sCollision of ['COLLISION_WALL_X', 'COLLISION_WALL_Y', 'COLLISION_MOBILE']) {
            const { t } = scene();
            t.startRush();
            t.move = vi.fn(() => t[sCollision]);
            t.thinkRush();
            expect(t.think).toBe(t.thinkFollow);
            expect(t.fSpeedFactor).toBe(1);
            expect(t.oGame.gc_attack).not.toHaveBeenCalled();
        }
    });

    it('s\'arrête au bout de RUSH_DURATION', () => {
        const { t } = scene();
        t.startRush();
        t.move = vi.fn(() => t.COLLISION_NONE);
        t.oGame.nTimeMs += ChargerThinker.RUSH_DURATION + 1;
        t.thinkRush();
        expect(t.think).toBe(t.thinkFollow);
        expect(t.fSpeedFactor).toBe(1);
    });

    it('tué ou paralysé pendant la charge : il ne bouge plus et reprend sa vitesse', () => {
        const { t } = scene();
        t.startRush();
        t.processEffects = vi.fn(() => { t.think = t.thinkDie });
        t.move = vi.fn();
        t.thinkRush();
        expect(t.move).not.toHaveBeenCalled();
        expect(t.think).toBe(t.thinkDie);
        expect(t.fSpeedFactor).toBe(1);
    });
});
