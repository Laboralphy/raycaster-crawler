O2.createObject('BoomerThinker', class BoomerThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget())
        }
        var nCT = this.move();
        if (nCT == this.COLLISION_TARGET) {
            this.setCastMode(0)
        }
    }

    _cast(nTime) {
        this.oGame.gc_attack(this.oMobile, -1);
        this.think = this.thinkDie
    }

    _attack(nTime) {}
});
