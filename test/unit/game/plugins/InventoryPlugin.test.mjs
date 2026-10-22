import { describe, it, expect, vi, beforeAll } from 'vitest';
import { InventoryPlugin } from '../../../../src/game/plugins/InventoryPlugin.js';
import { Dungeon } from '../../../../src/game/Dungeon.js';
import { Item } from '../../../../src/game/Item.js';
import { STRINGS } from '../../../../src/game/data/STRINGS.js';

beforeAll(() => STRINGS.setLanguage('en'));

// jeu minimal : 'get' renvoie l'index choisi (négatif : emplacement porté, -1 = main)
function game(nIndex) {
    const d = new Dungeon();
    const p = new InventoryPlugin();
    p.oGame = {
        oDungeon: d,
        getPlayer: () => ({}),
        ui_command: vi.fn((s) => (s === 'get' ? nIndex : undefined)),
        sys_notify: vi.fn()
    };
    const c = d.getPlayerCreature();
    const r = new Item('ring_power_2');
    d.pickupItem(c, r);
    d.equipItem(c, r);
    return { p, d, c, r };
}

describe('InventoryPlugin.unequipItem', () => {
    it('retire l\'anneau choisi, le signale et rafraîchit la fenêtre', () => {
        const { p, d, c, r } = game(-3);
        p.unequipItem();
        expect(d.getCreatureInventory(c).oEquipSlots.finger).toBe(null);
        expect(p.oGame.sys_notify).toHaveBeenCalledWith('item_unequip', [r.getName()], r.icon);
        expect(p.oGame.ui_command).toHaveBeenCalledWith('update');
    });

    it('jamais l\'arme, ni un emplacement vide, ni un objet du sac', () => {
        [-1, -2, 0].forEach((n) => {
            const { p, d, c } = game(n);
            const inv = d.getCreatureInventory(c);
            const oBefore = Object.assign({}, inv.oEquipSlots);
            p.unequipItem();
            expect(inv.oEquipSlots).toEqual(oBefore);
            expect(p.oGame.sys_notify).not.toHaveBeenCalled();
        });
    });

    it('sac plein : message', () => {
        const { p, d, c } = game(-3);
        const inv = d.getCreatureInventory(c);
        while (inv.getFreeBagSlot() >= 0) {
            inv.addItem(new Item('ring_power_2'));
        }
        p.unequipItem();
        expect(p.oGame.sys_notify).toHaveBeenCalledWith('inventory_full');
        expect(inv.oEquipSlots.finger).not.toBe(null);
    });
});
