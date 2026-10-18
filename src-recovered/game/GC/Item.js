export class Item {
    constructor(sResRef) {
        this.resref = sResRef;
        this.stacksize =  1;
        this.stackcount = 1;
    }

    isStackable() {
        return this.stacksize > 1;
    }

    isStackFull() {
        return this.stackcount === this.stacksize
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
        const nOldCount = this.stackcount;
        this.setStackCount(nOldCount + n);
        return this.stackcount - nOldCount
    }

    stackDec(n) {
        if (n <= 0) {
            return 0
        }
        const nOldCount = this.stackcount;
        this.setStackCount(nOldCount - n);
        return nOldCount - this.stackcount
    }
}
