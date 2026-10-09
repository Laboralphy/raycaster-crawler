export class Horde {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aItems = []
    }

    link(oItem) {
        const nKey = this.aItems.length;
        this.aItems.push(oItem);
        return nKey
    }

    indexOf(oItem) {
        return this.aItems.indexOf(oItem)
    }

    getItem(nKey) {
        if (nKey < this.aItems.length) {
            return this.aItems[nKey]
        } else {
            return null
        }
    }

    getItems() {
        return this.aItems
    }

    count() {
        return this.aItems.length
    }

    unlink(xKey) {
        let nKey;
        if (typeof xKey == 'object') {
            nKey = this.indexOf(xKey)
        } else {
            nKey = xKey
        }
        if (nKey < 0 || nKey >= this.aItems.length) {
            return
        }
        if (nKey == this.aItems.length - 1) {
            this.aItems.pop()
        } else {
            this.aItems[nKey] = this.aItems.pop()
        }
    }

    clear() {
        this.aItems = []
    }
}
Object.assign(Horde.prototype, {
    aItems: null
});
