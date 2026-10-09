export class Point {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(x, y) {
        this.x = x;
        this.y = y
    }
}
Object.assign(Point.prototype, {
    x: 0,
    y: 0
});
