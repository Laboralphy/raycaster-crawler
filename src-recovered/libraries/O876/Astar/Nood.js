O2.createObject('Astar.Nood', class Nood {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oParent = new Astar.Point(0, 0);
        this.oPos = new Astar.Point(0, 0)
    }

    isRoot() {
        return this.oParent.x == this.oPos.x && this.oParent.y == this.oPos.y
    }
});
Object.assign(Astar.Nood.prototype, {
    fGCost: 0.0,
    fHCost: 0.0,
    fFCost: 0.0,
    oParent: null,
    oPos: null
});
