O2.createObject('O876_Raycaster.FrameCounter', class FrameCounter {
    start(nTimeStamp) {
        this.nTimeStart = nTimeStamp;
        this.bCheck = true;
        this.nCount = 0
    }

    getAvgFPS() {
        return ((this.nAcc / this.nSeconds) * 10 | 0) / 10
    }

    check(nNowTimeStamp) {
        if (this.bCheck) {
            ++this.nCount;
            if ((nNowTimeStamp - this.nTimeStart) >= 1000) {
                this.nFPS = this.nCount;
                this.nAcc += this.nCount;
                ++this.nSeconds;
                this.bCheck = this.bLoop;
                if (this.bCheck) {
                    this.start(nNowTimeStamp)
                }
                return true
            }
        }
        return false
    }
});
Object.assign(O876_Raycaster.FrameCounter.prototype, {
    bCheck: false,
    bLoop: true,
    nFPS: 0,
    nTimeStart: 0,
    nCount: 0,
    nSeconds: 0,
    nAcc: 0
});
