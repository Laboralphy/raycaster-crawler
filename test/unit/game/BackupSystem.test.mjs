import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackupSystem } from '../../../src/game/BackupSystem.js';
import { assertDefaults, assertNotShared } from '../helpers.mjs';

// faux localStorage : clés énumérables, removeItem caché
let storage;
beforeEach(() => {
    storage = {};
    Object.defineProperty(storage, 'removeItem', { value: (k) => delete storage[k] });
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { localStorage: storage });
});

function backup() {
    const b = new BackupSystem();
    b.init('rk');
    return b;
}

describe('BackupSystem', () => {
    it('valeurs initiales', () => {
        const b = new BackupSystem();
        assertDefaults(b, { nBackupFormat: 1, sNameSpace: '', SEPARATOR: '__', DATA_KEY: 'data', aFiles: null, aRatio: {} });
        assertNotShared(b, new BackupSystem(), ['aRatio']);
    });

    it('refuse de fonctionner sans localStorage', () => {
        vi.stubGlobal('window', {});
        expect(() => new BackupSystem()).toThrow('no localstorage available');
    });

    it('init : espace de noms', () => {
        expect(backup().sNameSpace).toBe('rk__');
    });

    it('stocke, recharge (compressé), et tient la liste des clés', () => {
        const b = backup();
        b.storeData('save', { a: [1, 2, 3], s: 'texte' });
        expect(Object.keys(storage).sort()).toEqual(['rk__data', 'rk__save']);
        expect(storage.rk__save.startsWith('O876')).toBe(true);
        expect(b.isStoredData('save')).toBe(true);
        expect(b.loadData('save')).toEqual({ a: [1, 2, 3], s: 'texte' });
        expect(b.loadData('data')).toEqual(['save']);
        expect(typeof b.aRatio.save).toBe('number');
        expect(b.loadData('absent')).toBe(null);
    });

    it('storeData(null) efface la clé et la retire de la liste', () => {
        const b = backup();
        b.storeData('a', 1);
        b.storeData('b', 2);
        b.storeData('a', null);
        expect(b.isStoredData('a')).toBe(false);
        expect(b.loadData('data')).toEqual(['b']);
    });

    it('exportData et clear', () => {
        const b = backup();
        expect(b.exportData()).toBe(null);
        b.storeData('a', 1);
        b.storeData('b', [2]);
        storage.other = 'x';
        expect(b.exportData()).toEqual({ a: 1, b: [2] });
        b.clear();
        expect(Object.keys(storage)).toEqual(['other']);
    });

    it('clear se rabat sur un balayage si la liste est illisible', () => {
        const b = backup();
        b.storeData('a', 1);
        storage.rk__data = 'corrompu';
        b.clear();
        expect(Object.keys(storage)).toEqual([]);
    });
});
