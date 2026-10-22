import { describe, it, expect, vi } from 'vitest';
import { Creature } from '../../../../src/game/GC/Creature.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

describe('Creature', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Creature(), {
            oExtraData: {},
            oBaseAttributes: {},
            oAttributes: {},
            oEffects: [],
            oEffectProcessor: null,
            onAttributeChanged: null
        });
    });

    it('ne partage pas ses conteneurs entre instances', () => {
        assertNotShared(new Creature(), new Creature(), ['oExtraData', 'oBaseAttributes', 'oAttributes', 'oEffects']);
    });

    describe('attributs', () => {
        it('getAttribute additionne base et modificateur, 0 si absent', () => {
            const c = new Creature();
            expect(c.getAttribute('vitality')).toBe(0);
            c.setBaseAttribute('vitality', 10);
            expect(c.getAttribute('vitality')).toBe(10);
            c.modifyAttribute('vitality', 3);
            expect(c.getAttribute('vitality')).toBe(13);
            c.modifyAttribute('power', 2);
            expect(c.getAttribute('power')).toBe(2);
        });

        it('getBaseAttribute ignore les modificateurs', () => {
            const c = new Creature();
            c.setBaseAttribute('vitality', 10);
            c.modifyAttribute('vitality', 3);
            expect(c.getBaseAttribute('vitality')).toBe(10);
            expect(c.getBaseAttribute('none')).toBe(0);
        });

        it('setBaseAttribute à 0 supprime l\'attribut', () => {
            const c = new Creature();
            c.setBaseAttribute('dead', 1);
            c.setBaseAttribute('dead', 0);
            expect('dead' in c.oBaseAttributes).toBe(false);
            c.setBaseAttribute('never', 0);
            expect('never' in c.oBaseAttributes).toBe(false);
        });

        it('modifyAttribute supprime le modificateur revenu à 0 et ignore 0', () => {
            const c = new Creature();
            c.modifyAttribute('power', 2);
            c.modifyAttribute('power', -2);
            expect('power' in c.oAttributes).toBe(false);
            c.modifyAttribute('luck', 0);
            expect('luck' in c.oAttributes).toBe(false);
        });

        it('getAttributes renvoie [base, modificateur] pour chaque attribut', () => {
            const c = new Creature();
            c.setBaseAttribute('vitality', 10);
            c.modifyAttribute('vitality', 3);
            c.modifyAttribute('power', -1);
            expect(c.getAttributes()).toEqual({ vitality: [10, 3], power: [0, -1] });
        });
    });

    describe('onAttributeChanged', () => {
        it('est appelé à chaque changement de valeur', () => {
            const c = new Creature();
            const f = vi.fn();
            c.setOnAttributeChanged(f);
            c.setBaseAttribute('vitality', 10);
            c.modifyAttribute('vitality', 3);
            expect(f.mock.calls).toEqual([
                [c, 'vitality', 10, 0],
                [c, 'vitality', 3, 0]
            ]);
        });

        it('n\'est pas appelé si la valeur ne change pas', () => {
            const c = new Creature();
            c.setBaseAttribute('vitality', 10);
            const f = vi.fn();
            c.setOnAttributeChanged(f);
            f.mockClear();
            c.setBaseAttribute('vitality', 10);
            expect(f.mock.calls.length).toBe(0);
        });

        it('rejoue les attributs existants à l\'abonnement', () => {
            const c = new Creature();
            c.setBaseAttribute('vitality', 10);
            c.modifyAttribute('vitality', 2);
            c.modifyAttribute('power', 1);
            const f = vi.fn();
            c.setOnAttributeChanged(f);
            expect(f.mock.calls).toEqual([
                [c, 'vitality', 12, 0],
                [c, 'power', 1, 0]
            ]);
        });
    });

    describe('processEffects', () => {
        it('lève une erreur sans processeur d\'effets', () => {
            expect(() => new Creature().processEffects()).toThrow(/effect processor is not defined/);
        });

        it('délègue au processeur d\'effets', () => {
            const c = new Creature();
            const ep = { processEffects: vi.fn() };
            c.setEffectProcessor(ep);
            c.processEffects();
            expect(ep.processEffects.mock.calls[0]).toEqual([c]);
        });
    });
});
