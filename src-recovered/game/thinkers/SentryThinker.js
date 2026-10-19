import { MobThinker } from './MobThinker.js';

export class SentryThinker extends MobThinker {
    constructor() {
        super();
        this.TIME_REACTIVITY = 4;
        this.nSearchingTime = 2500;
        this.nWalkingTime = 0;
        this.nWanderingTime = 0
    }

    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            this.setAttackMode()
        }
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
}
