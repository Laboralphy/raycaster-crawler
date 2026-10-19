import { describe, it, expect } from 'vitest';
import { Thinker } from '../../../../src-recovered/libraries/Raycaster/Thinker.js';
import { LinearThinker } from '../../../../src-recovered/libraries/Raycaster/LinearThinker.js';
import { TimedThinker } from '../../../../src-recovered/game/thinkers/TimedThinker.js';
import { assertDefaults } from '../../helpers.mjs';

describe('Thinker', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Thinker(), { oMobile: null, oGame: null });
    });

    it('think ne fait rien', () => {
        expect(new Thinker().think()).toBe(undefined);
    });

    // Contrat des sous-classes : elles reçoivent oMobile/oGame après coup
    // (ThinkerManager, Horde) et gardent leur propre initialisation.
    describe('sous-classes', () => {
        it('LinearThinker passe par son initialisation', () => {
            const t = new LinearThinker();
            assertDefaults(t, { nTime: 0, oMobile: null, oGame: null });
            t.think();
            expect(t.think).toBe(t.thinkInit);
        });

        it('TimedThinker désactive son mobile après le délai', () => {
            const t = new TimedThinker();
            assertDefaults(t, { nTimeOut: 0, oMobile: null, oGame: null });
            t.oGame = { nTimeMs: 1000 };
            t.oMobile = { bActive: true };
            t.start(500);
            expect(t.nTimeOut).toBe(1500);
            t.oGame.nTimeMs = 1600;
            t.think();
            t.think();
            expect(t.oMobile.bActive).toBe(false);
        });

        it('une sous-classe moderne garde ses champs', () => {
            class T extends Thinker {
                constructor() {
                    super();
                    this.nValue = 7;
                }
            }
            assertDefaults(new T(), { nValue: 7, oMobile: null, oGame: null });
        });
    });
});
