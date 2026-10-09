O2.createObject('DasherThinker', class DasherThinker extends MobThinker {
    _follow(nTime) {
        for (var i = 0; i < 3; ++i) {
            switch (this.move()) {
                case this.COLLISION_TARGET:
                    if (this.getTarget() == this.oMobile.oMobileCollision) {
                        this.oGame.gc_attack(this.oMobile, 0)
                    }
                    this.oGame.gc_attack(this.oMobile, 0);
                    this.setAttackMode();
                    break;
                case this.COLLISION_WALL_X:
                case this.COLLISION_WALL_Y:
                case this.COLLISION_MOBILE:
                    this.setWanderMode();
                    break
            }
        }
    }

    _attack(nTime) {
        this.chaseTarget(this.getTarget());
        this.oGame.gc_attack(this.oMobile, 0)
    }
});
