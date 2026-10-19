import { describe, it, expect } from 'vitest';
import { Inventory } from '../../../../src-recovered/game/GC/Inventory.js';
import { Item } from '../../../../src-recovered/game/GC/Item.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

function item(sResRef, nSize = 1, nCount = 1) {
    const i = new Item(sResRef);
    i.stacksize = nSize;
    i.stackcount = nCount;
    return i;
}

function inventory(nSize) {
    const inv = new Inventory();
    inv.setSize(nSize);
    return inv;
}

describe('Inventory', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Inventory(), { oEquipSlots: {}, aBagSlots: [], nFindIndex: 0, sFindResRef: '' });
    });

    it('ne partage pas ses conteneurs entre instances', () => {
        assertNotShared(new Inventory(), new Inventory(), ['oEquipSlots', 'aBagSlots']);
    });

    describe('taille du sac', () => {
        it('setSize agrandit avec des cases vides', () => {
            const inv = inventory(3);
            expect(inv.getSize()).toBe(3);
            expect(inv.aBagSlots).toEqual([null, null, null]);
        });

        it('setSize ne réduit que si les cases retirées sont vides', () => {
            const inv = inventory(3);
            inv.aBagSlots[2] = item('a');
            expect(inv.setSize(2)).toBe(false);
            expect(inv.getSize()).toBe(3);
            inv.aBagSlots[2] = null;
            expect(inv.setSize(1)).toBe(true);
            expect(inv.getSize()).toBe(1);
        });

        it('getFreeBagSlot et isFull', () => {
            const inv = inventory(2);
            expect(inv.getFreeBagSlot()).toBe(0);
            inv.addItem(item('a'));
            expect(inv.getFreeBagSlot()).toBe(1);
            inv.addItem(item('b'));
            expect(inv.getFreeBagSlot()).toBe(-1);
            expect(inv.isFull()).toBe(true);
        });
    });

    describe('addItem', () => {
        it('range un objet dans la première case libre', () => {
            const inv = inventory(3);
            const a = item('a');
            inv.aBagSlots[0] = item('x');
            expect(inv.addItem(a)).toBe(true);
            expect(inv.aBagSlots[1]).toBe(a);
        });

        it('échoue quand le sac est plein, accepte null', () => {
            const inv = inventory(1);
            inv.addItem(item('a'));
            expect(inv.addItem(item('b'))).toBe(false);
            expect(inv.addItem(null)).toBe(true);
        });

        it('complète les piles existantes avant de prendre une case', () => {
            const inv = inventory(3);
            const p1 = item('potion', 5, 4);
            const p2 = item('potion', 5, 3);
            inv.addItem(p1);
            inv.addItem(p2);
            const p3 = item('potion', 5, 2);
            expect(inv.addItem(p3)).toBe(true);
            expect(p1.stackcount).toBe(5);
            expect(p2.stackcount).toBe(4);
            expect(p3.stackcount).toBe(0);
            expect(inv.getAllObjects().length).toBe(2);
        });

        it('place le reste d\'une pile dans une nouvelle case', () => {
            const inv = inventory(3);
            const p1 = item('potion', 5, 4);
            inv.addItem(p1);
            const p2 = item('potion', 5, 3);
            inv.addItem(p2);
            expect(p1.stackcount).toBe(5);
            expect(p2.stackcount).toBe(2);
            expect(inv.aBagSlots[1]).toBe(p2);
        });
    });

    describe('recherche', () => {
        it('findItem / findNextItem parcourent les objets d\'une ressource', () => {
            const inv = inventory(4);
            const a1 = item('a'), b = item('b'), a2 = item('a');
            [a1, b, a2].forEach(i => inv.addItem(i));
            expect(inv.findItem('a')).toBe(a1);
            expect(inv.findNextItem()).toBe(a2);
            expect(inv.findNextItem()).toBe(null);
            expect(inv.findItem('z')).toBe(null);
        });

        it('countItemStacks additionne les piles', () => {
            const inv = inventory(3);
            inv.addItem(item('gold', 100, 100));
            inv.addItem(item('gold', 100, 30));
            expect(inv.countItemStacks('gold')).toBe(130);
            expect(inv.countItemStacks('none')).toBe(0);
        });

        it('findAllItems renvoie toutes les piles d\'une ressource', () => {
            const inv = inventory(3);
            const g1 = item('gold', 100, 100), g2 = item('gold', 100, 30);
            inv.addItem(g1);
            inv.addItem(item('b'));
            inv.addItem(g2);
            expect(new Set(inv.findAllItems('gold'))).toEqual(new Set([g1, g2]));
        });

        it('getAllObjects liste l\'équipement puis le sac', () => {
            const inv = inventory(2);
            inv.defineEquipSlot('weapon');
            inv.defineEquipSlot('ring');
            const w = item('w'), a = item('a');
            inv.oEquipSlots.weapon = w;
            inv.addItem(a);
            expect(inv.getAllObjects()).toEqual([w, a]);
        });
    });

    describe('removeItem', () => {
        it('vide la case d\'un objet non empilable', () => {
            const inv = inventory(2);
            const a = item('a');
            inv.addItem(a);
            expect(inv.removeItem(a)).toBe(true);
            expect(inv.aBagSlots[0]).toBe(null);
        });

        it('décrémente une pile et ne vide la case qu\'à 0', () => {
            const inv = inventory(2);
            const p = item('potion', 5, 3);
            inv.addItem(p);
            inv.removeItem(p, 2);
            expect(p.stackcount).toBe(1);
            expect(inv.aBagSlots[0]).toBe(p);
            inv.removeItem(p);
            expect(inv.aBagSlots[0]).toBe(null);
        });

        it('renvoie false pour un objet absent, true pour null', () => {
            const inv = inventory(2);
            expect(inv.removeItem(item('a'))).toBe(false);
            expect(inv.removeItem(null)).toBe(true);
        });

        it('removeItemStack retire une quantité répartie sur plusieurs piles', () => {
            const inv = inventory(3);
            inv.addItem(item('gold', 100, 100));
            inv.addItem(item('gold', 100, 30));
            inv.removeItemStack('gold', 50);
            expect(inv.countItemStacks('gold')).toBe(80);
            inv.removeItemStack('gold', 80);
            expect(inv.countItemStacks('gold')).toBe(0);
            expect(inv.getAllObjects().length).toBe(0);
        });
    });

    describe('equipItem', () => {
        it('lève une erreur pour un emplacement inconnu', () => {
            expect(() => inventory(1).equipItem(item('a'), 'head')).toThrow(/invalid slot: head/);
        });

        it('defineEquipSlot ne réinitialise pas un emplacement existant', () => {
            const inv = inventory(1);
            inv.defineEquipSlot('weapon');
            const w = item('w');
            inv.oEquipSlots.weapon = w;
            inv.defineEquipSlot('weapon');
            expect(inv.oEquipSlots.weapon).toBe(w);
        });

        it('équipe un objet du sac et range l\'ancien à sa place', () => {
            const inv = inventory(2);
            inv.defineEquipSlot('weapon');
            const w1 = item('w1'), w2 = item('w2');
            inv.oEquipSlots.weapon = w1;
            inv.addItem(w2);
            expect(inv.equipItem(w2, 'weapon')).toBe(w1);
            expect(inv.oEquipSlots.weapon).toBe(w2);
            expect(inv.aBagSlots).toEqual([w1, null]);
        });

        it('déséquipe avec null', () => {
            const inv = inventory(1);
            inv.defineEquipSlot('weapon');
            const w = item('w');
            inv.oEquipSlots.weapon = w;
            expect(inv.equipItem(null, 'weapon')).toBe(w);
            expect(inv.oEquipSlots.weapon).toBe(null);
            expect(inv.aBagSlots).toEqual([w]);
        });

        it('ne déséquipe pas si le sac est plein', () => {
            const inv = inventory(1);
            inv.defineEquipSlot('weapon');
            const w = item('w');
            inv.oEquipSlots.weapon = w;
            inv.addItem(item('a'));
            inv.equipItem(null, 'weapon');
            expect(inv.oEquipSlots.weapon).toBe(w);
        });
    });
});
