O2.createObject('UI.InventoryWindow', class InventoryWindow extends UI.Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_inventory')
        });
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
        var oBox, xBox, yBox, nBox = 0,
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
        var aISlots = this.oEquipSlotData;
        var nISlotCount = aISlots.length;
        nBox = 0;
        for (var iSlot = 0; iSlot < nISlotCount; iSlot++) {
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
            var io = UI.InventoryWindow.prototype.aItemOrder;
            var sa = io.indexOf(a.type);
            var sb = io.indexOf(b.type);
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
        var p = this.getParent();
        p.selectXY(this.__xSlot, this.__ySlot);
        p.command('inv_use')
    }

    buildWindowContent() {
        var oItem, oBox, xBox, yBox, nBox = 0;
        this.setSize(this.nWidth, this.nHeight);
        this.aBoxesBag = this.buildBoxes();
        this.aBoxesBag.xSize = this.xBoxSize;
        this.aBoxesBag.ySize = this.yBoxSize;
        this.aBoxesEqu = this.buildBoxes();
        this.aBoxesEqu.xSize = 1;
        this.aBoxesEqu.ySize = 4;
        for (yBox = 0; yBox < this.yBoxSize; yBox++) {
            for (xBox = 0; xBox < this.xBoxSize; xBox++) {
                oBox = this.linkControl(new UI.Icon());
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
        var aISlots = this.oEquipSlotData;
        var nISlotCount = aISlots.length;
        for (var iSlot = 0; iSlot < nISlotCount; iSlot++) {
            oBox = this.linkControl(new UI.Icon());
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
        var oTextBox = this.linkControl(new H5UI.Box());
        oTextBox.setSize(this.nIconSize * this.xBoxSize, 24);
        oTextBox.setColor(UI.clDARK_WINDOW, UI.clDARK_WINDOW);
        oTextBox.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
        oTextBox.moveTo(this.xText, this.yText);
        var oText = oTextBox.linkControl(new H5UI.Text());
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
            ['~key_inv_drop', 'inv_drop', 6]
        ])
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
        var oItem = this.getSelectedItem();
        if (oItem) {
            this.oTextBox.setBorder(4, UI.clSELECT_BORDER, UI.clSELECT_BORDER);
            this.oTextItem.setCaption(oItem.name)
        } else {
            this.oTextBox.setBorder(1, UI.clWINDOW_BORDER, UI.clWINDOW_BORDER);
            this.oTextItem.setCaption('-')
        }
        this.aBoxes.aBoxes[this.nSelect].selected(true)
    }

    getSelectedItem() {
        var nIndex = this.getBagIndex();
        if (nIndex < 0) {
            nIndex -= this.getEquipIndex()
        }
        var oInv = this.oInventory;
        var oItem = null;
        if (nIndex >= 0) {
            oItem = oInv.aBagSlots[nIndex]
        } else {
            for (var iSlot in oInv.oEquipSlots) {
                nIndex++;
                if (nIndex === 0) {
                    oItem = oInv.oEquipSlots[iSlot]
                }
            }
        }
        return oItem
    }
});
Object.assign(UI.InventoryWindow.prototype, {
    _sClass: 'UI.InventoryWindow',
    nWidth: 540,
    nHeight: 320,
    oInventory: null,
    aBoxes: null,
    aBoxesBag: null,
    aBoxesEqu: null,
    oTextItem: null,
    oTextBox: null,
    xSelect: 0,
    ySelect: 0,
    nSelect: 0,
    xBoxSize: 8,
    yBoxSize: 4,
    xBag: 128,
    yBag: 32,
    xEquip: 32,
    yEquip: 32,
    xText: 128,
    yText: 234,
    nIconSize: UI.INV_ICON_SIZE,
    oEquipSlotData: null,
    aItemOrder: ['wand', 'dagger', 'ring', 'amulet', 'earings', 'potion', 'ccc', 'misc']
});
