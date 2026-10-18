export class Animation {
    nStart = 0;
    nIndex = 0;
    nCount = 0;
    nDuration = 0;
    nTime = 0;
    nLoop = 0;
    nFrame = 0;
    nDirLoop = 1;

    assign(a) {
        if (a) {
            this.nStart = a.nStart;
            this.nCount = a.nCount;
            this.nDuration = a.nDuration;
            this.nLoop = a.nLoop;
            this.nIndex = a.nIndex % this.nCount;
            this.nTime = a.nTime % this.nDuration
        } else {
            this.nCount = 0
        }
    }

    animate(nInc) {
        if (this.nCount <= 1 || this.nDuration === 0) {
            return this.nIndex + this.nStart
        }
        this.nTime += nInc;
        if (this.nTime >= this.nDuration) {
            this.nTime -= this.nDuration;
            this.nIndex += this.nDirLoop
        }
        if (this.nTime >= this.nDuration) {
            this.nIndex += this.nDirLoop * (this.nTime / this.nDuration | 0);
            this.nTime %= this.nDuration
        }
        switch (this.nLoop) {
            case 1:
                if (this.nIndex >= this.nCount) {
                    this.nIndex = 0
                }
                break;
            case 2:
                if (this.nIndex >= this.nCount) {
                    this.nIndex = this.nCount - 2;
                    this.nDirLoop = -1
                }
                if (this.nIndex <= 0) {
                    this.nDirLoop = 1;
                    this.nIndex = 0
                }
                break;
            default:
                if (this.nIndex >= this.nCount) {
                    this.nIndex = this.nCount - 1
                }
        }
        this.nFrame = this.nIndex + this.nStart;
        return this.nFrame
    }

    reset() {
        this.nIndex = 0;
        this.nTime = 0;
        this.nDirLoop = 1
    }
}
