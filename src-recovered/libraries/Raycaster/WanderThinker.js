import { Thinker } from './Thinker.js';
import { MathTools, PI } from './Tools/MathTools.js';

export class WanderThinker extends Thinker {
    __construct() {
        this.aAngles = [0, 0.25 * PI, 0.5 * PI, 0.75 * PI, PI, -0.75 * PI, -0.5 * PI, -0.25 * PI];
        this.nTime = 0;
        this.think = this.thinkInit
    }

    think() {}

    thinkInit() {
        this.oMobile.fSpeed = 2;
        this.think = this.thinkGo
    }

    thinkGo() {
        if (this.nTime <= 0) {
            this.nAngle = MathTools.rnd(0, 7);
            this.oMobile.fTheta = this.aAngles[this.nAngle];
            this.nTime = MathTools.rnd(15, 25) * 4
        } else {
            --this.nTime;
            this.oMobile.moveForward();
            if (this.oMobile.oWallCollision.x != 0 || this.oMobile.oWallCollision.y != 0) {
                this.nTime = 0
            }
        }
    }
}
Object.assign(WanderThinker.prototype, {
    nTime: 0,
    aAngles: null,
    nAngle: 0
});
