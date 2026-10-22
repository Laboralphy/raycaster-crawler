import { BookWindow } from '../UI/BookWindow.js';
import { UI } from '../UI/UI.js';
import { BOOKS } from '../data/BOOKS.js';
import { CRAFT_DATA } from '../data/CRAFT_DATA.js';
import { LABY } from '../data/LABY.js';
import { MAGIC_DATA } from '../data/MAGIC_DATA.js';
import { STRINGS } from '../data/STRINGS.js';

// contenu des bibliothèques : catégorie tirée selon ces poids (total 100)
const SHELF_WEIGHTS = [
    ['recipe', 15],
    ['spell', 10],
    ['book', 35],
    ['junk', 40]
];

// livres lus par script (intro, F11) : jamais trouvés dans une bibliothèque
const SHELF_EXCLUDED_BOOKS = ['book_of_the_story', 'book_of_spells'];

export class BookPlugin {
    oGame = null;

    uiController(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new BookWindow(xParams)));
                break;
            case 'next':
                return this.getWidget().nextPage();
            case 'prev':
                return this.getWidget().previousPage()
        }
    }

    block(nBlock, oMobile, x, y) {
        if (oMobile == this.oGame.getPlayer()) {
            switch (nBlock) {
                case LABY.BLOCK_LIBRARY_BOOK:
                case LABY.BLOCK_LIVING_BOOK:
                    this.readShelf(x, y);
                    this.markShelfRead(x, y);
                    return true;
                case LABY.BLOCK_LIBRARY_BOOK_READ:
                    this.readShelf(x, y);
                    return true
            }
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('block', this)
    }

    /**
     * La bibliothèque consultée devient un bloc de rayonnages en désordre
     * (BLOCK_LIBRARY_BOOK_READ, tuile 60), qu'on peut encore consulter. Le
     * changement est noté dans la carte de l'étage, donc sauvegardé.
     */
    markShelfRead(x, y) {
        const rc = this.oGame.oRaycaster;
        const nCode = rc.aWorld.walls.metacodes[LABY.BLOCK_LIBRARY_BOOK_READ];
        if (nCode === undefined) {
            return
        }
        this.oGame.oDungeon.setAreaBlockProperty(x, y, LABY.BLOCK_LIBRARY_BOOK_READ);
        rc.setMapXY(x, y, nCode)
    }

    read(sBook, aParams) {
        const oBook = STRINGS._(sBook, aParams);
        if (('images' in oBook) && oBook.images !== null) {
            for (let iBook = 0; iBook < oBook.images.length; iBook++) {
                if (typeof oBook.images[iBook] === 'string') {
                    oBook.images[iBook] = this.oGame.oRaycaster.oImages.load(oBook.images[iBook])
                }
            }
        }
        if (this.oGame.nIntfMode == UI.INTFMODE_NONE) {
            this.oGame.ui_open('Book', oBook)
        }
    }

    // FNV-1a 32 bits : même bibliothèque (niveau + coordonnées) => même valeur
    shelfHash(sKey, sSalt) {
        const s = sKey + '-' + sSalt;
        let h = 0x811C9DC5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193)
        }
        return h >>> 0
    }

    shelfKey(x, y) {
        const d = this.oGame.oDungeon;
        return d.getPlayerLocationArea() + '-' + d.getPlayerLocationFloor() + '-' + x + '-' + y
    }

    shelfCategory(sKey) {
        let n = this.shelfHash(sKey, 'cat') % 100;
        for (let i = 0; i < SHELF_WEIGHTS.length; i++) {
            if (n < SHELF_WEIGHTS[i][1]) {
                return SHELF_WEIGHTS[i][0]
            }
            n -= SHELF_WEIGHTS[i][1]
        }
        return 'junk'
    }

    shelfPick(sKey, aList) {
        return aList[this.shelfHash(sKey, 'pick') % aList.length]
    }

    // entrées inconnues de plus bas niveau ; triées pour rester déterministe
    lowestLevelUnknown(oData, aKnown, fFilter) {
        let nMin = Infinity;
        let aList = [];
        Object.keys(oData).sort().forEach(function(s) {
            const o = oData[s];
            if (aKnown.indexOf(s) >= 0 || (fFilter && !fFilter(o))) {
                return
            }
            if (o.level < nMin) {
                nMin = o.level;
                aList = [s]
            } else if (o.level === nMin) {
                aList.push(s)
            }
        });
        return aList
    }

    // listes de livres tirées des données anglaises : indépendantes de la langue
    getShelfTexts(sPrefix) {
        return Object.keys(BOOKS.en).filter(function(s) {
            return s.substr(0, sPrefix.length) === sPrefix && SHELF_EXCLUDED_BOOKS.indexOf(s) < 0
        }).sort()
    }

    // lit la bibliothèque en (x, y) ; sCategory force la catégorie (étagères d'alchimie)
    readShelf(x, y, sCategory) {
        const oCreature = this.oGame.oDungeon.getPlayerCreature();
        const oData = oCreature.oExtraData;
        const sKey = this.shelfKey(x, y);
        if (oData.shelves[sKey]) {
            this.oGame.sys_notify('shelf_studied');
            return
        }
        sCategory = sCategory || this.shelfCategory(sKey);
        let aList;
        switch (sCategory) {
            case 'recipe':
                aList = this.lowestLevelUnknown(CRAFT_DATA, oData.craft, function(o) {
                    return o.type === 'brew'
                });
                if (aList.length) {
                    const sRec = this.shelfPick(sKey, aList);
                    this.oGame.oDungeon.learnCraft(oCreature, sRec);
                    oData.shelves[sKey] = true;
                    this.read('~craft_brew_recipe', ['~item_' + sRec]);
                    return
                }
                break;
            case 'spell':
                aList = this.lowestLevelUnknown(MAGIC_DATA, oData.magic.book);
                if (aList.length) {
                    const sSpell = this.shelfPick(sKey, aList);
                    oData.magic.book.push(sSpell);
                    oData.shelves[sKey] = true;
                    this.oGame.oMagicSystem.invalidateDisplay();
                    this.read('~spell_learned', ['~spell_' + sSpell, '~spell_desc_' + sSpell, 'F' + oData.magic.book.length]);
                    return
                }
                break;
            case 'junk':
                this.read('~' + this.shelfPick(sKey, this.getShelfTexts('shelf_junk_')));
                return
        }
        // livre ordinaire, ou repli quand tout est déjà connu
        this.read('~' + this.shelfPick(sKey, this.getShelfTexts('book_')))
    }
}
