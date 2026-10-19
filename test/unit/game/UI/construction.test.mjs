// Filet de sécurité de la famille WinControl : chaque classe est construite
// (les fenêtres avec des paramètres comme ceux du jeu), puis rendue une fois.
// L'instantané garde, pour chaque contrôle et ses enfants, les champs lus
// (propres ou hérités du prototype) et les appels de dessin de son canvas.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas } from '../../canvas.mjs';

function stubBrowser() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
    vi.stubGlobal('window', {});
    vi.stubGlobal('location', { search: '' });
}
stubBrowser();

const { STRINGS } = await import('../../../../src-recovered/game/data/STRINGS.js');
const { H5UI } = await import('../../../../src-recovered/libraries/H5UI/H5UI.js');
const { WinControl } = await import('../../../../src-recovered/libraries/H5UI/WinControl.js');
const { Box } = await import('../../../../src-recovered/libraries/H5UI/Box.js');
const { Button } = await import('../../../../src-recovered/libraries/H5UI/Button.js');
const { Image } = await import('../../../../src-recovered/libraries/H5UI/Image.js');
const { ScrollBox } = await import('../../../../src-recovered/libraries/H5UI/ScrollBox.js');
const { Text } = await import('../../../../src-recovered/libraries/H5UI/Text.js');
const { TileGrid } = await import('../../../../src-recovered/libraries/H5UI/TileGrid.js');
const { Icon } = await import('../../../../src-recovered/game/UI/Icon.js');
const { ProgressBar } = await import('../../../../src-recovered/game/UI/ProgressBar.js');
const { Screen } = await import('../../../../src-recovered/game/UI/Screen.js');
const { Window } = await import('../../../../src-recovered/game/UI/Window.js');
const { BookWindow } = await import('../../../../src-recovered/game/UI/BookWindow.js');
const { ConsoleWindow } = await import('../../../../src-recovered/game/UI/ConsoleWindow.js');
const { CraftWindow } = await import('../../../../src-recovered/game/UI/CraftWindow.js');
const { DescriptorWindow } = await import('../../../../src-recovered/game/UI/DescriptorWindow.js');
const { DialogWindow } = await import('../../../../src-recovered/game/UI/DialogWindow.js');
const { InventoryWindow } = await import('../../../../src-recovered/game/UI/InventoryWindow.js');
const { LoadingWindow } = await import('../../../../src-recovered/game/UI/LoadingWindow.js');
const { MainMenuWindow } = await import('../../../../src-recovered/game/UI/MainMenuWindow.js');
const { PlayersheetWindow } = await import('../../../../src-recovered/game/UI/PlayersheetWindow.js');
const { ShopWindow } = await import('../../../../src-recovered/game/UI/ShopWindow.js');
const { StubWindow } = await import('../../../../src-recovered/game/UI/StubWindow.js');
const { Item } = await import('../../../../src-recovered/game/Item.js');
const { Inventory } = await import('../../../../src-recovered/game/GC/Inventory.js');
const { Creature } = await import('../../../../src-recovered/game/GC/Creature.js');

STRINGS.setLanguage('en');

// image déjà chargée (planche d'icônes, image de livre)
function picture(sName) {
    return { sName, complete: true, width: 96, height: 64, addEventListener: vi.fn() };
}

function inventory() {
    const oInv = new Inventory();
    oInv.setSize(32);
    ['hand', 'neck', 'finger', 'ears'].forEach((s) => oInv.defineEquipSlot(s));
    const oWand = new Item('wand_fyre_2');
    oInv.addItem(oWand);
    oInv.equipItem(oWand, 'hand');
    oInv.addItem(new Item('gold', 120));
    oInv.addItem(new Item('pot_heal_1', 3));
    oInv.addItem(new Item('ring_power_2'));
    return oInv;
}

function creature() {
    const c = new Creature();
    Object.entries({ vitality: 100, energy: 40, power: 2, speed: 100, drfire: 3, luck: 1 })
        .forEach(([s, n]) => c.setBaseAttribute(s, n));
    c.modifyAttribute('power', 1);
    c.modifyAttribute('drfire', -1);
    return c;
}

const CLASSES = {
    WinControl: () => new WinControl(),
    Box: () => new Box(),
    Button: () => new Button(),
    Image: () => new Image(),
    ScrollBox: () => new ScrollBox(),
    Text: () => {
        const t = new Text();
        t.setCaption('Hello');
        return t;
    },
    TileGrid: () => {
        const g = new TileGrid();
        g.setGridSize(3, 2, 1);
        g.setCell(1, 1, 5);
        return g;
    },
    Icon: () => {
        const i = new Icon();
        i.setSize(48, 48);
        i.setImage(picture('icons'));
        i.setStackCounter(7);
        return i;
    },
    ProgressBar: () => {
        const p = new ProgressBar({});
        p.setSize(200, 24);
        p.setMax(10);
        p.setProgress(4);
        return p;
    },
    Screen: () => {
        const s = new Screen();
        s.setSize(320, 200);
        return s;
    },
    Window: () => new Window({ caption: '~win_dialog' }),
    BookWindow: () => new BookWindow({
        game: null, title: 'A book', pages: ['Page one', 'Page two'], images: [picture('book')]
    }),
    ConsoleWindow: () => new ConsoleWindow({ lines: 'line 1\nline 2' }),
    CraftWindow: () => new CraftWindow({
        title: 'Brewing potion',
        message: 'What will you brew ?',
        recipes: [
            [new Item('pot_heal_1'), new Item('ccc_h2o'), new Item('ccc_herb1')],
            [new Item('pot_heal_2'), new Item('ccc_h2o'), new Item('ccc_herb1', 2)]
        ],
        able: ['pot_heal_1'],
        image: picture('icons')
    }),
    DescriptorWindow: () => new DescriptorWindow({ title: 'Gold', message: 'Shiny coins', icon: 3, image: picture('icons') }),
    DialogWindow: () => new DialogWindow({ message: 'Hello there', buttons: [['~key_gen_close', 'dlg_close', 4]] }),
    InventoryWindow: () => new InventoryWindow({ inventory: inventory(), image: picture('icons') }),
    LoadingWindow: () => new LoadingWindow({}),
    MainMenuWindow: () => new MainMenuWindow({ options: ['~menu_new', '~menu_load', '~menu_options'] }),
    PlayersheetWindow: () => new PlayersheetWindow({ creature: creature() }),
    ShopWindow: () => new ShopWindow({
        gold: 250,
        items: [['pot_heal_1', 20, false], ['ring_power_2', 300, true]],
        image: picture('icons')
    }),
    StubWindow: () => new StubWindow({})
};

// valeur lisible et stable d'un champ
function value(x, aSeen) {
    if (x === null || x === undefined || typeof x !== 'object' && typeof x !== 'function') {
        return x;
    }
    if (typeof x === 'function') {
        return '[Function ' + (x.name || 'anonymous') + ']';
    }
    if (x instanceof WinControl) {
        const n = aSeen.indexOf(x);
        return '<' + x.constructor.name + (n >= 0 ? ' #' + n : '') + '>';
    }
    if ('getContext' in x) {
        return '[canvas ' + x.width + 'x' + x.height + ']';
    }
    if ('canvas' in x && 'fillRect' in x) {
        return '[context]';
    }
    if ('sName' in x && 'complete' in x) {
        return '[picture ' + x.sName + ']';
    }
    if (Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype) {
        try {
            return JSON.parse(JSON.stringify(x));
        } catch (e) {
            return '[cyclic ' + (Array.isArray(x) ? 'Array' : 'Object') + ']';
        }
    }
    return '[' + x.constructor.name + ']';
}

// appels de dessin du canvas d'un contrôle
function drawing(o) {
    const ctx = o._oCanvas && o._oCanvas.getContext ? o._oCanvas.getContext('2d') : null;
    if (!ctx) {
        return [];
    }
    const a = [];
    for (const k in ctx) {
        if (ctx[k] && ctx[k].mock) {
            ctx[k].mock.calls.forEach((aArgs, i) => a.push([ctx[k].mock.invocationCallOrder[i], k + '(' + aArgs.map((v) => JSON.stringify(value(v, []))).join(', ') + ')']));
        }
    }
    return a.sort((x, y) => x[0] - y[0]).map((x) => x[1]).concat(['fillStyle ' + ctx.fillStyle, 'strokeStyle ' + ctx.strokeStyle, 'font ' + ctx.font]);
}

// arbre des contrôles : champs, dessin, enfants
function tree(o, aSeen = []) {
    aSeen.push(o);
    const oFields = {};
    const aKeys = [];
    for (const k in o) {
        aKeys.push(k);
    }
    aKeys.sort().forEach((k) => {
        if (k !== '_nHandle' && k !== '_aControls') {
            oFields[k] = value(o[k], aSeen);
        }
    });
    return {
        class: o.constructor.name,
        fields: oFields,
        drawing: drawing(o),
        children: (o._aControls || []).map((c) => tree(c, aSeen))
    };
}

beforeEach(() => {
    stubBrowser();
    // pas de canvas recyclé d'un test à l'autre : chaque contrôle a le sien, vierge
    H5UI.canvasDispenser.length = 0;
});

describe('famille WinControl : construction et premier rendu', () => {
    it.each(Object.keys(CLASSES))('%s', (sClass) => {
        const o = CLASSES[sClass]();
        o.render();
        expect(tree(o)).toMatchSnapshot();
    });
});

describe('WinControl', () => {
    it('_set ne crée pas de propriété inconnue, et invalide sur changement', () => {
        const o = new WinControl();
        o.render();
        o._set('_inconnu', 1);
        expect('_inconnu' in o).toBe(false);
        o._set('_x', 0);
        expect(o._bInvalid).toBe(false);
        o._set('_x', 5);
        expect(o._x).toBe(5);
        expect(o._bInvalid).toBe(true);
    });

    it('un contrôle détruit ne plante pas quand on le relit', () => {
        const p = new Box();
        const c = p.linkControl(new Box());
        c.linkControl(new Text());
        p.unlinkControl(0);
        expect(p.getControlCount()).toBe(0);
        expect(c.getControlCount()).toBe(0);
        expect(c.hasControls()).toBeFalsy();
        expect(c._nHandle).toBeFalsy();
    });

    it('deux contrôles ne partagent pas leurs listes', () => {
        const a = new Box(), b = new Box();
        ['_aControls', '_aInvalidControls', '_aAlignedControls', '_aHideControls'].forEach((k) => {
            expect(a[k], k).not.toBe(b[k]);
        });
    });
});

describe('InventoryWindow', () => {
    it('inv_sort range le sac par type, puis par nom, cases vides à la fin', () => {
        const w = CLASSES.InventoryWindow();
        const oInv = w.oInventory;
        oInv.aBagSlots[10] = new Item('wand_fyre_2');
        w.command('inv_sort');
        const aTypes = oInv.aBagSlots.filter((o) => o).map((o) => o.type + ' ' + o.resref);
        expect(aTypes).toEqual(['wand wand_fyre_2', 'ring ring_power_2', 'potion pot_heal_1', 'misc gold']);
        expect(oInv.aBagSlots.slice(4).every((o) => o === null)).toBe(true);
    });
});

describe('InventoryWindow : Jeter ou Retirer', () => {
    const shown = (w) => ['inv_drop', 'inv_unequip'].filter((s, i) => w.getCommandButton(4 + i)._bVisible);

    it('Jeter pour le sac, Retirer pour un objet porté, rien pour l\'arme', () => {
        const w = CLASSES.InventoryWindow();
        const oRing = w.oInventory.aBagSlots.find((o) => o && o.resref === 'ring_power_2');
        w.oInventory.equipItem(oRing, 'finger');
        w.refreshContent();
        const [oDrop, oUnequip] = [w.getCommandButton(4), w.getCommandButton(5)];
        expect([oUnequip._x, oUnequip._y]).toEqual([oDrop._x, oDrop._y]);
        expect(oUnequip.getCaption()).toBe('Unequip');
        w.selectXY(0, 0);
        expect(shown(w)).toEqual(['inv_drop']);
        w.selectXY(-1, 2);
        expect(w.getSelectedItem()).toBe(oRing);
        expect(shown(w)).toEqual(['inv_unequip']);
        w.selectXY(-1, 0);
        expect(w.getSelectedItem().slot).toBe('hand');
        expect(shown(w)).toEqual([]);
        w.selectXY(-1, 1);
        expect(shown(w)).toEqual([]);
        w.selectXY(3, 1);
        expect(shown(w)).toEqual(['inv_drop']);
    });
});

