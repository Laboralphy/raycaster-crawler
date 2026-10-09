O2.createObject('HealerThinker', class HealerThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            var aMobs = this.oGame.gc_selectMobilesInCircle(this.oMobile.x, this.oMobile.y, 512);
            if (aMobs.length) {
                var iMob = 0;
                var oMob = null;
                var oMobCreature;
                var nMobs = aMobs.length;
                var oMobMostWounded = null;
                var nMobWorstWound = 0;
                for (iMob = 0; iMob < nMobs; iMob++) {
                    oMob = aMobs[iMob];
                    if (oMob.getType() == RC.OBJECT_TYPE_MOB && oMob != this.oMobile) {
                        oMobCreature = oMob.getData('creature');
                        if (oMobCreature.getAttribute('hp') > nMobWorstWound) {
                            nMobWorstWound = oMobCreature.getAttribute('hp');
                            oMobMostWounded = oMob
                        }
                    }
                }
                if (oMobMostWounded) {
                    this.chaseTarget(oMobMostWounded);
                    this.setCastMode(1);
                    return
                }
            }
            if (this.searchForTarget(this.getTarget())) {
                this.chaseTarget(this.getTarget());
                this.setAttackMode()
            } else {
                this.setWanderMode()
            }
        }
    }

    _cast(nTime) {
        this.chaseTarget(this.getTarget());
        this.oGame.gc_attack(this.oMobile, this.nCastingTime);
        this.setSearchMode()
    }

    _attack(nTime) {
        var g = this.oGame;
        g.gc_attack(this.oMobile, 0);
        this.nBoredTime += g.TIME_FACTOR
    }
});
