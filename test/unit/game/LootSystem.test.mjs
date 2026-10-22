import { describe, it, expect, vi } from 'vitest';
import { LootSystem } from '../../../src/game/LootSystem.js';
import { LOOT_DATA } from '../../../src/game/data/LOOT_DATA.js';
import { assertNotShared } from '../helpers.mjs';

describe('LootSystem', () => {
    it('valeurs initiales', () => {
        const l = new LootSystem();
        expect(l._oTable).toEqual({});
        assertNotShared(l, new LootSystem(), ['_oTable']);
    });

    it('table inconnue : rien', () => {
        expect(new LootSystem().getLoot('nope')).toEqual([]);
    });

    it('generateDistribution : chaque clé autant de fois que son poids', () => {
        const a = new LootSystem().generateDistribution({ a: 3, b: 1, c: 0 });
        expect(a.slice().sort()).toEqual(['a', 'a', 'a', 'b']);
    });

    it('tire le nombre d\'objets puis chaque objet, et garde la table', () => {
        const l = new LootSystem();
        const aLoot = l.getLoot('m_witch_queen');
        expect(aLoot).toEqual(['wand_lyte_3']);
        expect(Object.keys(l._oTable)).toEqual(['m_witch_queen']);
    });

    it('les objets « always » tombent toujours, en plus du tirage', () => {
        LOOT_DATA.__test = { chances: { 0: 1 }, items: { gold: 1 }, always: ['ccc_bread'] };
        try {
            expect(new LootSystem().getLoot('__test')).toEqual(['ccc_bread']);
        } finally {
            delete LOOT_DATA.__test;
        }
    });

    it('les nombres tirés respectent la table', () => {
        const l = new LootSystem();
        const oSeen = new Set();
        for (let i = 0; i < 200; i++) {
            const a = l.getLoot('m_zombie');
            expect(a.length).toBeLessThanOrEqual(1);
            a.forEach((s) => oSeen.add(s));
        }
        expect([...oSeen].every((s) => s in LOOT_DATA.m_zombie.items)).toBe(true);
    });

    it('test compte les objets sur n tirages', () => {
        const o = new LootSystem().test('m_witch_queen', 5);
        expect(o).toEqual({ wand_lyte_3: 5 });
    });
});
