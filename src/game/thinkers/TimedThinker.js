import { Thinker } from '../../libraries/Raycaster/Thinker.js';

export class TimedThinker extends Thinker {
    constructor() {
        super();
        this.nTimeOut = 0
    }

    start(t) {
        this.nTimeOut = this.oGame.nTimeMs + t;
        this.think = this.thinkAlive
    }

    thinkAlive() {
        if (this.oGame.nTimeMs > this.nTimeOut) {
            this.think = this.thinkDead
        }
    }

    thinkDead() {
        this.oMobile.bActive = false
    }
}
