import { MobThinker } from './MobThinker.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class RushooterThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            if (MathTools.rnd(1, 100) < 25) {
                this.setAttackMode()
            }
        }
        const nCT = this.move();
        if (nCT == this.COLLISION_TARGET) {
            this.setAttackMode()
        }
    }

    _attack(nTime) {
        if (this.isTargetVisible(this.getTarget())) {
            this.oGame.gc_attack(this.oMobile, 0)
        }
    }
}
