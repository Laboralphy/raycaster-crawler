import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageLoader } from '../../../../src-recovered/libraries/Raycaster/ImageLoader.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

class FakeImage {
    complete = false;
    width = 2;
    height = 3;
    src = '';
}

describe('ImageLoader', () => {
    beforeEach(() => vi.stubGlobal('Image', FakeImage));

    it('a des valeurs par défaut', () => {
        assertDefaults(new ImageLoader(), {
            oImages: {}, aLoading: [], oStats: { images: {}, totalsize: 0 },
            bComplete: false, nLoaded: 0
        });
    });

    it('ne partage pas ses conteneurs entre instances', () => {
        assertNotShared(new ImageLoader(), new ImageLoader(), ['oImages', 'aLoading', 'oStats']);
    });

    it('load ne crée qu\'une image par url', () => {
        const l = new ImageLoader();
        const a = l.load('a.png');
        expect(a.src).toBe('a.png');
        expect(l.load('a.png')).toBe(a);
        expect(l.countLoading()).toBe(2);
    });

    it('complete attend toutes les images puis calcule les statistiques', () => {
        const l = new ImageLoader();
        const a = l.load('a.png');
        const b = l.load('b.png');
        a.complete = true;
        expect(l.complete()).toBe(false);
        expect(l.countLoaded()).toBe(1);
        expect(l.countLoading()).toBe(2);
        b.complete = true;
        b.width = 10;
        expect(l.complete()).toBe(true);
        expect(l.countLoading()).toBe(2);
        expect(l.aLoading).toEqual([]);
        expect(l.oStats).toEqual({ images: { 'a.png': 24, 'b.png': 120 }, totalsize: 144 });
        expect(l.complete()).toBe(true);
    });

    it('load relance le chargement', () => {
        const l = new ImageLoader();
        l.load('a.png').complete = true;
        l.complete();
        l.load('b.png');
        expect(l.bComplete).toBe(false);
    });

    it('finalize libère tout', () => {
        const l = new ImageLoader();
        l.load('a.png');
        l.finalize();
        expect(l.oImages).toBe(null);
        expect(l.aLoading).toBe(null);
        expect(l.oStats).toBe(null);
    });
});
