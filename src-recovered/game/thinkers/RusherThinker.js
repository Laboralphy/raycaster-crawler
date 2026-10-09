import { MobThinker } from './MobThinker.js';

export class RusherThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget())
        }
        const nCT = this.move();
        if (nCT == this.COLLISION_TARGET) {
            this.setAttackMode()
        }
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
}
