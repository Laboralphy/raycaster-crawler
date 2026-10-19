import { describe, it, expect, vi } from 'vitest';
import { MobThinker } from '../../../../src-recovered/game/thinkers/MobThinker.js';
import { Creature } from '../../../../src-recovered/game/GC/Creature.js';

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
