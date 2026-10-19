// Legion n'est utilisée nulle part dans le jeu.
import { describe, it, expect } from 'vitest';
import { Legion } from '../../../../src-recovered/libraries/O876/Legion.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

describe('Legion', () => {
    it('est vide au départ', () => {
        assertDefaults(new Legion(), { aItems: [], aRecycler: [] });
    });

    it('ne partage pas ses tableaux entre instances', () => {
        assertNotShared(new Legion(), new Legion(), ['aItems', 'aRecycler']);
    });

    it('recycle les indices libérés', () => {
        const l = new Legion();
        const a = {}, b = {}, c = {};
        expect(l.link(a)).toBe(0);
        expect(l.link(b)).toBe(1);
        l.unlink(0);
        expect(l.getItem(0)).toBe(null);
        expect(l.link(c)).toBe(0);
        expect(l.getItem(0)).toBe(c);
        expect(l.getItem(9)).toBe(null);
    });

    // bogue connu : indexOf appelle aItems.index, qui n'existe pas.
    // it.fails passera au rouge une fois le bogue corrigé.
    it.fails('unlink par objet', () => {
        const l = new Legion();
        const a = {};
        l.link(a);
        l.unlink(a);
        expect(l.getItem(0)).toBe(null);
    });
});
