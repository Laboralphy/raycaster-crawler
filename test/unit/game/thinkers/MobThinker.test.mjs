import { describe, it, expect, vi } from 'vitest';
import { MobThinker } from '../../../../src/game/thinkers/MobThinker.js';
import { Creature } from '../../../../src/game/GC/Creature.js';
import { SOUNDS } from '../../../../src/game/data/SOUNDS.js';

// monstre réduit à ce que lit processEffects
function mob(oAttr) {
    const t = new MobThinker();
    t.oCreature = new Creature();
    Object.entries(oAttr).forEach(([s, n]) => t.oCreature.setBaseAttribute(s, n));
    t.oMobile = { oSprite: { playAnimationType: vi.fn() } };
    t.oGame = { bNewSecond: false };
    t.bHeld = t.oCreature.getAttribute('held') > 0;
    return t;
}

describe('MobThinker.processEffects', () => {
    it('vivant et paralysé : il attend, figé', () => {
        const t = mob({ held: 1 });
        t.processEffects();
        expect(t.think).toBe(t.thinkHeld);
    });

    // BOGUE corrigé : la paralysie écrasait la mort, le monstre tué restait
    // figé (halo blanc) jusqu'à la fin de l'effet (60 s pour le rayon prismatique)
    it('tué pendant qu\'il est paralysé : il meurt tout de suite', () => {
        const t = mob({ held: 1, dead: 1 });
        t.processEffects();
        expect(t.think).toBe(t.thinkDie);
        const u = mob({ held: 1 });
        u.processEffects();
        u.oCreature.setBaseAttribute('dead', 1);
        u.think();
        expect(u.think).toBe(u.thinkDie);
    });

    it('tué : il meurt', () => {
        const t = mob({ dead: 1 });
        t.processEffects();
        expect(t.think).toBe(t.thinkDie);
    });
});

describe('MobThinker.getDeathSound', () => {
    function dying(sDeath) {
        const t = new MobThinker();
        t.oMobile = { oSprite: { oBlueprint: { getData: (s) => (s === 'death' ? sDeath : null) } } };
        return t;
    }

    it('un des cris de son espèce', () => {
        const t = dying('zombie');
        for (let i = 0; i < 20; i++) {
            expect(SOUNDS.DEATH.zombie).toContain(t.getDeathSound());
        }
    });

    it('le tirage choisit la variante', () => {
        const t = dying('zombie');
        const aZombie = SOUNDS.DEATH.zombie;
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(t.getDeathSound()).toBe(aZombie[aZombie.length - 1]);
        Math.random.mockReturnValue(0);
        expect(t.getDeathSound()).toBe(aZombie[0]);
        vi.restoreAllMocks();
    });

    it('sans espèce connue : pas de cri', () => {
        expect(dying(null).getDeathSound()).toBe(null);
        expect(dying('dragon').getDeathSound()).toBe(null);
    });
});

describe('MobThinker.thinkDie : sons', () => {
    function die(sDeath) {
        const t = new MobThinker();
        t.oMobile = {
            x: 10,
            y: 20,
            oSprite: {
                oBlueprint: { sId: 'm_test', getData: (s) => (s === 'death' ? sDeath : null) },
                oAnimation: { nDuration: 1, nCount: 1 },
                playAnimationType: () => {}
            }
        };
        t.oGame = { sys_playSound: vi.fn(), gc_dropLoot: () => {} };
        t.pulse = () => {};
        t.stripEffects = () => {};
        t.thinkDie();
        return t.oGame.sys_playSound.mock.calls;
    }

    it('le son commun, puis le cri de l\'espèce', () => {
        const aCalls = die('zombie');
        expect(aCalls.length).toBe(2);
        expect(aCalls[0]).toEqual([SOUNDS.FOE_SLAIN, 10, 20]);
        expect(SOUNDS.DEATH.zombie).toContain(aCalls[1][0]);
    });

    it('sans espèce : le son commun seul', () => {
        expect(die(null)).toEqual([[SOUNDS.FOE_SLAIN, 10, 20]]);
    });
});
