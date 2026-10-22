import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardDevice } from '../../../../src/libraries/Raycaster/KeyboardDevice.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

describe('KeyboardDevice', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {});
        vi.stubGlobal('document', {});
    });

    function plugged() {
        const k = new KeyboardDevice();
        k.plugEvents();
        return k;
    }

    it('a des valeurs par défaut', () => {
        const k = new KeyboardDevice();
        assertDefaults(k, { aAliases: {}, aKeyBuffer: [], nKeyBufferSize: 16, bUseBuffer: true });
        expect(k.aKeys.length).toBe(256);
        expect(k.aKeys.every(n => n === 0)).toBe(true);
    });

    it('ne partage pas ses tableaux entre instances', () => {
        assertNotShared(new KeyboardDevice(), new KeyboardDevice(), ['aKeys', 'aKeyBuffer', 'aAliases']);
    });

    it('plugEvents branche le document, unplugEvents le débranche', () => {
        const k = plugged();
        expect(window.__keyboardDevice).toBe(k);
        expect(document.onkeydown).toBe(k.eventKeyDown);
        expect(document.onkeyup).toBe(k.eventKeyUp);
        k.unplugEvents();
        expect(window.__keyboardDevice).toBe(null);
        expect(document.onkeydown).toBe(undefined);
    });

    it('note l\'état des touches : 1 enfoncée, 2 relâchée', () => {
        const k = plugged();
        expect(document.onkeydown({ keyCode: 37 })).toBe(false);
        expect(k.aKeys[37]).toBe(1);
        document.onkeyup({ keyCode: 37 });
        expect(k.aKeys[37]).toBe(2);
    });

    it('préfère charCode à keyCode, et lit window.event s\'il existe', () => {
        const k = plugged();
        document.onkeydown({ charCode: 65, keyCode: 1 });
        expect(k.aKeys[65]).toBe(1);
        window.event = { keyCode: 40 };
        document.onkeydown({ keyCode: 1 });
        expect(k.aKeys[40]).toBe(1);
    });

    it('applique les alias', () => {
        const k = plugged();
        k.setAliases({ 90: 87 });
        document.onkeydown({ keyCode: 90 });
        expect(k.aKeys[87]).toBe(1);
        expect(k.aKeys[90]).toBe(0);
    });

    it('met les frappes en tampon : positif à l\'appui, négatif au relâché', () => {
        const k = plugged();
        document.onkeydown({ keyCode: 13 });
        document.onkeyup({ keyCode: 13 });
        expect(k.inputKey()).toBe(13);
        expect(k.inputKey()).toBe(-13);
        expect(k.inputKey()).toBe(0);
    });

    it('limite le tampon et peut le désactiver', () => {
        const k = new KeyboardDevice();
        for (let i = 1; i <= 20; i++) {
            k.keyBufferPush(i);
        }
        expect(k.aKeyBuffer.length).toBe(16);
        k.keyBufferPush(0);
        expect(k.aKeyBuffer.length).toBe(16);
        const k2 = new KeyboardDevice();
        k2.bUseBuffer = false;
        k2.keyBufferPush(5);
        expect(k2.inputKey()).toBe(0);
    });
});
