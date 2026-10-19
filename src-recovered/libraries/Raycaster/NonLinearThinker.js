import { Thinker } from './Thinker.js';

export class NonLinearThinker extends Thinker {
    constructor() {
        super();
        this.nCurrentTime = 0;
        this.xStart = 0;
        this.yStart = 0;
        this.aStart = 0;
        this.xEnd = 0;
        this.yEnd = 0;
        this.fWeight = 1;
        this.sFunction = 'smoothstepX2';
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
        let x, y;
        const v = this[this.sFunction](this.nCurrentTime / this.nTime);
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
}
