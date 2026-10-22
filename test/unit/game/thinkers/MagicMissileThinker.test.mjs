import { describe, it, expect, vi } from 'vitest';
import { MagicMissileThinker } from '../../../../src-recovered/game/thinkers/MagicMissileThinker.js';

// carte de 64 : murs en x < 64, x >= 192, y < 64, y >= 192 (une pièce de 2 × 2 cases)
const ps = 64;
const oRaycaster = {
    nPlaneSpacing: ps,
    clip: (x, y) => (x < 64 || x >= 192 || y < 64 || y >= 192 ? 1 : 0)
};

// projectile collé à un mur par slide() : sans glissement, xSpeed et ySpeed
// valent 0, et oWallCollision ne dit pas toujours de quel côté est le mur
function bouncing(x, y, fTheta) {
    const t = new MagicMissileThinker();
    t.oMobile = {
        x, y, fTheta, nSize: 8, xSpeed: 0, ySpeed: 0, oRaycaster,
        oWallCollision: { x: 0, y: 0 },
        moveForward: vi.fn()
    };
    return t;
}

const angle = (f) => Math.atan2(Math.sin(f), Math.cos(f));

describe('MagicMissileThinker.bump', () => {
    it('mur à l\'est : le sens en x s\'inverse', () => {
        const t = bouncing(192 - 1 - 8, 128, Math.PI / 4);
        t.bump();
        expect(angle(t.oMobile.fTheta)).toBeCloseTo(3 * Math.PI / 4);
        expect(t.oMobile.moveForward).toHaveBeenCalled();
    });

    it('mur à l\'ouest : le sens en x s\'inverse', () => {
        const t = bouncing(64 + 8, 128, 3 * Math.PI / 4);
        t.bump();
        expect(angle(t.oMobile.fTheta)).toBeCloseTo(Math.PI / 4);
    });

    it('mur au nord, puis au sud : le sens en y s\'inverse', () => {
        const t = bouncing(128, 64 + 8, -Math.PI / 3);
        t.bump();
        expect(angle(t.oMobile.fTheta)).toBeCloseTo(Math.PI / 3);
        const u = bouncing(128, 192 - 1 - 8, 2 * Math.PI / 3);
        u.bump();
        expect(angle(u.oMobile.fTheta)).toBeCloseTo(-2 * Math.PI / 3);
    });

    it('dans un coin : demi-tour', () => {
        const t = bouncing(192 - 1 - 8, 192 - 1 - 8, Math.PI / 4);
        t.bump();
        expect(angle(t.oMobile.fTheta)).toBeCloseTo(-3 * Math.PI / 4);
    });

    it('de face, dans l\'axe : demi-tour', () => {
        const t = bouncing(192 - 1 - 8, 128, 0);
        t.bump();
        expect(Math.abs(angle(t.oMobile.fTheta))).toBeCloseTo(Math.PI);
    });

    it('aucun mur à côté (arête d\'un coin) : demi-tour', () => {
        const t = bouncing(128, 128, Math.PI / 4);
        t.bump();
        expect(angle(t.oMobile.fTheta)).toBeCloseTo(-3 * Math.PI / 4);
    });
});

describe('MagicMissileThinker.extinct', () => {
    function flying(sOptions) {
        const t = new MagicMissileThinker();
        t.oGame = { TIME_FACTOR: 40, oRaycaster: { nPlaneSpacing: 64 }, gc_selectMobilesInCircle: () => [] };
        t.setOptions(sOptions);
        t.explode = vi.fn();
        t.oMobile = { oMobileCollision: null, gotoLimbo: vi.fn(), oSprite: { playAnimationType: vi.fn() } };
        return t;
    }

    it('au bout de sa portée, un projectile qui rebondit explose', () => {
        const t = flying('b');
        t.extinct();
        expect(t.explode).toHaveBeenCalled();
        expect(t.oMobile.gotoLimbo).not.toHaveBeenCalled();
    });

    it('les autres disparaissent, comme avant', () => {
        const t = flying('');
        t.extinct();
        expect(t.explode).not.toHaveBeenCalled();
        expect(t.oMobile.gotoLimbo).toHaveBeenCalled();
    });
});
