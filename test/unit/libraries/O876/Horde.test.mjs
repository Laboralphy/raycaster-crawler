import { describe, it, expect } from 'vitest';
import { Horde } from '../../../../src-recovered/libraries/O876/Horde.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

function horde(...aItems) {
    const h = new Horde();
    aItems.forEach(i => h.link(i));
    return h;
}

describe('O876 Horde', () => {
    it('est vide au départ', () => {
        assertDefaults(new Horde(), { aItems: [] });
        expect(new Horde().count()).toBe(0);
    });

    it('ne partage pas ses éléments entre instances', () => {
        assertNotShared(new Horde(), new Horde(), ['aItems']);
    });

    it('link renvoie l\'indice de l\'élément', () => {
        const h = new Horde();
        const a = {}, b = {};
        expect(h.link(a)).toBe(0);
        expect(h.link(b)).toBe(1);
        expect(h.getItem(1)).toBe(b);
        expect(h.getItem(2)).toBe(null);
        expect(h.indexOf(b)).toBe(1);
        expect(h.getItems()).toEqual([a, b]);
    });

    it('unlink par indice remplace par le dernier élément', () => {
        const a = { n: 'a' }, b = { n: 'b' }, c = { n: 'c' };
        const h = horde(a, b, c);
        h.unlink(0);
        expect(h.getItems()).toEqual([c, b]);
    });

    it('unlink par objet, et ignore les indices hors bornes', () => {
        const a = { n: 'a' }, b = { n: 'b' };
        const h = horde(a, b);
        h.unlink(b);
        expect(h.getItems()).toEqual([a]);
        h.unlink(5);
        h.unlink(-1);
        h.unlink({});
        expect(h.getItems()).toEqual([a]);
    });

    it('clear vide la horde', () => {
        const h = horde({}, {});
        h.clear();
        expect(h.count()).toBe(0);
    });
});
