O2.createObject('GC.Inventory', class Inventory {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oEquipSlots = {};
        this.aBagSlots = []
    }

    getAllObjects() {
        var oInvExport = [];
        var i = '';
        for (i in this.oEquipSlots) {
            if (this.oEquipSlots[i]) {
                oInvExport.push(this.oEquipSlots[i])
            }
        }
        for (i = 0; i < this.aBagSlots.length; i++) {
            if (this.aBagSlots[i]) {
                oInvExport.push(this.aBagSlots[i])
            }
        }
        return oInvExport
    }

    defineEquipSlot(sSlot) {
        if (!(sSlot in this.oEquipSlots)) {
            this.oEquipSlots[sSlot] = null
        }
    }

    setSize(nSize) {
        var i, nPrevSize = this.getSize();
        if (nSize >= nPrevSize) {
            for (i = nPrevSize; i < nSize; i++) {
                this.aBagSlots.push(null)
            }
            return true
        } else {
            for (i = nSize; i < nPrevSize; i++) {
                if (this.aBagSlots[i] !== null) {
                    return false
                }
            }
            for (i = nSize; i < nPrevSize; i++) {
                this.aBagSlots.pop()
            }
        }
        return true
    }

    getSize() {
        return this.aBagSlots.length
    }

    getFreeBagSlot() {
        var nSize = this.getSize();
        for (var i = 0; i < nSize; i++) {
            if (this.aBagSlots[i] === null) {
                return i
            }
        }
        return -1
    }

    addItem(oItem) {
        if (oItem === null) {
            return true
        }
        if (oItem.isStackable()) {
            return this.addStackableItem(oItem)
        }
        var nSlot = this.getFreeBagSlot();
        if (nSlot < 0) {
            return false
        }
        this.aBagSlots[nSlot] = oItem;
        return true
    }

    addStackableItem(oStackableItem) {
        var oItem;
        var nSlot;
        var nAdded;
        oItem = this.findItem(oStackableItem.resref);
        while (oItem) {
            if (!oItem.isStackFull()) {
                nAdded = oItem.stackInc(oStackableItem.stackcount);
                oStackableItem.stackDec(nAdded);
                if (oStackableItem.stackcount === 0) {
                    return true
                }
            }
            oItem = this.findNextItem()
        }
        nSlot = this.getFreeBagSlot();
        if (nSlot < 0) {
            return false
        } else {
            this.aBagSlots[nSlot] = oStackableItem;
            return true
        }
    }

    findItem(sResRef) {
        this.nFindIndex = 0;
        this.sFindResRef = sResRef;
        return this.findNextItem()
    }

    findNextItem() {
        var sResRef = this.sFindResRef;
        var nSize = this.getSize();
        var oItem = null;
        for (var i = this.nFindIndex; i < nSize; i++) {
            oItem = this.aBagSlots[i];
            if (oItem && oItem.resref == sResRef) {
                this.nFindIndex = i + 1;
                return oItem
            }
        }
        return null
    }

    isFull() {
        return this.getFreeBagSlot() < 0
    }

    getItemBagSlot(oItem) {
        return this.aBagSlots.indexOf(oItem)
    }

    removeItem(oItem, nCount) {
        if (oItem === null) {
            return true
        }
        var nSlot = this.getItemBagSlot(oItem);
        if (nSlot >= 0) {
            if (oItem.isStackable()) {
                if (nCount === undefined) {
                    nCount = oItem.stackcount
                }
                oItem.stackDec(nCount);
                if (oItem.stackcount > 0) {
                    return true
                }
            }
            this.aBagSlots[nSlot] = null;
            return true
        } else {
            return false
        }
    }

    countItemStacks(sResRef) {
        var nSum = 0;
        var oItem = this.findItem(sResRef);
        while (oItem) {
            nSum += oItem.stackcount;
            oItem = this.findNextItem()
        }
        return nSum
    }

    findAllItems(sResRef) {
        var oItem = this.findItem(sResRef);
        var aItems = [];
        while (oItem) {
            aItems.push(oItem);
            oItem = this.findNextItem()
        }
        aItems.sort(function(a, b) {
            return a.stakcount - b.stackcount
        });
        return aItems
    }

    removeItemStack(sResRef, nCount) {
        var nStackCount, oItem, aItems = this.findAllItems(sResRef);
        while (aItems.length > 0 && nCount > 0) {
            oItem = aItems.pop();
            nStackCount = oItem.stackcount;
            if (nCount <= nStackCount) {
                this.removeItem(oItem, nCount);
                return
            } else {
                this.removeItem(oItem, nStackCount);
                nCount -= nStackCount
            }
        }
    }

    equipItem(oItem, sSlot) {
        if (!(sSlot in this.oEquipSlots)) {
            throw new Error('inventory equipItem invalid slot: ' + sSlot)
        }
        var oPrevItem = this.oEquipSlots[sSlot];
        this.oEquipSlots[sSlot] = oItem;
        if (this.removeItem(oItem)) {
            if (this.addItem(oPrevItem)) {
                return oPrevItem
            } else {
                if (oItem) {
                    throw new Error('inventory equipItem panic - already removed bag item, but cannot store previously equiped item : item lost')
                } else {
                    this.oEquipSlots[sSlot] = oPrevItem;
                    return oPrevItem
                }
            }
        }
        return null
    }
});
Object.assign(GC.Inventory.prototype, {
    aBagSlots: null,
    oEquipSlots: null,
    nFindIndex: 0,
    sFindResRef: ''
});
