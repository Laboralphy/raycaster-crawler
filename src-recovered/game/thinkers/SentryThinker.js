O2.createObject('SentryThinker', class SentryThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            this.setAttackMode()
        }
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
});
Object.assign(SentryThinker.prototype, {
    TIME_REACTIVITY: 4,
    nSearchingTime: 2500,
    nWalkingTime: 0,
    nWanderingTime: 0
});
