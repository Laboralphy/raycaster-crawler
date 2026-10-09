export class Transistate {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(sFirst) {
        this.setDoomloop(sFirst)
    }

    setDoomloop(sProc) {
        this.pDoomloop = this[this._sState = sProc]
    }

    getDoomLoop() {
        return this._sState
    }

    initDoomloop() {
        this.pDoomloop();
        this.pause();
        this.oInterval = setInterval(this.doomloop.bind(this), this.nInterval);
        this.bBound = true
    }

    doomloop() {
        this.pDoomloop()
    }

    pause() {
        this.bPause = true;
        if (this.oInterval) {
            clearInterval(this.oInterval);
            this.oInterval = null
        }
    }

    resume() {
        this.pause();
        this.bPause = false;
        this.initDoomloop()
    }
}
Object.assign(Transistate.prototype, {
    nInterval: 160,
    oInterval: null,
    pDoomloop: null,
    sDoomloopType: 'interval',
    bPause: false,
    nTimeModulo: 0,
    _sState: '',
    bBound: false
});
