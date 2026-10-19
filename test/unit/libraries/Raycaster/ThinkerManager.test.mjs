import { describe, it, expect } from 'vitest';
import { ThinkerManager } from '../../../../src-recovered/libraries/Raycaster/ThinkerManager.js';
import { Thinker } from '../../../../src-recovered/libraries/Raycaster/Thinker.js';
import { assertDefaults } from '../../helpers.mjs';

class TestThinker extends Thinker {}

ThinkerManager.registerThinkers({ 'Test.Unit': TestThinker });

describe('ThinkerManager', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new ThinkerManager(), { oGameInstance: null });
    });

    it('crée un thinker enregistré et lui donne le jeu', () => {
        const tm = new ThinkerManager();
        const oGame = {};
        tm.oGameInstance = oGame;
        const t = tm.createThinker('Test.Unit');
        expect(t instanceof TestThinker).toBeTruthy();
        expect(t.oGame).toBe(oGame);
        expect(tm.createThinker('Test.Unit')).not.toBe(t);
    });

    it('renvoie null sans nom de thinker', () => {
        const tm = new ThinkerManager();
        expect(tm.createThinker()).toBe(null);
        expect(tm.createThinker(null)).toBe(null);
    });

    it('lève une erreur pour un thinker inconnu', () => {
        expect(() => new ThinkerManager().createThinker('Nope')).toThrow(/Nope/);
    });
});
