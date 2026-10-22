import { describe, it, expect, vi } from 'vitest';
import { CasterThinker } from '../../../../src/game/thinkers/CasterThinker.js';
import { MathTools } from '../../../../src/libraries/Raycaster/Tools/MathTools.js';

// lanceur au contact de sa cible, baguette de nSlots sorts, data.casts = aCasts
function caster(nSlots, aCasts) {
    const t = new CasterThinker();
    t.aCastTimes = [0, 100, 250, 500].slice(0, nSlots);
    t.TIME_REACTIVITY = 1;
    t.oMobile = {
        x: 10, y: 20,
        getData: (s) => s === 'casts' ? aCasts : null,
        oSprite: { playAnimationType: vi.fn() },
        move: vi.fn()
    };
    t.oGame = {
        nTimeMs: 1000,
        oMagicSystem: { spellTeleport: vi.fn(() => true) },
        gc_attack: vi.fn(),
        sys_playSound: vi.fn()
    };
    t.chaseTarget = vi.fn();
    t.getTarget = vi.fn();
    return t;
}

const TELEPORT = { spell: 'Teleport', chance: 25, cooldown: 8000, time: 400 };

describe('CasterThinker', () => {
    it('attaque bien : les chances d\'attaque sont définies', () => {
        const t = new CasterThinker();
        expect(t.nProbAttackDodge).toBe(33);
        expect(t.nProbAttackStraf).toBe(40);
    });

    it('lance au contact (le tirage d\'attaque n\'est plus toujours raté)', () => {
        const t = caster(1, null);
        t.move = vi.fn(() => null);
        t.distanceToTarget = () => 50;
        vi.spyOn(MathTools, 'rnd').mockReturnValue(0);
        t._follow(0);
        expect(t.think).toBe(t.thinkAttack);
    });

    it('baguette à un sort : un emplacement absent se rabat sur l\'attaque', () => {
        const t = caster(1, null);
        vi.spyOn(MathTools, 'rnd').mockReturnValue(9);
        t.castSpell();
        expect(t.think).toBe(t.thinkAttack);
    });

    it('baguette à quatre sorts : le tirage choisit l\'emplacement', () => {
        const t = caster(4, null);
        const rnd = vi.spyOn(MathTools, 'rnd');
        [[0, 0], [4, 1], [7, 2], [9, 3]].forEach(([n, iSlot]) => {
            rnd.mockReturnValue(n);
            t.think = null;
            t.castSpell();
            if (iSlot === 0) {
                expect(t.think).toBe(t.thinkAttack);
            } else {
                expect(t.think).toBe(t.thinkCast);
                expect(t.nCastAttack).toBe(iSlot);
            }
        });
    });

    it('sort de magie : incantation, puis le sort, son son, et la poursuite', () => {
        const t = caster(1, [TELEPORT]);
        vi.spyOn(MathTools, 'rnd').mockReturnValue(0);
        t.castSpell();
        expect(t.think).toBe(t.thinkCast);
        expect(t.nCastingTime).toBe(401);
        expect(t.nNewActionTime).toBe(1401);
        t._cast(0);
        expect(t.chaseTarget).toHaveBeenCalled();
        expect(t.oGame.oMagicSystem.spellTeleport).toHaveBeenCalledWith(t.oMobile);
        expect(t.oGame.sys_playSound).toHaveBeenCalledWith(expect.anything(), 10, 20);
        expect(t.oGame.gc_attack).not.toHaveBeenCalled();
        expect(t.think).toBe(t.thinkFollow);
        expect(t.sMagicCast).toBe(null);
    });

    it('sort de magie raté au tirage : la baguette prend le relais', () => {
        const t = caster(1, [TELEPORT]);
        vi.spyOn(MathTools, 'rnd').mockReturnValue(25);
        t.castSpell();
        expect(t.think).toBe(t.thinkAttack);
        expect(t.sMagicCast).toBe(null);
    });

    it('sort de magie en recharge : pas de second lancer avant 8 s', () => {
        const t = caster(1, [TELEPORT]);
        vi.spyOn(MathTools, 'rnd').mockReturnValue(0);
        t.castSpell();
        t._cast(0);
        t.oGame.nTimeMs += 7999;
        t.castSpell();
        expect(t.think).toBe(t.thinkAttack);
        t.oGame.nTimeMs += 1;
        t.castSpell();
        expect(t.think).toBe(t.thinkCast);
    });

    it('recharge par défaut : celle du sort, ou un nom de MAGIC_DATA_PARAMS', () => {
        const t = new CasterThinker();
        expect(t.getMagicCooldown({ spell: 'Teleport' })).toBe(5000);
        expect(t.getMagicCooldown({ spell: 'Teleport', cooldown: 'MEDIUM' })).toBe(30000);
    });

    it('une incantation magique interrompue ne pollue pas le sort suivant', () => {
        const t = caster(4, [TELEPORT]);
        const rnd = vi.spyOn(MathTools, 'rnd').mockReturnValue(0);
        t.castSpell();
        // confuse pendant l'incantation : thinkCast passe en errance sans _cast
        t.oGame.nTimeMs += 10000;
        rnd.mockReturnValueOnce(99).mockReturnValueOnce(4);
        t.castSpell();
        t._cast(0);
        expect(t.oGame.oMagicSystem.spellTeleport).not.toHaveBeenCalled();
        expect(t.oGame.gc_attack).toHaveBeenCalledWith(t.oMobile, 101);
    });
});
