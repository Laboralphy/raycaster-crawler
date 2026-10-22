import { Thinker } from './Thinker.js';

export class LinearThinker extends Thinker {
    constructor() {
        super();
        this.nCurrentTime = 0;
        this.xStart = 0;
        this.yStart = 0;
        this.aStart = 0;
        this.xDelta = 0;
        this.yDelta = 0;
        this.nTime = 0
    }

    think() {
        this.think = this.thinkInit
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
            this.xDelta = dx
        }
        if (dy !== null && dy !== undefined) {
            this.yDelta = dy
        }
        if (t !== null && t !== undefined) {
            this.nTime = t
        }
    }

    thinkInit() {
        this.oMobile.setXY(this.xStart, this.yStart);
        this.oMobile.setAngle(this.aStart);
        this.nCurrentTime = 0;
        this.think = this.thinkDeltaMove
    }

    thinkDeltaMove() {
        this.oMobile.slide(this.xDelta, this.yDelta);
        this.nCurrentTime++;
        if (this.nCurrentTime > this.nTime) {
            this.think = this.thinkStop
        }
    }

    thinkStop() {}

    thinkIdle() {}
}
