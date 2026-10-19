import { describe, it, expect, beforeAll } from 'vitest';
import { Dungeon } from '../../../src-recovered/game/Dungeon.js';
import { EffectProcessor } from '../../../src-recovered/game/EffectProcessor.js';
import { Item } from '../../../src-recovered/game/Item.js';
import { MONSTERS_BLUEPRINTS } from '../../../src-recovered/game/data/MONSTERS_BLUEPRINTS.js';
import { SPELLS_DATA } from '../../../src-recovered/game/data/SPELLS_DATA.js';
import { STRINGS } from '../../../src-recovered/game/data/STRINGS.js';
import { assertDefaults, assertNotShared } from '../helpers.mjs';

beforeAll(() => STRINGS.setLanguage('en'));

// mobile d'un monstre : ses données de plan
function mobile(sId) {
    const d = MONSTERS_BLUEPRINTS[sId].data;
    return { getData: (s) => d[s] };
}

function attributes(c) {
    const o = {};
    Object.keys(c.getAttributes()).sort().forEach((s) => {
        o[s] = c.getAttribute(s);
    });
    return o;
}

describe('Dungeon : construction', () => {
    it('valeurs initiales', () => {
        const d = new Dungeon();
        assertDefaults(d, {
            INVENTORY_SIZE_PLAYER: 32,
            INVENTORY_SIZE_CREATURE: 4,
            oArea: null,
            oWeapons: {},
            oSpawnPoint: { x: 0, y: 0, angle: 0 }
        });
        expect(d.oEffectProcessor).toBeInstanceOf(EffectProcessor);
        expect(d.oData.player.location).toEqual({ area: '', floor: 0, startpoint: 0 });
        expect(d.oData.player.keys).toEqual({ generic: 0, special: {} });
        assertNotShared(d, new Dungeon(), ['oData', 'oWeapons', 'oSpawnPoint', 'oEffectProcessor', 'aStartingStuff']);
    });

    it('le joueur au début de la partie', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        const inv = d.getCreatureInventory(c);
        expect(c.oEffectProcessor).toBe(d.oEffectProcessor);
        expect(attributes(c)).toEqual({ energy: 100, foodc: 10, foodmax: 1000, foodp: 1000, speed: 160, vitality: 100 });
        expect(inv.getSize()).toBe(32);
        expect(inv.oEquipSlots.hand.resref).toBe('wand_yce_1');
        expect(Object.keys(inv.oEquipSlots)).toEqual(['hand', 'neck', 'finger', 'ears']);
        expect(d.getInventoryDigest(inv).map((o) => o.resref + '×' + o.stackcount)).toMatchSnapshot();
        expect(c.oExtraData.craft).toEqual(['pot_heal_1', 'pot_ether_1', 'ccc_meal']);
        expect(c.oExtraData.shelves).toEqual({});
        expect(c.oExtraData.magic).toEqual({ cooldown: {}, book: [] });
        expect(c.oExtraData.level).toBe(1);
    });

    it('resetData repart d\'un monde vide, avec un nouveau processeur d\'effets', () => {
        const d = new Dungeon();
        const ep = d.oEffectProcessor;
        d.setPlayerLocation('d1', 2, 1);
        d.resetData();
        expect(d.oData.player.creature).toBe(null);
        expect(d.getPlayerLocationArea()).toBe('');
        expect(d.oEffectProcessor).not.toBe(ep);
    });
});

describe('Dungeon : monstres', () => {
    it('setupMobCreature : arme, propriétés (+ niveau), drapeau boss, vitalité', () => {
        const d = new Dungeon();
        const c = d.setupMobCreature(d.newCreature(1), mobile('m_witch_queen'));
        const inv = d.getCreatureInventory(c);
        expect(inv.getSize()).toBe(4);
        expect(d.getCreatureEquippedWeapon(c).resref).toBe('wand_witch_queen_1');
        expect(attributes(c)).toEqual({ drelectricity: 5, drmagical: 3, f_boss: 1, speed: 90, vitality: 60 });
        expect(c.oEffects.map((e) => e.sEffect)).toEqual(['nrmagD/', 'nreleF/']);
    });

    it('setupMobCreature : le niveau multiplie la vitalité et la puissance', () => {
        const d = new Dungeon();
        const c = d.setupMobCreature(d.newCreature(3), { getData: (s) => ({ weapon: 'dag_brass', flags: '0', properties: null, vitality: 5, power: 2, speed: 40 })[s] });
        expect(attributes(c)).toEqual({ power: 6, speed: 40, vitality: 15 });
    });
});

describe('Dungeon : lieux, objets, clés', () => {
    it('setPlayerLocation : étage connu ou non', () => {
        const d = new Dungeon();
        d.setPlayerLocation('d1', 0, 1);
        expect(d.oArea).toBe(null);
        d.defineArea([[1, 2]]);
        d.setPlayerLocation('d2', 0, 0);
        d.setPlayerLocation('d1', 0, 2);
        expect(d.oArea).toEqual([[1, 2]]);
        expect(d.getAreaBlockProperty(1, 0)).toBe(2);
        d.setAreaBlockProperty(1, 0, 9);
        expect(d.getArea()).toEqual([[1, 9]]);
        expect([d.getPlayerLocationArea(), d.getPlayerLocationFloor(), d.getPlayerLocationStartPoint()]).toEqual(['d1', 0, 2]);
        d.setPlayerSpawnPoint(10, 20, 1.5);
        expect(d.getPlayerSpawnPoint()).toEqual({ x: 10, y: 20, angle: 1.5 });
    });

    it('horde, objets et portes ouvertes rangés par étage', () => {
        const d = new Dungeon();
        d.setPlayerLocation('d1', 1, 0);
        expect(d.getHorde()).toBe(null);
        d.setHorde({ 1: 'mob' });
        d.setObjects(['obj']);
        d.getOpenDoors().push('door');
        d.setPlayerLocation('d1', 2, 0);
        expect(d.getHorde()).toBe(null);
        expect(d.getObjects()).toBe(undefined);
        expect(d.getOpenDoors()).toEqual([]);
        d.setPlayerLocation('d1', 1, 0);
        expect(d.getHorde()).toEqual({ 1: 'mob' });
        expect(d.getObjects()).toEqual(['obj']);
        expect(d.getOpenDoors()).toEqual(['door']);
        d.setOpenDoors(['other']);
        expect(d.getOpenDoors()).toEqual(['other']);
    });

    it('objets au sol : pile par case, ramassage dans l\'ordre', () => {
        const d = new Dungeon();
        d.setPlayerLocation('d1', 0, 0);
        expect(d.peekDrop(3, 4)).toBe(null);
        d.addDrop(3, 4, 'gold');
        d.addDrop(3, 4, new Item('pot_heal_1'));
        expect(d.peekDrop(3, 4).resref).toBe('gold');
        const c = d.getPlayerCreature();
        expect(d.pickupDrop(c, 3, 4).resref).toBe('gold');
        expect(d.getDropStack(3, 4).map((o) => o.resref)).toEqual(['pot_heal_1']);
        expect(d.pickupDrop(c, 9, 9)).toBe(null);
    });

    it('clés de couleur par étage, clés génériques partout', () => {
        const d = new Dungeon();
        d.setPlayerLocation('d1', 0, 0);
        d.pickupAreaKey(2);
        expect(d.hasKey(2)).toBe(true);
        expect(d.hasKey(1)).toBe(false);
        expect(d.getPossessedKeys()).toBe(4);
        d.setPlayerLocation('d1', 1, 0);
        expect(d.hasKey(2)).toBe(false);
        expect(d.useGenericKey()).toBe(false);
        d.addGenericKey();
        d.addGenericKey(2);
        expect(d.getGenericKeyCount()).toBe(3);
        expect(d.hasGenericKey()).toBe(true);
        expect(d.useGenericKey()).toBe(true);
        expect(d.getGenericKeyCount()).toBe(2);
    });

    it('learnCraft n\'ajoute une recette qu\'une fois', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        d.learnCraft(c, 'pot_heal_2');
        d.learnCraft(c, 'pot_heal_2');
        expect(c.oExtraData.craft).toEqual(['pot_heal_1', 'pot_ether_1', 'ccc_meal', 'pot_heal_2']);
    });
});

describe('Dungeon : équipement', () => {
    it('équiper applique les propriétés', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        const a = new Item('ring_power_2');
        d.pickupItem(c, a);
        d.equipItem(c, a);
        expect(c.getAttribute('power')).toBe(4);
        expect(d.getItemLevel(a)).toBe(4);
        d.dropItem(c, a);
        expect(d.getCreatureInventory(c).getItemBagSlot(a)).toBe(-1);
    });

    // BOGUE corrigé (depuis le premier commit) : EffectProcessor.bestowEffect
    // ne renvoyait pas l'effet, l'objet ne gardait pas trace de ses effets et
    // changer d'anneau cumulait les bonus (+4, +8, +12...)
    it('remplacer un anneau retire son bonus', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        const a = new Item('ring_power_2');
        d.pickupItem(c, a);
        d.equipItem(c, a);
        expect(c.getAttribute('power')).toBe(4);
        expect(a.effects).toHaveLength(1);
        expect(d.getItemLevel(a)).toBe(4);
        const b = new Item('ring_power_2');
        d.pickupItem(c, b);
        d.equipItem(c, b);
        expect(a.effects).toEqual([]);
        expect(c.getAttribute('power')).toBe(4);
    });
});

describe('Dungeon : retirer un objet porté', () => {
    it('range l\'anneau dans le sac et retire son bonus', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        const inv = d.getCreatureInventory(c);
        const r = new Item('ring_power_2');
        d.pickupItem(c, r);
        d.equipItem(c, r);
        expect(d.unequipItem(c, 'finger')).toBe(r);
        expect(inv.oEquipSlots.finger).toBe(null);
        expect(inv.getItemBagSlot(r)).toBeGreaterThanOrEqual(0);
        expect(c.getAttribute('power')).toBe(0);
        expect(r.effects).toEqual([]);
        expect(c.oEffects).toEqual([]);
    });

    it('emplacement vide ou sac plein : rien ne bouge', () => {
        const d = new Dungeon();
        const c = d.getPlayerCreature();
        const inv = d.getCreatureInventory(c);
        expect(d.unequipItem(c, 'neck')).toBe(null);
        const r = new Item('ring_power_2');
        d.pickupItem(c, r);
        d.equipItem(c, r);
        while (inv.getFreeBagSlot() >= 0) {
            inv.addItem(new Item('ring_power_2'));
        }
        expect(d.unequipItem(c, 'finger')).toBe(null);
        expect(inv.oEquipSlots.finger).toBe(r);
        expect(c.getAttribute('power')).toBe(4);
    });
});

describe('Dungeon : attaques', () => {
    function attacker(sWeapon, nEnergy) {
        const d = new Dungeon();
        const c = d.newCreature(1);
        d.getCreatureInventory(c).setSize(4);
        d.getCreatureInventory(c).defineEquipSlot('hand');
        if (sWeapon) {
            const w = new Item(sWeapon);
            d.pickupItem(c, w);
            d.equipItem(c, w);
        }
        c.setBaseAttribute('energy', nEnergy === undefined ? 100 : nEnergy);
        return { d, c };
    }

    it('sans arme', () => {
        const { d, c } = attacker(null);
        expect(d.actionAttack(c, 0, 1000)).toBe('no_weapon');
    });

    it('attaque simple : délai de l\'arme avant la suivante', () => {
        const { d, c } = attacker('wand_imp_1');
        const a = d.actionAttack(c, 0, 1000);
        expect(a).toHaveLength(1);
        expect(a[0].blueprint).toBe('p_shadbolt');
        expect(c.oExtraData.retrigger).toBe(1500);
        expect(d.actionAttack(c, 0, 1400)).toBe(null);
        expect(d.actionAttack(c, 0, 1501)).toHaveLength(1);
    });

    it('charge : le sort le plus long dont le temps est dépassé', () => {
        const { d, c } = attacker('wand_imp_1');
        expect(d.actionAttack(c, 50, 1000)).toBe(null);
        expect(d.actionAttack(c, 101, 1000)[0].blueprint).toBe('p_healbolt');
    });

    it('énergie : coût payé, ou pas assez d\'énergie', () => {
        const { d, c } = attacker('wand_fyre_2', 100);
        const oSpell = SPELLS_DATA[d.getCreatureEquippedWeapon(c).spells[0].ref];
        d.actionAttack(c, 0, 1000);
        expect(c.getAttribute('mp')).toBe(oSpell.cost);
        const { d: d2, c: c2 } = attacker('wand_fyre_2', 0);
        const nSpeed = d2.getCreatureEquippedWeapon(c2).speed;
        if (oSpell.cost > 0) {
            expect(d2.actionAttack(c2, 0, 1000)).toBe('no_energy');
            expect(c2.oExtraData.retrigger).toBe(1000 + 2 * nSpeed);
        }
    });

    it.each(['l1', 'l3', 'l5', 'w1', 'w2', 'w3'])('motif de projectiles %s', (s) => {
        const d = new Dungeon();
        const a = d.getWeaponMissileDefinition({ blueprint: 'p_x', options: s + 'b', effects: ['e'], chances: [1] });
        expect(a.map((m) => [m.angle, m.options])).toMatchSnapshot();
        a.forEach((m) => {
            expect(m.blueprint).toBe('p_x');
            expect(m.effects).toEqual(['e']);
        });
    });

    it('missiles déjà décrits', () => {
        const aMissiles = [{ blueprint: 'p_y', angle: 1 }];
        expect(new Dungeon().getWeaponMissileDefinition({ missiles: aMissiles })).toBe(aMissiles);
    });
});
