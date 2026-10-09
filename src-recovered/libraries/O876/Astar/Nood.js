import { Point } from './Point.js';

export class Nood {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oParent = new Point(0, 0);
        this.oPos = new Point(0, 0)
    }

    isRoot() {
        return this.oParent.x == this.oPos.x && this.oParent.y == this.oPos.y
    }
}
Object.assign(Nood.prototype, {
    fGCost: 0.0,
    fHCost: 0.0,
    fFCost: 0.0,
    oParent: null,
    oPos: null
});
