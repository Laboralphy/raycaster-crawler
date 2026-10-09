import { Item } from '../Item.js';
import { ShopWindow } from '../UI/ShopWindow.js';
import { UI } from '../UI/UI.js';
import { LABY } from '../data/LABY.js';
import { STRINGS } from '../data/STRINGS.js';
import { WORLD_DATA } from '../data/WORLD_DATA.js';
import { Marker } from '../../libraries/O876/Marker.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';

export class ShopPlugin {
    uiController(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new ShopWindow(xParams)));
                break;
            case 'get':
                return this.getWidget().getSelectedOption();
            case 'disp':
                this.getWidget().displayMessage(xParams)
        }
    }

    checkShopItem(aItem) {
        if (aItem.length < 3) {
            aItem.push(false)
        }
        if (aItem.length < 4) {
            aItem.push(0)
        }
    }

    generateShop(aShop) {
        let i, aItem;
        const nShopItemCount = aShop.length;
        for (i = 0; i < nShopItemCount; i++) {
            aItem = aShop[i];
            this.checkShopItem(aItem);
            if (aItem[3]) {
                aItem[2] = (this.oGame.nTimeMs - aItem[3]) < 11000
            }
        }
        return aShop
    }

    closeShop() {
        const aShop = this.aShop;
        let i, aItem;
        const nShopItemCount = aShop.length;
        for (i = 0; i < nShopItemCount; i++) {
            aItem = aShop[i];
            this.checkShopItem(aItem);
            if (aItem[2]) {
                aItem[3] = this.oGame.nTimeMs
            }
        }
    }

    openShop(aShop) {
        this.aShop = aShop;
        this.oGame.ui_open('Shop', {
            gold: this.oGame.oDungeon.getCreatureInventory(this.oGame.oDungeon.getPlayerCreature()).countItemStacks('gold'),
            items: this.generateShop(aShop),
            image: this.oGame.oRaycaster.oHorde.oTiles.i_icons.oImage
        })
    }

    getShop(xBlock, yBlock) {
        const sArea = this.oGame.oDungeon.getPlayerLocationArea();
        const nFloor = this.oGame.oDungeon.getPlayerLocationFloor();
        if (nFloor != this.nCurrentFloor || sArea != this.sCurrentArea) {
            this.oShopRegistry = null
        }
        if (!this.oShopRegistry) {
            this.oShopRegistry = Marker.create();
            const d = this.oGame.oDungeon;
            const w = d.getArea().length;
            let x, y, iShop = 0;
            for (y = 0; y < w; y++) {
                for (x = 0; x < w; x++) {
                    if (d.getAreaBlockProperty(x, y) === LABY.BLOCK_SHOP) {
                        Marker.markXY(this.oShopRegistry, x, y, iShop++)
                    }
                }
            }
        }
        const aShops = WORLD_DATA.dungeons[sArea][nFloor].shops;
        if (aShops.length) {
            return aShops[Marker.getMarkXY(this.oShopRegistry, xBlock, yBlock) % aShops.length]
        } else {
            return null
        }
    }

    openShopHere(x, y) {
        this.openShop(this.getShop(x, y))
    }

    block(nBlock, oMobile, x, y) {
        if (oMobile == this.oGame.getPlayer()) {
            switch (nBlock) {
                case LABY.BLOCK_SHOP:
                    this.openShopHere(x, y);
                    return true
            }
        }
        return false
    }

    key(nKey) {
        if (this.oGame.nIntfMode == UI.INTFMODE_SHOP && nKey == KEYS.ALPHANUM.O) {
            this.closeShop();
            this.oGame.ui_close();
            return true
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this);
        this.oGame.registerPluginSignal('block', this)
    }

    buy(sItem, nPrice) {
        const oInv = this.oGame.oDungeon.getCreatureInventory(this.oGame.oDungeon.getPlayerCreature());
        if (!oInv.isFull()) {
            if (oInv.countItemStacks('gold') >= nPrice) {
                oInv.removeItemStack('gold', nPrice);
                oInv.addItem(new Item(sItem));
                return true
            } else {
                this.oGame.ui_command('disp', STRINGS._('~m_shop_nogold'))
            }
        } else {
            this.oGame.ui_command('disp', STRINGS._('~notify_inventory_full'))
        }
        return false
    }
}
Object.assign(ShopPlugin.prototype, {
    oGame: null,
    oEffectProcessor: null,
    nPreviousMode: 0,
    aShop: null,
    sCurrentArea: '',
    nCurrentFloor: -1,
    oShopRegistry: null
});
