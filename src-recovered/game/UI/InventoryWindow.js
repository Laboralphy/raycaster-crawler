import { Icon } from './Icon.js';
import { UI } from './UI.js';
import { Window } from './Window.js';
import { ICONS } from '../data/ICONS.js';
import { STRINGS } from '../data/STRINGS.js';
import { Box } from '../../libraries/H5UI/Box.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class InventoryWindow extends Window {
    // ordre du tri (commande inv_sort) ; lu par sortItems, appelée sans this par Array.sort
    static ITEM_ORDER = ['wand', 'dagger', 'ring', 'amulet', 'earings', 'potion', 'ccc', 'misc'];

    constructor(oParams) {
        super({
            caption: STRINGS._('~win_inventory')
        });
        this._sClass = 'UI.InventoryWindow';
        this.nWidth = 540;
        // rangs des boutons dans setCommands (les null n'en créent pas)
        this.BUTTON_DROP = 4;
        this.BUTTON_UNEQUIP = 5;
        this.nHeight = 320;
        this.aBoxes = null;
        this.aBoxesBag = null;
        this.aBoxesEqu = null;
        this.oTextItem = null;
        this.oTextBox = null;
        this.xSelect = 0;
        this.ySelect = 0;
        this.nSelect = 0;
        this.xBoxSize = 8;
        this.yBoxSize = 4;
        this.xBag = 128;
        this.yBag = 32;
        this.xEquip = 32;
        this.yEquip = 32;
        this.xText = 128;
        this.yText = 234;
        this.nIconSize = UI.INV_ICON_SIZE;
        this.oEquipSlotData = [{
            'slot': 'hand',
            'empty': ICONS.inv_hand
        }, {
            'slot': 'neck',
            'empty': ICONS.inv_necklace
        }, {
            'slot': 'finger',
            'empty': ICONS.inv_ring
        }, {
            'slot': 'ears',
            'empty': ICONS.inv_earings
        }];
        this.oInventory = oParams.inventory;
        this.buildWindowContent()
    }

    setIconStackCounter(oIcon, oItem) {
        oIcon.setStackCounter(oItem && oItem.isStackable() ? oItem.stackcount : 0)
    }

    refreshContent() {
        let oBox, xBox, yBox, nBox = 0,
            oItem;
        for (yBox = 0; yBox < this.yBoxSize; yBox++) {
            for (xBox = 0; xBox < this.xBoxSize; xBox++) {
                oBox = this.aBoxesBag.aBoxes[nBox];
                oItem = this.oInventory.aBagSlots[nBox];
                if (oItem) {
                    oBox._set('xStart', oItem.icon * oBox.getWidth())
                } else {
                    oBox._set('xStart', ICONS.inv_empty * oBox.getWidth())
                }
                this.setIconStackCounter(oBox, oItem);
                nBox++
            }
        }
        const aISlots = this.oEquipSlotData;
        const nISlotCount = aISlots.length;
        nBox = 0;
        for (let iSlot = 0; iSlot < nISlotCount; iSlot++) {
            oBox = this.aBoxesEqu.aBoxes[nBox];
            if (this.oInventory.oEquipSlots[aISlots[iSlot].slot]) {
                oBox._set('xStart', this.oInventory.oEquipSlots[aISlots[iSlot].slot].icon * oBox.getWidth())
            } else {
                oBox._set('xStart', aISlots[iSlot].empty * oBox.getWidth())
            }
            nBox++
        }
        this.selectXY(this.xSelect, this.ySelect)
    }

    sortItems(a, b) {
        if (a && b) {
            const io = InventoryWindow.ITEM_ORDER;
            const sa = io.indexOf(a.type);
            const sb = io.indexOf(b.type);
            if (sa == sb) {
                return a.resref > b.resref
            } else {
                return sa - sb
            }
        } else if (a) {
            return -1
        } else if (b) {
            return 1
        } else {
            return 0
        }
    }

    command(sCommand) {
        switch (sCommand) {
            case 'inv_close':
                this.close();
                break;
            case 'inv_use':
                this.getPlugin('Inventory').useItem();
                break;
            case 'inv_drop':
                this.getPlugin('Inventory').dropItem();
                break;
            case 'inv_unequip':
                this.getPlugin('Inventory').unequipItem();
                break;
            case 'inv_sort':
                this.oInventory.aBagSlots.sort(this.sortItems);
                this.refreshContent();
                break;
            case 'inv_look':
                this.getPlugin('Descriptor').displayDescriptionWindow(this.getSelectedItem());
                break
        }
    }

    clickIcon() {
        this.getParent().selectXY(this.__xSlot, this.__ySlot)
    }

    dblclickIcon() {
        const p = this.getParent();
        p.selectXY(this.__xSlot, this.__ySlot);
        p.command('inv_use')
    }

    buildWindowContent() {
        let oItem, oBox, xBox, yBox, nBox = 0;
        this.setSize(this.nWidth, this.nHeight);
        this.aBoxesBag = this.buildBoxes();
        this.aBoxesBag.xSize = this.xBoxSize;
        this.aBoxesBag.ySize = this.yBoxSize;
        this.aBoxesEqu = this.buildBoxes();
        this.aBoxesEqu.xSize = 1;
        this.aBoxesEqu.ySize = 4;
        for (yBox = 0; yBox < this.yBoxSize; yBox++) {
            for (xBox = 0; xBox < this.xBoxSize; xBox++) {
                oBox = this.linkControl(new Icon());
                oBox.setSize(this.nIconSize, this.nIconSize);
                oItem = this.oInventory.aBagSlots[nBox];
                if (oItem) {
                    oBox.xStart = this.oInventory.aBagSlots[nBox].icon * oBox.getWidth()
                } else {
                    oBox.xStart = ICONS.inv_empty * oBox.getWidth()
                }
                this.setIconStackCounter(oBox, oItem);
                oBox.moveTo((xBox * this.nIconSize) + this.xBag, (yBox * this.nIconSize) + this.yBag);
                oBox.setImage(UI.oIconsItems);
                oBox.selected(false);
                this.aBoxesBag.aBoxes.push(oBox);
                oBox.__xSlot = xBox;
                oBox.__ySlot = yBox;
                nBox++;
                oBox.onClick = this.clickIcon;
                oBox.onDblclick = this.dblclickIcon
            }
        }
        const aISlots = this.oEquipSlotData;
        const nISlotCount = aISlots.length;
        for (let iSlot = 0; iSlot < nISlotCount; iSlot++) {
            oBox = this.linkControl(new Icon());
            oBox.setSize(this.nIconSize, this.nIconSize);
            if (this.oInventory.oEquipSlots[aISlots[iSlot].slot]) {
                oBox.xStart = this.oInventory.oEquipSlots[aISlots[iSlot].slot].icon * oBox.getWidth()
            } else {
                oBox.xStart = aISlots[iSlot].empty * oBox.getWidth()
            }
            oBox.moveTo(this.xEquip, (iSlot * oBox.getHeight()) + this.yEquip);
            oBox.setImage(UI.oIconsItems);
            oBox.selected(false);
            oBox.__xSlot = -1;
            oBox.__ySlot = iSlot;
            oBox.onClick = this.clickIcon;
            this.aBoxesEqu.aBoxes.push(oBox)
        }
        this.aBoxes = this.aBoxesBag;
        const oTextBox = this.linkControl(new Box());
        oTextBox.setSize(this.nIconSize * this.xBoxSize, 24);
        oTextBox.setColor(UI.clDARK_WINDOW, UI.clDARK_WINDOW);
        oTextBox.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
        oTextBox.moveTo(this.xText, this.yText);
        const oText = oTextBox.linkControl(new Text());
        oText.setCaption('');
        oText.font.setColor(UI.clFONT);
        oText.font.setFont('monospace');
        oText.font.setSize(12);
        oText.moveTo(8, 6);
        this.oTextBox = oTextBox;
        this.oTextItem = oText;
        this.selectXY(0, 0);
        this.setCommands([
            ['~key_gen_close', 'inv_close', 4], null, ['~key_inv_use', 'inv_use', 1],
            ['~key_inv_look', 'inv_look', 1], null, ['~key_inv_sort', 'inv_sort', 1],
            ['~key_inv_drop', 'inv_drop', 6], ['~key_inv_unequip', 'inv_unequip', 6]
        ]);
        // « Retirer » prend la place de « Jeter » quand un objet porté est choisi
        this.getCommandButton(this.BUTTON_UNEQUIP).moveTo(this.getCommandButton(this.BUTTON_DROP)._x, this.getCommandButton(this.BUTTON_DROP)._y);
        this.updateCommands()
    }

    // Jeter : objet du sac ; Retirer : objet porté, sauf l'arme ; ni l'un ni l'autre sinon
    updateCommands() {
        const oDrop = this.getCommandButton(this.BUTTON_DROP);
        const oUnequip = this.getCommandButton(this.BUTTON_UNEQUIP);
        if (!oDrop || !oUnequip) {
            return
        }
        const bEquipped = this.getEquipIndex() >= 0;
        const oItem = this.getSelectedItem();
        if (bEquipped) {
            oDrop.hide();
            if (oItem && this.oEquipSlotData[this.nSelect].slot !== 'hand') {
                oUnequip.show()
            } else {
                oUnequip.hide()
            }
        } else {
            oUnequip.hide();
            oDrop.show()
        }
    }

    buildBoxes() {
        return {
            xSize: 0,
            ySize: 0,
            aBoxes: []
        }
    }

    getBagIndex() {
        if (this.aBoxes == this.aBoxesBag) {
            return this.nSelect
        } else {
            return -1
        }
    }

    getEquipIndex() {
        if (this.aBoxes == this.aBoxesEqu) {
            return this.nSelect
        } else {
            return -1
        }
    }

    selectXY(x, y) {
        this.aBoxes.aBoxes[this.nSelect].selected(false);
        if (x < 0) {
            this.aBoxes = this.aBoxesEqu;
            x = this.aBoxes.xSize + x
        } else {
            this.aBoxes = this.aBoxesBag
        }
        this.xSelect = x;
        this.ySelect = y;
        this.nSelect = this.ySelect * this.aBoxes.xSize + this.xSelect;
        const oItem = this.getSelectedItem();
        if (oItem) {
            this.oTextBox.setBorder(4, UI.clSELECT_BORDER, UI.clSELECT_BORDER);
            this.oTextItem.setCaption(oItem.name)
        } else {
            this.oTextBox.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
            this.oTextItem.setCaption('-')
        }
        this.aBoxes.aBoxes[this.nSelect].selected(true);
        this.updateCommands()
    }

    getSelectedItem() {
        let nIndex = this.getBagIndex();
        if (nIndex < 0) {
            nIndex -= this.getEquipIndex()
        }
        const oInv = this.oInventory;
        let oItem = null;
        if (nIndex >= 0) {
            oItem = oInv.aBagSlots[nIndex]
        } else {
            for (const iSlot in oInv.oEquipSlots) {
                nIndex++;
                if (nIndex === 0) {
                    oItem = oInv.oEquipSlots[iSlot]
                }
            }
        }
        return oItem
    }
}
