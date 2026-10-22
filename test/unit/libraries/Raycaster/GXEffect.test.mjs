import { describe, it, expect } from 'vitest';
import { GXEffect } from '../../../../src/libraries/Raycaster/GXEffect.js';
import { GXDoor } from '../../../../src/libraries/Raycaster/GXDoor.js';
import { GXSecret } from '../../../../src/libraries/Raycaster/GXSecret.js';
import { assertDefaults } from '../../helpers.mjs';

describe('GXEffect', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new GXEffect(), { sClass: 'Effect' });
    });

    it('garde le raycaster', () => {
        const rc = {};
        expect(new GXEffect(rc).oRaycaster).toBe(rc);
    });

    it('est terminé d\'emblée et ses méthodes ne font rien', () => {
        const e = new GXEffect({});
        expect(e.isOver()).toBe(true);
        for (const m of ['process', 'render', 'done', 'terminate']) {
            expect(e[m]()).toBe(undefined);
        }
    });

    // Les sous-classes redéfinissent sClass. DataSerializer.saveOpenDoors et
    // Game reconnaissent les portes à sClass === 'Door' : un sClass posé par le
    // constructeur de GXEffect ne doit pas masquer celui des sous-classes.
    describe('sous-classes', () => {
        const rc = { nPlaneSpacing: 64 };

        it('GXDoor garde sClass \'Door\' et passe par son initialisation', () => {
            const d = new GXDoor(rc);
            expect(d.sClass).toBe('Door');
            expect(d.oRaycaster).toBe(rc);
            expect(d.isOver()).toBe(false);
        });

        it('GXSecret garde sClass \'Secret\' et passe par son initialisation', () => {
            const s = new GXSecret(rc);
            expect(s.sClass).toBe('Secret');
            expect(s.oRaycaster).toBe(rc);
            expect(s.nLimit).toBe(64);
        });

        it('une sous-classe peut redéfinir sClass', () => {
            class GXTest extends GXEffect {
                constructor(r) {
                    super(r);
                    this.sClass = 'Test';
                }
            }
            expect(new GXTest({}).sClass).toBe('Test');
            expect(new GXEffect({}).sClass).toBe('Effect');
        });
    });
});
