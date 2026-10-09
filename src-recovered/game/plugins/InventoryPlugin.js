import { InventoryWindow } from '../UI/InventoryWindow.js';
import { UI } from '../UI/UI.js';
import { STRINGS } from '../data/STRINGS.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';

export class InventoryPlugin {
    uiController(sCommand, xParams) {
        let n;
        let w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new InventoryWindow(xParams)));
                break;
            case 'get':
                w = this.getWidget();
                n = w.getBagIndex();
                if (n < 0) {
                    n -= w.getEquipIndex()
                }
                return n;
            case 'update':
                w = this.getWidget();
                return w.refreshContent()
        }
    }

    useItem() {
        let nIndex, oItem, oInv;
        const oPlayer = this.oGame.getPlayer();
        const oPlayerCreature = this.oGame.oDungeon.getPlayerCreature();
        nIndex = this.oGame.ui_command('get');
        if (nIndex >= 0) {
            oInv = this.oGame.oDungeon.getCreatureInventory(oPlayerCreature);
            oItem = oInv.aBagSlots[nIndex];
            if (oItem) {
                switch (oItem.type) {
                    case 'potion':
                    case 'scroll':
                    case 'ccc':
                        this.oGame.gc_useItem(oPlayer, oItem);
                        break;
                    case 'earings':
                    case 'amulet':
                    case 'ring':
                    case 'dagger':
                    case 'wand':
                        this.oGame.gc_equipItem(oPlayer, oItem);
                        break;
                    default:
                        break
                }
                this.oGame.ui_command('update')
            }
        }
    }

    dropItem() {
        let nIndex, oItem, oInv;
        const oPlayer = this.oGame.getPlayer();
        const oPlayerCreature = this.oGame.oDungeon.getPlayerCreature();
        nIndex = this.oGame.ui_command('get');
        if (nIndex >= 0) {
            oInv = this.oGame.oDungeon.getCreatureInventory(oPlayerCreature);
            oItem = oInv.aBagSlots[nIndex];
            if (oItem === null) {
                return
            }
            this.oGame.pause();
            if (confirm(STRINGS._('~m_confirmdropitem') + ':' + oItem.name)) {
                this.oGame.gc_dropItem(oPlayer, oItem);
                this.oGame.ui_command('update')
            }
            this.oGame.resume()
        }
    }

    key(nKey) {
        if (this.oGame.nIntfMode != UI.INTFMODE_INVENTORY && nKey != KEYS._INT_INVENTORY) {
            return false
        }
        const oPlayerCreature = this.oGame.oDungeon.getPlayerCreature();
        switch (nKey) {
            case KEYS._INT_INVENTORY:
                if (this.oGame.nIntfMode == UI.INTFMODE_NONE) {
                    this.oGame.ui_open('Inventory', {
                        inventory: this.oGame.oDungeon.getCreatureInventory(oPlayerCreature)
                    });
                    return true
                } else if (this.oGame.nIntfMode == UI.INTFMODE_INVENTORY) {
                    this.oGame.ui_close();
                    return true
                }
                break
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this)
    }
}
Object.assign(InventoryPlugin.prototype, {
    oGame: null
});
