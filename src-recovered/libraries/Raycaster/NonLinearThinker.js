O2.createObject('O876_Raycaster.NonLinearThinker', class NonLinearThinker extends O876_Raycaster.Thinker {
    __construct() {
        this.nTime = 0
    }

    processTime() {
        this.nCurrentTime++;
        if (this.nCurrentTime > this.nTime) {
            this.think = this.thinkStop
        }
    }

    setMove(x, y, a, dx, dy, t) {
        if (x !== null && x !== undefined) {
            this.xStart = x
        } else {
            this.xStart = this.oMobile.x
        }
        if (y !== null && y !== undefined) {
            this.yStart = y
        } else {
            this.yStart = this.oMobile.y
        }
        if (a !== null && a !== undefined) {
            this.aStart = a
        } else {
            this.aStart = this.oMobile.fTheta
        }
        if (dx !== null && dx !== undefined) {
            this.xEnd = dx
        }
        if (dy !== null && dy !== undefined) {
            this.yEnd = dy
        }
        if (t !== null && t !== undefined) {
            this.nTime = t
        }
    }

    think() {
        this.think = this.thinkInit
    }

    thinkInit() {
        this.oMobile.setXY(this.xStart, this.yStart);
        this.oMobile.setAngle(this.aStart);
        this.nCurrentTime = 0;
        this.think = this.thinkMove
    }

    thinkMove() {
        var x, y;
        var v = this[this.sFunction](this.nCurrentTime / this.nTime);
        x = this.xEnd * v + (this.xStart * (1 - v));
        y = this.yEnd * v + (this.yStart * (1 - v));
        this.oMobile.setXY(x, y);
        this.processTime()
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

    thinkStop() {}

    thinkIdle() {}
});
Object.assign(O876_Raycaster.NonLinearThinker.prototype, {
    nTime: 0,
    nCurrentTime: 0,
    xStart: 0,
    yStart: 0,
    aStart: 0,
    xEnd: 0,
    yEnd: 0,
    fWeight: 1,
    sFunction: 'smoothstepX2'
});
