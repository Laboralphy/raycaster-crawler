export class Legion {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aItems = [];
        this.aRecycler = []
    }

    link(oItem) {
        let nKey;
        if (this.aRecycler.length) {
            nKey = this.aRecycler.shift();
            this.aItems[nKey] = oItem
        } else {
            nKey = this.aItems.length;
            this.aItems.push(oItem)
        }
        return nKey
    }

    indexOf(oItem) {
        return this.aItems.index(oItem)
    }

    getItem(nKey) {
        if (nKey < this.aItems.length) {
            return this.aItems[nKey]
        } else {
            return null
        }
    }

    unlink(xKey) {
        let nKey;
        if (typeof xKey == 'object') {
            nKey = this.indexOf(xKey)
        } else {
            nKey = xKey
        }
        this.aItems[nKey] = null;
        this.aRecycler.push(nKey)
    }
}
Object.assign(Legion.prototype, {
    aItems: null,
    aRecycler: null
});
