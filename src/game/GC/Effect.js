export class Effect {
    sEffect = '';
    nTimeOut = 0;
    bExpirable = true;
    bExpired = false;

    expire() {
        this.bExpirable = true;
        this.bExpired = true;
        this.nTimeOut = 0
    }

    setTimeOut(t) {
        this.nTimeOut = t
    }

    isExpired(nTime) {
        return this.bExpired = this.bExpirable && this.nTimeOut <= nTime
    }

    hasExpired() {
        return this.bExpired
    }
}
