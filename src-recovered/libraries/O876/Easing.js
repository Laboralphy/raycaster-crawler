O2.createObject('O876.Easing', class Easing {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.nTime = 0;
        this.iTime = 0
    }

    setMove(x, y, dx, dy, t) {
        if (t === undefined && dy === undefined) {
            t = dx;
            dy = 0;
            dx = y;
            y = 0
        }
        this.xStart = this.x = x;
        this.yStart = this.y = y;
        this.xEnd = dx;
        this.yEnd = dy;
        this.bXCompute = x != dx;
        this.bYCompute = y != dy;
        this.nTime = t;
        this.iTime = 0
    }

    setFunction(sFunction) {
        this.sFunction = sFunction
    }

    move(t) {
        if (t === undefined) {
            t = this.iTime++
        }
        var v = this[this.sFunction](t / this.nTime);
        if (this.bXCompute) {
            this.x = this.xEnd * v + (this.xStart * (1 - v))
        }
        if (this.bYCompute) {
            this.y = this.yEnd * v + (this.yStart * (1 - v))
        }
        return t >= this.nTime
    }

    linear(v) {
        return v
    }

    smoothstep(v) {
        return v * v * (3 - 2 * v)
    }

    smoothstepX2(v) {
        v = v * v * (3 - 2 * v);
        return v * v * (3 - 2 * v)
    }

    smoothstepX3(v) {
        v = v * v * (3 - 2 * v);
        v = v * v * (3 - 2 * v);
        return v * v * (3 - 2 * v)
    }

    squareAccel(v) {
        return v * v
    }

    squareDeccel(v) {
        return 1 - (1 - v) * (1 - v)
    }

    cubeAccel(v) {
        return v * v * v
    }

    cubeDeccel(v) {
        return 1 - (1 - v) * (1 - v) * (1 - v)
    }

    sine(v) {
        return Math.sin(v * 3.14159265 / 2)
    }

    cosine(v) {
        return 0.5 - Math.cos(-v * 3.14159265) * 0.5
    }

    weightAverage(v) {
        return ((v * (this.nTime - 1)) + this.fWeight) / this.nTime
    }

    quinticBezier(v) {
        var ts = v * this.nTime;
        var tc = ts * this.nTime;
        return 4 * tc - 9 * ts + 6 * v
    }
});
Object.assign(O876.Easing.prototype, {
    xStart: 0,
    yStart: 0,
    xEnd: 0,
    yEnd: 0,
    x: 0,
    y: 0,
    bXCompute: true,
    bYCompute: true,
    nTime: 0,
    iTime: 0,
    fWeight: 1,
    sFunction: 'smoothstep'
});
