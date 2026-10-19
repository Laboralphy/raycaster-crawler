import { describe, it, expect, beforeAll } from 'vitest';
import { DataSerializer } from '../../../src-recovered/game/DataSerializer.js';
import { Dungeon } from '../../../src-recovered/game/Dungeon.js';
import { Item } from '../../../src-recovered/game/Item.js';
import { STRINGS } from '../../../src-recovered/game/data/STRINGS.js';

beforeAll(() => STRINGS.setLanguage('en'));

// joueur portant un anneau de puissance (+4)
function wearer() {
    const d = new Dungeon();
    const c = d.getPlayerCreature();
    const r = new Item('ring_power_2');
    d.pickupItem(c, r);
    d.equipItem(c, r);
    return { d, c, r };
}

describe('DataSerializer : objets équipés', () => {
    it('sauvegarde puis recharge le lien entre l\'anneau et son effet', () => {
        const { d, c } = wearer();
        const ds = new DataSerializer();
        const oData = JSON.parse(JSON.stringify(ds.saveCreature(c)));
        const c2 = ds.restoreCreature(oData, { oDungeon: d });
        const r2 = d.getCreatureInventory(c2).oEquipSlots.finger;
        expect(r2.resref).toBe('ring_power_2');
        expect(r2.effects).toHaveLength(1);
        expect(c2.oEffects).toContain(r2.effects[0]);
        expect(c2.getAttribute('power')).toBe(4);
        // après rechargement, changer d'anneau retire bien le bonus
        const r3 = new Item('ring_power_2');
        d.pickupItem(c2, r3);
        d.equipItem(c2, r3);
        expect(c2.getAttribute('power')).toBe(4);
    });

    it('un effet d\'objet déjà retiré de la créature est ignoré, sans planter', () => {
        const { c, r } = wearer();
        c.oEffects.length = 0;
        const oData = new DataSerializer().saveCreature(c);
        const aEquip = oData.inventory[1];
        expect(aEquip[aEquip.indexOf('finger') + 1]).toEqual(['ring_power_2', r.identified, 1, []]);
    });
});
