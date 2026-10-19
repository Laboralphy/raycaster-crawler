export class Transistate {
    constructor(sFirst) {
        this.nInterval = 160;
        this.oInterval = null;
        this.pDoomloop = null;
        this.sDoomloopType = 'interval';
        this.bPause = false;
        this.nTimeModulo = 0;
        this._sState = '';
        this.bBound = false;
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
