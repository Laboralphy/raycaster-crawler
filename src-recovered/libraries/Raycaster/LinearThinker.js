import { Thinker } from './Thinker.js';

export class LinearThinker extends Thinker {
    __construct() {
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
Object.assign(LinearThinker.prototype, {
    nTime: 0,
    nCurrentTime: 0,
    xStart: 0,
    yStart: 0,
    aStart: 0,
    xDelta: 0,
    yDelta: 0
});
