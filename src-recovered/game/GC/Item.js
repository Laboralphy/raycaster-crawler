O2.createObject('GC.Item', class Item {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(sResRef) {
        this.resref = sResRef
    }

    isStackable() {
        return this.stacksize > 1
    }

    isStackFull() {
        return this.stackcount == this.stacksize
    }

    isStackEmpty() {
        return this.stackcount <= 0
    }

    setStackCount(n) {
        this.stackcount = Math.max(0, Math.min(this.stacksize, n));
        return this.stackcount
    }

    stackInc(n) {
        if (n <= 0) {
            return 0
        }
        var nOldCount = this.stackcount;
        this.setStackCount(nOldCount + n);
        return this.stackcount - nOldCount
    }

    stackDec(n) {
        if (n <= 0) {
            return 0
        }
        var nOldCount = this.stackcount;
        this.setStackCount(nOldCount - n);
        return nOldCount - this.stackcount
    }
});
Object.assign(GC.Item.prototype, {
    resref: '',
    stacksize: 1,
    stackcount: 1
});
