O2.createObject('CasterThinker', class CasterThinker extends MobThinker {
    castSpell() {
        var n = MathTools.rnd(0, 9);
        switch (n) {
            case 0:
            case 1:
            case 2:
            case 3:
                this.setAttackMode();
                break;
            case 4:
            case 5:
            case 6:
                this.setCastMode(1);
                break;
            case 7:
            case 8:
                this.setCastMode(2);
                break;
            case 9:
                this.setCastMode(3);
                break
        }
    }

    _follow(nTime) {
        var nCT = null;
        if (this.nDodging < 4) {
            nCT = this.move(this.nDodging)
        }
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            var d = (this.distanceToTarget() | 0) >> 7;
            switch (d) {
                case 0:
                    this.nDodging = 3;
                    if (MathTools.rnd(0, 100) < this.nProbAttackDodge) {
                        this.castSpell()
                    }
                    break;
                case 1:
                case 2:
                    if (this.nDodging != 1 && this.nDodging != 2) {
                        this.nDodging = MathTools.rnd(1, 2)
                    }
                    if (MathTools.rnd(0, 100) < this.nProbAttackStraf) {
                        this.castSpell()
                    }
                    break;
                default:
                    this.nDodging = 0;
                    break
            }
            switch (nCT) {
                case this.COLLISION_WALL_X:
                case this.COLLISION_WALL_Y:
                    if (this.nDodging == 1) {
                        this.nDodging = 2
                    } else if (this.nDodging == 2) {
                        this.nDodging = 1
                    }
            }
        }
    }

    _cast(nTime) {
        this.chaseTarget(this.getTarget());
        this.oGame.gc_attack(this.oMobile, this.nCastingTime);
        this.setSearchMode()
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
});
Object.assign(CasterThinker.prototype, {
    nDodging: 3
});
