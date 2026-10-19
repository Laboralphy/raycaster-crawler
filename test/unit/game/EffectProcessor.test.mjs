import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EffectProcessor } from '../../../src-recovered/game/EffectProcessor.js';
import { Creature } from '../../../src-recovered/game/GC/Creature.js';
import { assertDefaults, assertNotShared } from '../helpers.mjs';

beforeEach(() => {
    // jets de dés fixes (MathTools.rollDice)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

function creature(ep, oAttr) {
    const c = new Creature();
    c.setEffectProcessor(ep);
    const oBase = Object.assign({ vitality: 100, hp: 40, energy: 50, mp: 20, foodmax: 1000, foodp: 500 }, oAttr);
    for (const s in oBase) {
        c.setBaseAttribute(s, oBase[s]);
    }
    return c;
}

// état d'une créature : attributs non nuls et effets en cours
function state(c) {
    const o = {};
    Object.keys(c.getAttributes()).sort().forEach((s) => {
        if (c.getAttribute(s)) {
            o[s] = c.getAttribute(s);
        }
    });
    return { attributes: o, effects: c.oEffects.map((e) => e.sEffect + ' ' + e.nTimeOut + (e.bExpirable ? '' : ' permanent')) };
}

// tous les sous-types gérés (applyEffect_, runEffect_, expireEffect_ ou faute de frappe exprireEffect_)
function subtypes() {
    const a = new Set();
    let p = EffectProcessor.prototype;
    while (p && p !== Object.prototype) {
        Object.getOwnPropertyNames(p).forEach((s) => {
            const m = s.match(/^(?:apply|run|expire|exprire)Effect_([a-z]{4})$/);
            if (m) {
                a.add(m[1]);
            }
        });
        p = Object.getPrototypeOf(p);
    }
    return [...a].sort();
}

describe('game EffectProcessor', () => {
    it('constantes', () => {
        assertDefaults(new EffectProcessor(), {
            nTime: 0,
            BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            DAMAGE_FACTOR_PHYSICAL: 6,
            DAMAGE_FACTOR_MAGICAL: 6,
            DAMAGE_FACTOR_COLD: 6,
            DAMAGE_FACTOR_FIRE: 6,
            DAMAGE_FACTOR_ELECTRICITY: 6,
            DAMAGE_FACTOR_TOXIC: 6,
            HEAL_FACTOR: 6,
            ENERGY_FACTOR: 10,
            VITALITY_FACTOR: 10,
            FOOD_FACTOR: 100,
            MAX_LEVEL: 63,
            EFFECT_NULL: 'snullAA',
            EFFECT_TYPE_POTION: 'b',
            EFFECT_TYPE_CHARM: 'h',
            EFFECT_TYPE_MISSILE: 'm',
            EFFECT_TYPE_ATTACK: 'x',
            EFFECT_TYPE_POISON: 'p',
            EFFECT_TYPE_CURSE: 'c',
            EFFECT_TYPE_ITEM: 'i',
            EFFECT_TYPE_NATURAL: 'n',
            EFFECT_NON_STACKABLE: 'bhmx'
        });
    });

    it('tables de facteurs : 64 niveaux', () => {
        const ep = new EffectProcessor();
        ['BUFF_FACTOR', 'VULNER_FACTOR', 'RESIST_FACTOR', 'DEBUFF_FACTOR'].forEach((s) => {
            expect(ep[s], s).toHaveLength(64);
        });
        expect(ep.BUFF_FACTOR[0]).toBe(1);
        expect(ep.BUFF_FACTOR[10]).toBeCloseTo(2);
        expect(ep.RESIST_FACTOR[0]).toBe(1);
        expect(ep.RESIST_FACTOR[9]).toBeCloseTo(0.5);
        expect(ep.DEBUFF_FACTOR).toEqual(ep.RESIST_FACTOR);
        expect(ep.VULNER_FACTOR).toEqual(ep.BUFF_FACTOR);
    });

    it('deux instances ne partagent pas leurs tables', () => {
        assertNotShared(new EffectProcessor(), new EffectProcessor(),
            ['BUFF_FACTOR', 'VULNER_FACTOR', 'RESIST_FACTOR', 'DEBUFF_FACTOR']);
    });

    it('effet non cumulable (bhmx) : le même code remplace le précédent', () => {
        const ep = new EffectProcessor();
        const c = creature(ep);
        ep.applyEffect(c, 'mabldBF');
        ep.applyEffect(c, 'mabldBF');
        expect(c.oEffects).toHaveLength(1);
        expect(c.getAttribute('blind')).toBe(1);
        ep.applyEffect(c, 'nabldBF');
        ep.applyEffect(c, 'nabldBF');
        expect(c.oEffects).toHaveLength(3);
    });

    it('poison sous antidote : effet nul', () => {
        const ep = new EffectProcessor();
        const c = creature(ep, { antidote: 1 });
        ep.applyEffect(c, 'pxtoxDF');
        expect(state(c)).toEqual(state(creature(ep, { antidote: 1 })));
    });

    it('invulnérable : pas de dégâts', () => {
        const ep = new EffectProcessor();
        const c = creature(ep, { invulnerable: 1 });
        ep.applyEffect(c, 'mxphyFA');
        expect(c.getAttribute('hp')).toBe(40);
    });

    describe('remèdes', () => {
        // créature aveugle, confuse, ralentie, enracinée, paralysée,
        // affaiblie, vulnérable, malade, avec un bonus d'objet permanent
        function afflicted() {
            const ep = new EffectProcessor();
            ep.setTime(100);
            const c = creature(ep);
            ['mabldBZ', 'macnfBZ', 'masnrBZ', 'marooBZ', 'mahldBZ', 'maweaBZ', 'mavulBZ', 'maillBZ', 'ibpowB/']
                .forEach((s) => ep.applyEffect(c, s));
            return { ep, c };
        }

        // sous-types encore actifs une seconde après le remède
        function remaining(ep, c, sRemedy) {
            ep.applyEffect(c, sRemedy);
            ep.setTime(101);
            c.processEffects();
            return c.oEffects.map((e) => ep.getEffectSubType(e.sEffect)).filter((s) => s !== ep.getEffectSubType(sRemedy));
        }

        it('remède du corps : faiblesse, vulnérabilité et maladie seulement', () => {
            const { ep, c } = afflicted();
            expect(remaining(ep, c, 'brbodBP')).toEqual(['abld', 'acnf', 'asnr', 'aroo', 'ahld', 'bpow']);
            expect(c.getAttribute('weak')).toBe(0);
            expect(c.getAttribute('power')).toBe(1);
        });

        it('remède de l\'esprit : aveuglement et confusion seulement', () => {
            const { ep, c } = afflicted();
            expect(remaining(ep, c, 'brminBP')).toEqual(['asnr', 'aroo', 'ahld', 'awea', 'avul', 'aill', 'bpow']);
            expect(c.getAttribute('blind')).toBe(0);
        });

        it('liberté : ralentissement, enracinement et paralysie', () => {
            const { ep, c } = afflicted();
            expect(remaining(ep, c, 'brmovBP')).toEqual(['abld', 'acnf', 'awea', 'avul', 'aill', 'bpow']);
            expect(c.getAttribute('snared')).toBe(0);
            expect(c.getAttribute('rooted')).toBe(0);
            expect(c.getAttribute('held')).toBe(0);
        });

        it.each([['rbod', 'health'], ['rmin', 'clearmind'], ['rmov', 'freedom'], ['rdth', 'drdeath']])(
            'la résistance %s (%s) prend fin', (sSub, sAttr) => {
                const ep = new EffectProcessor();
                ep.setTime(100);
                const c = creature(ep);
                ep.applyEffect(c, 'b' + sSub + 'BP');
                expect(c.getAttribute(sAttr)).toBe(1);
                ep.setTime(115);
                c.processEffects();
                expect(c.getAttribute(sAttr)).toBe(0);
            });
    });

    // BOGUE corrigé : ArrayTools.removeItem(aEffects, i), i non déclaré,
    // la potion de dissipation plantait dès qu'un effet temporaire était actif
    it('dissipation : retire des effets temporaires, jamais les permanents', () => {
        const ep = new EffectProcessor();
        ep.setTime(100);
        const c = creature(ep);
        ep.applyEffect(c, 'mabldBZ');
        ep.applyEffect(c, 'nacnfBZ');
        ep.applyEffect(c, 'ibpowB/');
        ep.applyEffect(c, 'bdispCA');
        ep.setTime(101);
        c.processEffects();
        expect(c.oEffects.map((e) => e.sEffect)).toEqual(['ibpowB/']);
        expect([c.getAttribute('blind'), c.getAttribute('confused'), c.getAttribute('power')]).toEqual([0, 0, 1]);
    });

    // filet de sécurité : chaque sous-type, appliqué 5 s (niveau 3) à une
    // créature, puis une seconde plus tard, puis à échéance
    describe.each(subtypes())('sous-type %s', (sSub) => {
        it('application, tour, expiration', () => {
            const ep = new EffectProcessor();
            ep.setTime(100);
            const c = creature(ep);
            const sEffect = 'n' + sSub + 'DF';
            const aSteps = [];
            ep.applyEffect(c, sEffect);
            aSteps.push(['apply', state(c)]);
            ep.setTime(101);
            c.processEffects();
            aSteps.push(['101', state(c)]);
            ep.setTime(105);
            c.processEffects();
            aSteps.push(['105', state(c)]);
            expect(aSteps).toMatchSnapshot();
        });
    });
});
