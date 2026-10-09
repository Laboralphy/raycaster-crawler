O2.createObject('Astar.NoodList', class NoodList {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aList = {}
    }

    add(oNood) {
        this.set(oNood.oPos.x, oNood.oPos.y, oNood)
    }

    set(x, y, oNood) {
        this.aList[this.getKey(x, y)] = oNood
    }

    count() {
        var n = 0,
            i = '';
        for (i in this.aList) {
            n++
        }
        return n
    }

    exists(x, y) {
        if (this.getKey(x, y) in this.aList) {
            return true
        } else {
            return false
        }
    }

    getKey(x, y) {
        return x.toString() + '__' + y.toString()
    }

    get(x, y) {
        if (this.exists(x, y)) {
            return this.aList[this.getKey(x, y)]
        } else {
            return null
        }
    }

    del(x, y) {
        delete this.aList[this.getKey(x, y)]
    }

    empty() {
        var i = '';
        for (i in this.aList) {
            return false
        }
        return true
    }
});
Object.assign(Astar.NoodList.prototype, {
    aList: null
});
