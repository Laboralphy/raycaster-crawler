import { describe, it, expect } from 'vitest';
import { Item } from '../../../../src-recovered/game/GC/Item.js';
import { assertDefaults } from '../../helpers.mjs';

describe('GC Item', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Item('ref'), { resref: 'ref', stacksize: 1, stackcount: 1 });
    });

    it('n\'est empilable que si stacksize > 1', () => {
        const i = new Item('ref');
        expect(i.isStackable()).toBe(false);
        i.stacksize = 10;
        expect(i.isStackable()).toBe(true);
    });

    it('setStackCount borne entre 0 et stacksize', () => {
        const i = new Item('ref');
        i.stacksize = 10;
        expect(i.setStackCount(15)).toBe(10);
        expect(i.isStackFull()).toBe(true);
        expect(i.setStackCount(-3)).toBe(0);
        expect(i.isStackEmpty()).toBe(true);
    });

    it('stackInc et stackDec renvoient la quantité réellement déplacée', () => {
        const i = new Item('ref');
        i.stacksize = 10;
        i.stackcount = 8;
        expect(i.stackInc(5)).toBe(2);
        expect(i.stackcount).toBe(10);
        expect(i.stackDec(4)).toBe(4);
        expect(i.stackDec(20)).toBe(6);
        expect(i.stackcount).toBe(0);
        expect(i.stackInc(0)).toBe(0);
        expect(i.stackDec(-1)).toBe(0);
    });
});
