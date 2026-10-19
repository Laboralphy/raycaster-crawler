import { MobThinker } from './MobThinker.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class ShooterThinker extends MobThinker {
    constructor() {
        super();
        this.nDodging = 3;
        this.nDodgingTime = 0;
        this.nProbAttackStraf = 40;
        this.nProbAttackDodge = 33
    }

    _follow(nTime) {
        let nCT = null;
        if (this.nDodging < 4) {
            nCT = this.move(this.nDodging)
        }
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            const d = (this.distanceToTarget() | 0) >> 7;
            switch (d) {
                case 0:
                    this.nDodging = 3;
                    if (MathTools.rnd(0, 100) < this.nProbAttackDodge) {
                        this.setAttackMode()
                    }
                    break;
                case 1:
                case 2:
                    if (this.nDodging != 1 && this.nDodging != 2) {
                        this.nDodging = MathTools.rnd(1, 2)
                    }
                    if (MathTools.rnd(0, 100) < this.nProbAttackStraf) {
                        this.setAttackMode()
                    }
                    break;
                default:
                    this.nDodging = 0;
                    break
            }
            switch (nCT) {
                case this.COLLISION_WALL_X:
                case this.COLLISION_WALL_Y:
                    if (this.nDodging === 1) {
                        this.nDodging = 2
                    } else if (this.nDodging === 2) {
                        this.nDodging = 1
                    }
            }
        }
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
}
