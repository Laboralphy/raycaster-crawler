import { describe, it, expect, beforeAll, vi } from 'vitest';
import { StealerThinker } from '../../../../src/game/thinkers/StealerThinker.js';
import { Item } from '../../../../src/game/Item.js';
import { Inventory } from '../../../../src/game/GC/Inventory.js';
import { STRINGS } from '../../../../src/game/data/STRINGS.js';

beforeAll(() => STRINGS.setLanguage('en'));

// voleur (corbeau) et victime (joueur) avec un sac de 6 cases
function scene(aItems) {
    const oInv = new Inventory();
    oInv.setSize(6);
    aItems.forEach((i) => oInv.addItem(i));
    const oPlayer = { oExtraData: { inventory: oInv } };
    const oPlayerMobile = { getData: () => oPlayer };
    const t = new StealerThinker();
    t.oCreature = { oExtraData: { level: 3, inventory: new Inventory() } };
    t.oMobile = { oSprite: { oBlueprint: { sId: 'm_raven' } } };
    t.oGame = {
        oDungeon: { getPlayerCreature: () => oPlayer },
        sys_notify: vi.fn(),
        gc_equipItem: vi.fn()
    };
    return { t, oInv, oPlayerMobile };
}

// premier anneau des données (les amulettes sont aussi de type « ring »)
function ring() {
    return new Item('ring_power_2');
}

describe('StealerThinker.steal', () => {
    it('vole 10 à 25 % de l\'or, au moins une pièce', () => {
        const gold = new Item('gold', 200);
        const { t, oPlayerMobile } = scene([gold]);
        vi.spyOn(Math, 'random').mockReturnValue(0);
        t.steal(oPlayerMobile);
        expect(gold.stackcount).toBe(180);
        expect(t.oGame.sys_notify).toHaveBeenCalledWith('item_steal', ['~mob_m_raven', 'Gold', '20']);
    });

    it('prend au moins une pièce d\'une petite bourse', () => {
        const gold = new Item('gold', 3);
        const { t, oPlayerMobile } = scene([gold]);
        t.steal(oPlayerMobile);
        expect(gold.stackcount).toBe(2);
    });

    it('ne gâche pas sa tentative sur une catégorie absente', () => {
        const r = ring();
        const { t, oInv, oPlayerMobile } = scene([r]);
        // ce tirage visait l'or (misc) quand la catégorie était choisie à l'aveugle
        vi.spyOn(Math, 'random').mockReturnValue(0);
        t.steal(oPlayerMobile);
        expect(oInv.getItemBagSlot(r)).toBe(-1);
        expect(t.oGame.gc_equipItem).toHaveBeenCalledWith(t.oMobile, r);
    });

    it('ne vole qu\'une fois', () => {
        const gold = new Item('gold', 100);
        const { t, oPlayerMobile } = scene([gold]);
        t.steal(oPlayerMobile);
        const n = gold.stackcount;
        t.steal(oPlayerMobile);
        expect(gold.stackcount).toBe(n);
        expect(t.oGame.sys_notify).toHaveBeenCalledOnce();
    });

    it('ne prend rien dans un sac sans objet convoité', () => {
        const { t, oInv, oPlayerMobile } = scene([new Item('pot_heal_1')]);
        t.steal(oPlayerMobile);
        expect(oInv.getAllObjects().length).toBe(1);
        expect(t.oGame.sys_notify).not.toHaveBeenCalled();
    });

    it('préfère l\'or quand le sac contient de tout', () => {
        const aStolen = { misc: 0, ring: 0 };
        for (let i = 0; i < 300; i++) {
            const gold = new Item('gold', 100), r = ring();
            const { t, oInv, oPlayerMobile } = scene([gold, r]);
            t.steal(oPlayerMobile);
            if (gold.stackcount < 100) aStolen.misc++;
            if (oInv.getItemBagSlot(r) < 0) aStolen.ring++;
        }
        expect(aStolen.misc + aStolen.ring).toBe(300);
        // poids 7 contre 2 : environ 78 % d'or
        expect(aStolen.misc).toBeGreaterThan(190);
        expect(aStolen.ring).toBeGreaterThan(30);
    });
});

describe('message de vol', () => {
    it('nomme le voleur, l\'objet et la quantité', () => {
        STRINGS.setLanguage('en');
        expect(STRINGS._('~notify_item_steal', ['~mob_m_raven', 'Gold', '20'])).toBe('A raven stole Gold x 20 from you.');
        STRINGS.setLanguage('fr');
        expect(STRINGS._('~notify_item_steal', ['~mob_m_raven', 'Or', '20'])).toBe('Un corbeau vous a volé Or x 20.');
        STRINGS.setLanguage('en');
    });

    it('un voleur sans nom traduit est « A thief »', () => {
        const { t } = scene([]);
        t.oMobile.oSprite.oBlueprint.sId = 'm_unknown';
        expect(STRINGS._(t.getThiefName())).toBe('A thief');
    });

    it('un objet non empilable est volé à l\'unité', () => {
        const r = ring();
        const { t, oPlayerMobile } = scene([r]);
        t.steal(oPlayerMobile);
        expect(t.oGame.sys_notify).toHaveBeenCalledWith('item_steal', ['~mob_m_raven', r.name, '1']);
    });
});

describe('StealerThinker._follow', () => {
    it('se réoriente vers sa cible à chaque réaction', () => {
        const t = new StealerThinker();
        const oTarget = {};
        t.getTarget = () => oTarget;
        t.chaseTarget = vi.fn();
        t.move = () => t.COLLISION_NONE;
        t._follow(0);
        expect(t.chaseTarget).toHaveBeenCalledWith(oTarget);
    });
});
