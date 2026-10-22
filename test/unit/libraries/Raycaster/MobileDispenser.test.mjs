import { describe, it, expect } from 'vitest';
import { MobileDispenser } from '../../../../src/libraries/Raycaster/MobileDispenser.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

describe('MobileDispenser', () => {
    it('est vide au départ', () => {
        assertDefaults(new MobileDispenser(), { aBlueprints: {} });
        expect(new MobileDispenser().render()).toBe('');
    });

    it('ne partage pas ses réserves entre instances', () => {
        assertNotShared(new MobileDispenser(), new MobileDispenser(), ['aBlueprints']);
    });

    it('rend les mobiles par plan, le dernier rangé en premier', () => {
        const d = new MobileDispenser();
        d.registerBlueprint('m_goblin');
        const a = {}, b = {};
        d.pushMobile('m_goblin', a);
        d.pushMobile('m_goblin', b);
        expect(d.popMobile('m_goblin')).toBe(b);
        expect(d.popMobile('m_goblin')).toBe(a);
        expect(d.popMobile('m_goblin')).toBe(null);
    });

    it('render liste les plans non vides', () => {
        const d = new MobileDispenser();
        d.registerBlueprint('a');
        d.registerBlueprint('b');
        d.registerBlueprint('c');
        d.pushMobile('a', {});
        d.pushMobile('a', {});
        d.pushMobile('c', {});
        expect(d.render()).toBe('[a: 2][c: 1]');
    });
});
