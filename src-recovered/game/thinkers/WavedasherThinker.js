O2.createObject('WavedasherThinker', class WavedasherThinker extends DasherThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            this.oMobile.rotate(Math.random() - 0.5)
        }
        super._follow()
    }
});
