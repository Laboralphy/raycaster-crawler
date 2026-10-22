import { describe, it, expect, vi, beforeAll } from 'vitest';
import { PanicPlugin } from '../../../../src/game/plugins/PanicPlugin.js';
import { Dungeon } from '../../../../src/game/Dungeon.js';
import { Item } from '../../../../src/game/Item.js';
import { STRINGS } from '../../../../src/game/data/STRINGS.js';

beforeAll(() => STRINGS.setLanguage('en'));

// jeu minimal : le sac contient les objets donnés ; gc_useItem est espionné
function game(aItems, oAttributes = {}) {
    const d = new Dungeon();
    const p = new PanicPlugin();
    const c = d.getPlayerCreature();
    aItems.forEach((s) => d.pickupItem(c, new Item(s)));
    for (const s in oAttributes) {
        c.modifyAttribute(s, oAttributes[s]);
    }
    p.oGame = {
        oDungeon: d,
        getPlayer: () => ({}),
        gc_useItem: vi.fn(),
        sys_notify: vi.fn()
    };
    const used = () => p.oGame.gc_useItem.mock.calls.map(([, oItem]) => oItem.resref);
    return { p, d, c, used };
}

const POTIONS = ['pot_heal_1', 'pot_heal_2', 'pot_heal_3', 'pot_ether_1', 'pot_ether_2', 'pot_ether_3',
    'pot_regen_3', 'pot_antidote', 'ccc_meal'];

describe('PanicPlugin.panic', () => {
    it('rien à faire : aucun objet, un message', () => {
        const { p, used } = game(POTIONS, { foodp: 500 });
        p.panic();
        expect(used()).toEqual([]);
        expect(p.oGame.sys_notify).toHaveBeenCalledWith('panic_nothing');
    });

    it('soin : la plus forte potion qui ne dépasse pas les points perdus (soins 12, 30, 60)', () => {
        [[35, 'pot_heal_2'], [60, 'pot_heal_3'], [100, 'pot_heal_3'], [12, 'pot_heal_1'], [7, 'pot_heal_1']]
            .forEach(([nLost, sPotion]) => {
                const { p, used } = game(POTIONS, { hp: nLost, foodp: 500 });
                p.panic();
                expect(used()).toEqual([sPotion]);
            });
    });

    it('soin : pas de potion pour une égratignure', () => {
        const { p, used } = game(POTIONS, { hp: 5, foodp: 500 });
        p.panic();
        expect(used()).toEqual([]);
    });

    it('énergie : même règle (20, 50, 100)', () => {
        const { p, used } = game(POTIONS, { mp: 70, foodp: 500 });
        p.panic();
        expect(used()).toEqual(['pot_ether_2']);
    });

    it('dans l\'ordre : antidote, soin, énergie, repas', () => {
        const { p, d, c, used } = game(POTIONS, { hp: 30, mp: 20 });
        d.oEffectProcessor.bestowEffect(c, 'pxtoxCF', 5);
        c.modifyAttribute('foodp', -c.getAttribute('foodp'));
        p.panic();
        expect(used()).toEqual(['pot_antidote', 'pot_heal_2', 'pot_ether_1', 'ccc_meal']);
        expect(p.oGame.sys_notify).toHaveBeenCalledWith('panic_used', [expect.stringContaining(',')], expect.anything());
    });

    it('pas d\'antidote sans poison, pas de repas si la jauge n\'est pas à 0', () => {
        const { p, used } = game(POTIONS, { foodp: 10 });
        p.panic();
        expect(used()).toEqual([]);
    });
});
