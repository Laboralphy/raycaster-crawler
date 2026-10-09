O2.createObject('Astar.Point', class Point {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(x, y) {
        this.x = x;
        this.y = y
    }
});
Object.assign(Astar.Point.prototype, {
    x: 0,
    y: 0
});
