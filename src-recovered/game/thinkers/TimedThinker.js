O2.createObject('TimedThinker', class TimedThinker extends O876_Raycaster.Thinker {
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
});
Object.assign(TimedThinker.prototype, {
    nTimeOut: 0
});
