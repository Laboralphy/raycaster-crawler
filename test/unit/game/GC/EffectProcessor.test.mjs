import { describe, it, expect, vi } from 'vitest';
import { EffectProcessor } from '../../../../src-recovered/game/GC/EffectProcessor.js';
import { Effect } from '../../../../src-recovered/game/GC/Effect.js';
import { assertDefaults } from '../../helpers.mjs';

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function creature() {
    return { oEffects: [] };
}

describe('GC EffectProcessor', () => {
    it('valeurs initiales', () => {
        assertDefaults(new EffectProcessor(), { nTime: 0, BASE64 });
    });

    it('lit et écrit les codes d\'effet', () => {
        const ep = new EffectProcessor();
        expect(ep.getEffectType('mabldBF')).toBe('m');
        expect(ep.getEffectSubType('mabldBF')).toBe('abld');
        expect(ep.getEffectLevel('mabldBF')).toBe(1);
        expect(ep.getEffectDuration('mabldBF')).toBe(5);
        expect(ep.setEffectLevel('mabldBF', 3)).toBe('mabldDF');
        expect(ep.setEffectLevel('mabldBF', 99)).toBe('mabld/F');
        expect(ep.setEffectLevel('mabldBF', -1)).toBe('mabldAF');
        expect(ep.setEffectDuration('mabldBF', 63)).toBe('mabldB/');
        expect(ep.makeEffectStr('m', 'abld', 1, 5)).toBe('mabldBF');
    });

    it('bestowEffect : durées, 61 = 2 min, 62 = 3 min, 63 = permanent', () => {
        const ep = new EffectProcessor();
        ep.setTime(10);
        const c = creature();
        expect(ep.bestowEffect(c, 'mxxxxAF', 5).nTimeOut).toBe(15);
        expect(ep.bestowEffect(c, 'mxxxxA9', 61).nTimeOut).toBe(130);
        expect(ep.bestowEffect(c, 'mxxxxA+', 62).nTimeOut).toBe(190);
        const e = ep.bestowEffect(c, 'mxxxxA/', 63);
        expect(e.bExpirable).toBe(false);
        expect(e).toBeInstanceOf(Effect);
        expect(c.oEffects.map((x) => x.sEffect)).toEqual(['mxxxxAF', 'mxxxxA9', 'mxxxxA+', 'mxxxxA/']);
    });

    it('applyEffect : filtre par type, puis applique par sous-type, et garde l\'effet s\'il dure', () => {
        const ep = new EffectProcessor();
        const aCalls = [];
        ep.filterEffect_m = (c, s) => { aCalls.push('filter ' + s); return 'mtestBC'; };
        ep.applyEffect_test = (c, s) => { aCalls.push('apply ' + s); };
        const c = creature();
        const e = ep.applyEffect(c, 'mtestBF');
        expect(aCalls).toEqual(['filter mtestBF', 'apply mtestBC']);
        expect(e.sEffect).toBe('mtestBC');
        expect(e.nTimeOut).toBe(2);
    });

    it('applyEffect : sans durée, rien n\'est gardé', () => {
        const ep = new EffectProcessor();
        const c = creature();
        expect(ep.applyEffect(c, 'mtestBA')).toBe(null);
        expect(c.oEffects).toEqual([]);
    });

    it('processEffects : run à chaque tour, expire à échéance, puis retire', () => {
        const ep = new EffectProcessor();
        const run = vi.fn(), expire = vi.fn();
        ep.runEffect_test = run;
        ep.expireEffect_test = expire;
        const c = creature();
        ep.applyEffect(c, 'mtestBC');
        ep.processEffects(c);
        expect(run).toHaveBeenCalledTimes(1);
        expect(expire).not.toHaveBeenCalled();
        ep.setTime(2);
        ep.processEffects(c);
        expect(run).toHaveBeenCalledTimes(2);
        expect(expire).toHaveBeenCalledWith(c, 'mtestBC');
        expect(c.oEffects).toEqual([]);
    });

    it('dispell, sélection, killEffect et removeExpiredEffects', () => {
        const ep = new EffectProcessor();
        const expire = vi.fn();
        ep.expireEffect_test = expire;
        const c = creature();
        const a = ep.applyEffect(c, 'mtestBC');
        const b = ep.applyEffect(c, 'motheBC');
        expect(ep.selectEffects(c, ep.selectorAll)).toEqual([a, b]);
        ep.dispellEffect(c, 0);
        expect(a.hasExpired()).toBe(true);
        expect(ep.selectEffects(c, ep.selectorExpired)).toEqual([a]);
        ep.removeExpiredEffects(c);
        expect(expire).toHaveBeenCalledTimes(1);
        expect(c.oEffects).toEqual([b]);
        ep.dispellEffects(c, ep.selectorAll);
        expect(b.hasExpired()).toBe(true);
        ep.killEffect(c, b);
        expect(c.oEffects).toEqual([]);
    });
});
